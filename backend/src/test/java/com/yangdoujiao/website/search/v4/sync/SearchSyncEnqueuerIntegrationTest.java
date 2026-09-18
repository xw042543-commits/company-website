package com.yangdoujiao.website.search.v4.sync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({SearchSyncEnqueuer.class, SearchSyncEnqueuerIntegrationTest.ClockConfiguration.class})
@Testcontainers
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class SearchSyncEnqueuerIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-09-18T01:02:03Z");

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.11")
            .withDatabaseName("search_sync_enqueuer_test");

    @Autowired SearchSyncEnqueuer enqueuer;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactionManager;

    private TransactionTemplate transactions;

    @BeforeEach
    void cleanJobs() {
        jdbc.update("DELETE FROM search_sync_jobs");
        transactions = new TransactionTemplate(transactionManager);
    }

    @Test
    void committedBusinessTransactionPersistsJobButRollbackRemovesIt() {
        transactions.executeWithoutResult(status -> enqueuer.enqueue(7001L));

        assertThat(universityIds()).containsExactly(7001L);

        transactions.executeWithoutResult(status -> {
            enqueuer.enqueue(7002L);
            status.setRollbackOnly();
        });

        assertThat(universityIds()).containsExactly(7001L);
    }

    @Test
    void rejectsEnqueueOutsideBusinessTransaction() {
        assertThatThrownBy(() -> enqueuer.enqueue(7003L))
                .isInstanceOf(IllegalTransactionStateException.class);
    }

    @Test
    void recordsEveryChangeForSameUniversityWithoutUnsafeDeduplication() {
        transactions.executeWithoutResult(status -> {
            enqueuer.enqueue(7004L);
            enqueuer.enqueue(7004L);
        });

        assertThat(jdbc.queryForList("""
                SELECT university_id, status, attempt_count, available_at, locked_at, last_error
                FROM search_sync_jobs ORDER BY id
                """)).hasSize(2).allSatisfy(row -> {
                    assertThat(row.get("university_id")).isEqualTo(7004L);
                    assertThat(row.get("status")).isEqualTo("PENDING");
                    assertThat(row.get("attempt_count")).isEqualTo(0);
                    assertThat(((Timestamp) row.get("available_at")).toInstant()).isEqualTo(NOW);
                    assertThat(row.get("locked_at")).isNull();
                    assertThat(row.get("last_error")).isNull();
                });
    }

    private List<Long> universityIds() {
        return jdbc.queryForList("SELECT university_id FROM search_sync_jobs ORDER BY id", Long.class);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ClockConfiguration {
        @Bean
        Clock clock() {
            return Clock.fixed(NOW, ZoneOffset.UTC);
        }

        @Bean
        CacheManager cacheManager() {
            return new NoOpCacheManager();
        }
    }
}
