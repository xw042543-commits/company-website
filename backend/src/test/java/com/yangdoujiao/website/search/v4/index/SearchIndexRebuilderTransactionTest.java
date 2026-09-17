package com.yangdoujiao.website.search.v4.index;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;

@ExtendWith(MockitoExtension.class)
class SearchIndexRebuilderTransactionTest {

    @Mock SearchIndexManager manager;
    @Mock UniversitySearchProjectionLoader loader;
    @Mock ElasticsearchOperations operations;
    @Mock IndexOperations indexOperations;
    @Mock JdbcTemplate jdbc;
    @Mock PlatformTransactionManager transactions;

    @AfterEach
    void clearThreadTransactionState() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void rejectsAnAmbientTransactionBeforeAnyDatabaseOrElasticsearchOperation() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        SearchIndexProperties properties = new SearchIndexProperties();

        assertThatThrownBy(() -> new SearchIndexRebuilder(manager, loader, operations, jdbc, properties,
                transactions).rebuild())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Search index rebuild must not run within an active transaction");

        verifyNoInteractions(manager, loader, operations, jdbc, transactions);
    }

    @Test
    void capturesPublishedIdsInAShortReadOnlyTransactionBeforeElasticsearchWork() {
        AtomicBoolean transactionActive = new AtomicBoolean();
        TransactionStatus status = mock(TransactionStatus.class);
        when(transactions.getTransaction(any(TransactionDefinition.class))).thenAnswer(invocation -> {
            transactionActive.set(true);
            return status;
        });
        doAnswer(invocation -> {
            assertThat(transactionActive).isTrue();
            return List.of();
        }).when(jdbc).queryForList(anyString(), eq(Long.class));
        doAnswer(invocation -> {
            transactionActive.set(false);
            return null;
        }).when(transactions).commit(status);
        when(manager.createVersionedIndex()).thenAnswer(invocation -> {
            assertThat(transactionActive).isFalse();
            return "universities-v4-test";
        });
        when(operations.indexOps(any(IndexCoordinates.class))).thenReturn(indexOperations);
        when(operations.count(any(Query.class), eq(UniversityProgrammeSearchDocument.class),
                any(IndexCoordinates.class))).thenReturn(0L);

        SearchIndexProperties properties = new SearchIndexProperties();
        new SearchIndexRebuilder(manager, loader, operations, jdbc, properties, transactions).rebuild();

        ArgumentCaptor<TransactionDefinition> definition = ArgumentCaptor.forClass(TransactionDefinition.class);
        verify(transactions).getTransaction(definition.capture());
        assertThat(definition.getValue().isReadOnly()).isTrue();
        verify(transactions).commit(status);
        verify(manager).swapAliases("universities-v4-test");
    }
}
