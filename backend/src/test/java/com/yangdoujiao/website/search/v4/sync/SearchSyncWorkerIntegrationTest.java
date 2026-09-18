package com.yangdoujiao.website.search.v4.sync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.AdditionalAnswers.delegatesTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.index.SearchIndexManager;
import com.yangdoujiao.website.search.v4.index.SearchIndexNames;
import com.yangdoujiao.website.search.v4.index.UniversitySearchProjectionLoader;

@SpringBootTest
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, SearchSyncWorkerIntegrationTest.FixedClockConfiguration.class})
@ExtendWith(OutputCaptureExtension.class)
class SearchSyncWorkerIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-09-18T04:05:06Z");

    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired SearchSyncJobClaimer claimer;
    @Autowired SearchSyncWorker worker;
    @Autowired SearchSyncConfiguration.SearchSyncProperties properties;
    @Autowired UniversitySearchProjectionLoader loader;
    @Autowired ElasticsearchOperations operations;
    @Autowired SearchIndexManager indexManager;

    private final List<String> createdIndices = new ArrayList<>();
    private TransactionTemplate transactions;

    @BeforeEach
    void prepareDatabaseAndSearchIndex() {
        transactions = new TransactionTemplate(transactionManager);
        jdbc.update("DELETE FROM search_sync_jobs");
        prepareWriteAlias();
    }

    @AfterEach
    void removeFixtures() {
        try {
            createdIndices.forEach(name -> operations.indexOps(IndexCoordinates.of(name)).delete());
        } finally {
            jdbc.update("DELETE FROM search_sync_jobs");
            jdbc.update("""
                    DELETE FROM programmes WHERE university_id IN (
                        SELECT id FROM universities WHERE slug LIKE 'sync-%'
                    )
                    """);
            jdbc.update("DELETE FROM universities WHERE slug LIKE 'sync-%'");
            jdbc.update("DELETE FROM subject_categories WHERE code LIKE 'SYNC_%'");
        }
    }

    @Test
    void claimBatchSkipsRowsLockedByAnotherPostgresTransaction() throws Exception {
        long lockedJob = insertJob(8101L, "PENDING", 0, NOW.minusSeconds(30), null);
        long availableJob = insertJob(8102L, "PENDING", 0, NOW.minusSeconds(30), null);
        CountDownLatch locked = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        var lockExecutor = Executors.newSingleThreadExecutor();
        var claimExecutor = Executors.newSingleThreadExecutor();
        try {
            var lockFuture = lockExecutor.submit(() -> transactions.executeWithoutResult(status -> {
                jdbc.queryForObject("SELECT id FROM search_sync_jobs WHERE id = ? FOR UPDATE",
                        Long.class, lockedJob);
                locked.countDown();
                await(release);
            }));
            assertThat(locked.await(5, TimeUnit.SECONDS)).isTrue();

            var claimFuture = claimExecutor.submit(() -> claimer.claimJobs(2, NOW));

            assertThat(claimFuture.get(2, TimeUnit.SECONDS))
                    .extracting(SearchSyncJobClaimer.ClaimedJob::id)
                    .containsExactly(availableJob);
            assertThat(claimer.claimBatch(1, NOW)).isEmpty();

            release.countDown();
            lockFuture.get(5, TimeUnit.SECONDS);
        } finally {
            release.countDown();
            lockExecutor.shutdownNow();
            claimExecutor.shutdownNow();
        }
    }

    @Test
    void concurrentClaimersNeverReceiveTheSameJob() throws Exception {
        for (long universityId = 8201L; universityId <= 8206L; universityId++) {
            insertJob(universityId, "PENDING", 0, NOW.minusSeconds(30), null);
        }
        CountDownLatch start = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        try {
            var first = executor.submit(() -> {
                await(start);
                return claimer.claimJobs(4, NOW);
            });
            var second = executor.submit(() -> {
                await(start);
                return claimer.claimJobs(4, NOW);
            });

            start.countDown();

            List<Long> claimedIds = new ArrayList<>();
            first.get(5, TimeUnit.SECONDS).forEach(job -> claimedIds.add(job.id()));
            second.get(5, TimeUnit.SECONDS).forEach(job -> claimedIds.add(job.id()));
            assertThat(claimedIds).doesNotHaveDuplicates().hasSize(6);
            assertThat(jdbc.queryForList("""
                    SELECT id FROM search_sync_jobs WHERE status = 'PROCESSING' ORDER BY id
                    """, Long.class)).containsExactlyElementsOf(claimedIds.stream().sorted().toList());
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void workerDoesNotKeepDatabaseTransactionOpenDuringElasticsearchIo() {
        long universityId = 8301L;
        insertJob(universityId, "PENDING", 0, NOW.minusSeconds(30), null);
        UniversitySearchProjectionLoader projectionLoader = mock(UniversitySearchProjectionLoader.class);
        org.mockito.Mockito.when(projectionLoader.loadPublishedUniversity(universityId))
                .thenReturn(Optional.of(document(universityId)));
        ElasticsearchOperations observedOperations = mock(ElasticsearchOperations.class);
        doAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            return invocation.getArgument(0);
        }).when(observedOperations).save(any(UniversityProgrammeSearchDocument.class), any(IndexCoordinates.class));
        SearchSyncWorker isolatedWorker = new SearchSyncWorker(claimer, projectionLoader, observedOperations,
                properties, Clock.fixed(NOW, ZoneOffset.UTC));

        isolatedWorker.runOnce();

        assertThat(jdbc.queryForList("SELECT id FROM search_sync_jobs", Long.class)).isEmpty();
    }

    @Test
    void publishedUniversityIsSavedAndOnlyTheClaimedJobIsDeletedWhenANewChangeArrivesDuringProcessing() {
        long universityId = publishedUniversity("SYNC_SAVE");
        long originalJob = insertJob(universityId, "PENDING", 0, NOW.minusSeconds(30), null);
        UniversitySearchProjectionLoader changingLoader = mock(UniversitySearchProjectionLoader.class,
                delegatesTo(loader));
        AtomicBoolean insertedNewChange = new AtomicBoolean();
        doAnswer(invocation -> {
            if (insertedNewChange.compareAndSet(false, true)) {
                insertJob(universityId, "PENDING", 0, NOW, null);
            }
            return loader.loadPublishedUniversity(universityId);
        }).when(changingLoader).loadPublishedUniversity(universityId);
        SearchSyncWorker isolatedWorker = new SearchSyncWorker(claimer, changingLoader, operations,
                properties, Clock.fixed(NOW, ZoneOffset.UTC));

        isolatedWorker.runOnce();
        refreshWriteAlias();

        assertThat(documentCount()).isEqualTo(1);
        assertThat(jdbc.queryForList("SELECT id FROM search_sync_jobs WHERE id = ?", Long.class, originalJob))
                .isEmpty();
        assertThat(jdbc.queryForList("""
                SELECT status FROM search_sync_jobs WHERE university_id = ? ORDER BY id
                """, String.class, universityId)).containsExactly("PENDING");
    }

    @Test
    void unpublishedUniversityDeletesExistingDocumentAndCompletesJob() {
        long universityId = draftUniversity("SYNC_DELETE");
        operations.save(document(universityId), IndexCoordinates.of(SearchIndexNames.WRITE_ALIAS));
        refreshWriteAlias();
        assertThat(documentCount()).isEqualTo(1);
        insertJob(universityId, "PENDING", 0, NOW.minusSeconds(30), null);

        worker.runOnce();
        refreshWriteAlias();

        assertThat(documentCount()).isZero();
        assertThat(jdbc.queryForList("SELECT id FROM search_sync_jobs", Long.class)).isEmpty();
    }

    @Test
    void failedJobRetriesWithDeterministicBackoffWithoutBlockingOtherJobsOrLeakingBusinessText(
            CapturedOutput output) {
        long failingUniversity = publishedUniversity("SYNC_FAILING");
        long successfulUniversity = publishedUniversity("SYNC_SUCCESSFUL");
        long failingJob = insertJob(failingUniversity, "PENDING", 0, NOW.minusSeconds(30), null);
        long successfulJob = insertJob(successfulUniversity, "PENDING", 0, NOW.minusSeconds(30), null);
        UniversitySearchProjectionLoader mixedLoader = mock(UniversitySearchProjectionLoader.class,
                delegatesTo(loader));
        doThrow(new IllegalStateException("SECRET_FULL_ELASTICSEARCH_RESPONSE with programme body"))
                .when(mixedLoader).loadPublishedUniversity(failingUniversity);
        SearchSyncWorker isolatedWorker = new SearchSyncWorker(claimer, mixedLoader, operations,
                properties, Clock.fixed(NOW, ZoneOffset.UTC));

        isolatedWorker.runOnce();
        refreshWriteAlias();

        Map<String, Object> retry = jdbc.queryForMap("""
                SELECT status, attempt_count, available_at, locked_at, last_error, updated_at
                FROM search_sync_jobs WHERE id = ?
                """, failingJob);
        assertThat(retry.get("status")).isEqualTo("PENDING");
        assertThat(retry.get("attempt_count")).isEqualTo(1);
        assertThat(((Timestamp) retry.get("available_at")).toInstant())
                .isEqualTo(NOW.plus(properties.getRetryDelay()));
        assertThat(retry.get("locked_at")).isNull();
        assertThat(((Timestamp) retry.get("updated_at")).toInstant()).isEqualTo(NOW);
        assertThat((String) retry.get("last_error"))
                .contains("IllegalStateException")
                .doesNotContain("SECRET_FULL_ELASTICSEARCH_RESPONSE", "programme body");
        assertThat(jdbc.queryForList("SELECT id FROM search_sync_jobs WHERE id = ?", Long.class, successfulJob))
                .isEmpty();
        assertThat(documentCount()).isEqualTo(1);
        assertThat(output.getAll()).contains("Search sync job failed")
                .doesNotContain("SECRET_FULL_ELASTICSEARCH_RESPONSE", "programme body");
    }

    @Test
    void finalAllowedAttemptMarksJobFailed() {
        long universityId = publishedUniversity("SYNC_FINAL_FAILURE");
        long jobId = insertJob(universityId, "PENDING", properties.getMaxAttempts() - 1,
                NOW.minusSeconds(30), null);
        UniversitySearchProjectionLoader failingLoader = mock(UniversitySearchProjectionLoader.class);
        doThrow(new IllegalStateException("SECRET_INDEX_RESPONSE")).when(failingLoader)
                .loadPublishedUniversity(universityId);
        SearchSyncWorker isolatedWorker = new SearchSyncWorker(claimer, failingLoader, operations,
                properties, Clock.fixed(NOW, ZoneOffset.UTC));

        isolatedWorker.runOnce();

        Map<String, Object> failed = jdbc.queryForMap("""
                SELECT status, attempt_count, locked_at, last_error FROM search_sync_jobs WHERE id = ?
                """, jobId);
        assertThat(failed.get("status")).isEqualTo("FAILED");
        assertThat(failed.get("attempt_count")).isEqualTo(properties.getMaxAttempts());
        assertThat(failed.get("locked_at")).isNull();
        assertThat((String) failed.get("last_error"))
                .contains("IllegalStateException")
                .doesNotContain("SECRET_INDEX_RESPONSE");
    }

    @Test
    void expiredProcessingJobsAreRecoveredButFreshProcessingJobsRemainUntouched() {
        long expiredUniversity = publishedUniversity("SYNC_EXPIRED");
        long freshUniversity = publishedUniversity("SYNC_FRESH");
        long freshJob = insertJob(freshUniversity, "PROCESSING", 0, NOW.minusSeconds(30), NOW.minusSeconds(20));
        insertJob(expiredUniversity, "PROCESSING", 0, NOW.minusSeconds(30),
                NOW.minus(properties.getLockTimeout()).minusSeconds(1));

        worker.runOnce();
        refreshWriteAlias();

        assertThat(documentCount()).isEqualTo(1);
        assertThat(jdbc.queryForList("""
                SELECT status FROM search_sync_jobs WHERE id = ?
                """, String.class, freshJob)).containsExactly("PROCESSING");
    }

    @Test
    void staleOwnerCannotCompleteRetryOrFailJobAfterAnotherWorkerReclaimsIt() {
        for (StaleOwnerAction action : StaleOwnerAction.values()) {
            jdbc.update("DELETE FROM search_sync_jobs");
            long jobId = insertJob(8401L + action.ordinal(), "PENDING", 0, NOW.minusSeconds(30), null);
            SearchSyncJobClaimer.ClaimedJob staleClaim = claimer.claimJobs(1, NOW).getFirst();
            Instant reclaimTime = NOW.plus(properties.getLockTimeout()).plusSeconds(1);

            SearchSyncJobClaimer.ClaimedJob currentClaim = claimer.claimJobs(1, reclaimTime).getFirst();
            action.apply(claimer, staleClaim);

            List<Map<String, Object>> rows = jdbc.queryForList("""
                    SELECT id, status, attempt_count, locked_at, last_error
                    FROM search_sync_jobs WHERE id = ?
                    """, jobId);
            assertThat(rows).as(action + " must not remove the reclaimed job").hasSize(1);
            Map<String, Object> row = rows.getFirst();
            assertThat(row.get("status")).as(action + " must not change status").isEqualTo("PROCESSING");
            assertThat(row.get("attempt_count")).as(action + " must not change attempts")
                    .isEqualTo(currentClaim.attemptCount());
            assertThat(((Timestamp) row.get("locked_at")).toInstant())
                    .as(action + " must not change the current lock").isEqualTo(reclaimTime);
            assertThat(row.get("last_error")).as(action + " must not write stale errors").isNull();
        }
    }

    @Test
    void workerSchedulesReconciliationWhenLeaseExpiresDuringElasticsearchWrite() {
        long universityId = publishedUniversity("SYNC_LOST_LEASE");
        insertJob(universityId, "PENDING", 0, NOW.minusSeconds(30), null);
        Instant reclaimTime = NOW.plus(properties.getLockTimeout()).plusSeconds(1);
        AtomicReference<SearchSyncJobClaimer.ClaimedJob> currentClaim = new AtomicReference<>();
        ElasticsearchOperations reclaimingOperations = mock(ElasticsearchOperations.class,
                delegatesTo(operations));
        doAnswer(invocation -> {
            currentClaim.set(claimer.claimJobs(1, reclaimTime).getFirst());
            return operations.save(
                    invocation.getArgument(0, UniversityProgrammeSearchDocument.class),
                    invocation.getArgument(1, IndexCoordinates.class));
        }).when(reclaimingOperations).save(
                any(UniversityProgrammeSearchDocument.class), any(IndexCoordinates.class));
        SearchSyncWorker isolatedWorker = new SearchSyncWorker(claimer, loader, reclaimingOperations,
                properties, Clock.fixed(NOW, ZoneOffset.UTC));

        isolatedWorker.runOnce();

        assertThat(currentClaim.get()).isNotNull();
        assertThat(jdbc.queryForList("""
                SELECT status
                FROM search_sync_jobs
                WHERE university_id = ?
                ORDER BY id
                """, String.class, universityId))
                .containsExactly("PROCESSING", "PENDING");
    }

    private void prepareWriteAlias() {
        String indexName = "sync-worker-" + UUID.randomUUID();
        createdIndices.add(indexName);
        IndexOperations index = operations.indexOps(IndexCoordinates.of(indexName));
        index.create(index.createSettings(UniversityProgrammeSearchDocument.class),
                index.createMapping(UniversityProgrammeSearchDocument.class));
        indexManager.swapAliases(indexName);
    }

    private long insertJob(long universityId, String status, int attempts, Instant availableAt, Instant lockedAt) {
        return jdbc.queryForObject("""
                INSERT INTO search_sync_jobs (university_id, status, attempt_count, available_at, locked_at)
                VALUES (?, ?, ?, ?, ?) RETURNING id
                """, Long.class, universityId, status, attempts, Timestamp.from(availableAt),
                lockedAt == null ? null : Timestamp.from(lockedAt));
    }

    private long publishedUniversity(String code) {
        long category = category(code);
        long university = university(code, "PUBLISHED");
        jdbc.update("""
                INSERT INTO programmes (university_id, subject_category_id, programme_code, slug, name_en, status)
                VALUES (?, ?, ?, ?, ?, 'PUBLISHED')
                """, university, category, code + "_PROGRAMME", code.toLowerCase() + "-programme",
                code + " programme");
        return university;
    }

    private long draftUniversity(String code) {
        long category = category(code);
        long university = university(code, "DRAFT");
        jdbc.update("""
                INSERT INTO programmes (university_id, subject_category_id, programme_code, slug, name_en, status)
                VALUES (?, ?, ?, ?, ?, 'PUBLISHED')
                """, university, category, code + "_PROGRAMME", code.toLowerCase() + "-programme",
                code + " programme");
        return university;
    }

    private long university(String code, String status) {
        String normalized = code.toLowerCase().replace('_', '-');
        return jdbc.queryForObject("""
                INSERT INTO universities (name, slug, country, university_code, name_en, status)
                VALUES (?, ?, 'Malaysia', ?, ?, ?) RETURNING id
                """, Long.class, code + " legacy name", "sync-" + normalized, code,
                code + " university", status);
    }

    private long category(String code) {
        return jdbc.queryForObject("""
                INSERT INTO subject_categories (code, name_en, status)
                VALUES (?, ?, 'PUBLISHED') RETURNING id
                """, Long.class, code + "_CATEGORY", code + " category");
    }

    private UniversityProgrammeSearchDocument document(long universityId) {
        return new UniversityProgrammeSearchDocument(universityId, "SYNC", "sync-" + universityId,
                null, "Sync university", "MY", null, "Malaysia", null, null, false, List.of());
    }

    private long documentCount() {
        return operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class,
                IndexCoordinates.of(SearchIndexNames.WRITE_ALIAS));
    }

    private void refreshWriteAlias() {
        operations.indexOps(IndexCoordinates.of(SearchIndexNames.WRITE_ALIAS)).refresh();
    }

    private void await(CountDownLatch latch) {
        try {
            assertThat(latch.await(5, TimeUnit.SECONDS)).isTrue();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssertionError(exception);
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(NOW, ZoneOffset.UTC);
        }
    }

    private enum StaleOwnerAction {
        COMPLETE {
            @Override
            void apply(SearchSyncJobClaimer claimer, SearchSyncJobClaimer.ClaimedJob staleClaim) {
                claimer.complete(staleClaim);
            }
        },
        RETRY {
            @Override
            void apply(SearchSyncJobClaimer claimer, SearchSyncJobClaimer.ClaimedJob staleClaim) {
                claimer.retry(staleClaim, staleClaim.attemptCount() + 1,
                        NOW.plusSeconds(30), NOW, "safe stale retry");
            }
        },
        FAIL {
            @Override
            void apply(SearchSyncJobClaimer claimer, SearchSyncJobClaimer.ClaimedJob staleClaim) {
                claimer.fail(staleClaim, staleClaim.attemptCount() + 1, NOW, "safe stale failure");
            }
        };

        abstract void apply(SearchSyncJobClaimer claimer, SearchSyncJobClaimer.ClaimedJob staleClaim);
    }
}
