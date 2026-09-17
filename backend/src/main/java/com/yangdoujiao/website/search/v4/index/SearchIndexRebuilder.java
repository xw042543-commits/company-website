package com.yangdoujiao.website.search.v4.index;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;

@Service
public class SearchIndexRebuilder {

    private final SearchIndexManager manager;
    private final UniversitySearchProjectionLoader loader;
    private final ElasticsearchOperations operations;
    private final JdbcTemplate jdbc;
    private final SearchIndexProperties properties;
    private final TransactionTemplate readOnlyTransactions;

    public SearchIndexRebuilder(SearchIndexManager manager, UniversitySearchProjectionLoader loader,
            ElasticsearchOperations operations, JdbcTemplate jdbc, SearchIndexProperties properties,
            PlatformTransactionManager transactionManager) {
        this.manager = manager;
        this.loader = loader;
        this.operations = operations;
        this.jdbc = jdbc;
        this.properties = properties;
        this.readOnlyTransactions = new TransactionTemplate(transactionManager);
        this.readOnlyTransactions.setReadOnly(true);
    }

    public RebuildResult rebuild() {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("Search index rebuild must not run within an active transaction");
        }
        List<Long> universityIds = findPublishedUniversityIds();
        String indexName = manager.createVersionedIndex();
        IndexCoordinates index = IndexCoordinates.of(indexName);
        int batchSize = properties.getBatchSize();
        for (int offset = 0; offset < universityIds.size(); offset += batchSize) {
            List<UniversityProgrammeSearchDocument> batch = new ArrayList<>();
            for (Long id : universityIds.subList(offset, Math.min(offset + batchSize, universityIds.size()))) {
                batch.add(loader.loadPublishedUniversity(id).orElseThrow(() ->
                        new IllegalStateException("Published search projection changed during rebuild")));
            }
            operations.save(batch, index);
        }
        operations.indexOps(index).refresh();
        long actualCount = operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class, index);
        if (actualCount != universityIds.size()) {
            throw new IllegalStateException("Search index document count does not match expected published count");
        }
        manager.swapAliases(indexName);
        return new RebuildResult(indexName, actualCount);
    }

    private List<Long> findPublishedUniversityIds() {
        // One short PostgreSQL statement captures candidate IDs. ProjectionLoader remains the source
        // of full documents; its per-university read-only transactions do not span Elasticsearch I/O.
        return Objects.requireNonNull(readOnlyTransactions.execute(status -> jdbc.queryForList("""
                SELECT u.id FROM universities u
                WHERE u.status = 'PUBLISHED'
                  AND EXISTS (SELECT 1 FROM programmes p
                              WHERE p.university_id = u.id AND p.status = 'PUBLISHED')
                ORDER BY u.id
                """, Long.class)));
    }

    public record RebuildResult(String indexName, long indexedUniversities) {
    }
}
