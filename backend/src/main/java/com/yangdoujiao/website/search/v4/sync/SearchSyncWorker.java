package com.yangdoujiao.website.search.v4.sync;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.index.SearchIndexNames;
import com.yangdoujiao.website.search.v4.index.UniversitySearchProjectionLoader;

@Service
public class SearchSyncWorker {

    private static final Logger log = LoggerFactory.getLogger(SearchSyncWorker.class);

    private final SearchSyncJobClaimer claimer;
    private final UniversitySearchProjectionLoader loader;
    private final ElasticsearchOperations operations;
    private final SearchSyncConfiguration.SearchSyncProperties properties;
    private final Clock clock;

    public SearchSyncWorker(SearchSyncJobClaimer claimer, UniversitySearchProjectionLoader loader,
            ElasticsearchOperations operations, SearchSyncConfiguration.SearchSyncProperties properties, Clock clock) {
        this.claimer = claimer;
        this.loader = loader;
        this.operations = operations;
        this.properties = properties;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${app.search.sync.poll-interval-ms:5000}")
    public void runOnce() {
        Instant now = clock.instant();
        for (SearchSyncJobClaimer.ClaimedJob job : claimer.claimJobs(properties.getBatchSize(), now)) {
            process(job, now);
        }
    }

    private void process(SearchSyncJobClaimer.ClaimedJob job, Instant claimedAt) {
        try {
            loader.loadPublishedUniversity(job.universityId())
                    .ifPresentOrElse(this::saveDocument, () -> deleteDocument(job.universityId()));
            claimer.complete(job);
        } catch (RuntimeException failure) {
            recordFailure(job, claimedAt, failure);
        }
    }

    private void saveDocument(UniversityProgrammeSearchDocument document) {
        operations.save(document, IndexCoordinates.of(SearchIndexNames.WRITE_ALIAS));
    }

    private void deleteDocument(long universityId) {
        operations.delete(String.valueOf(universityId), IndexCoordinates.of(SearchIndexNames.WRITE_ALIAS));
    }

    private void recordFailure(SearchSyncJobClaimer.ClaimedJob job, Instant claimedAt, RuntimeException failure) {
        int nextAttempt = job.attemptCount() + 1;
        String errorSummary = safeErrorSummary(failure);
        log.warn("Search sync job failed jobId={} universityId={} attempt={} maxAttempts={} error={}",
                job.id(), job.universityId(), nextAttempt, properties.getMaxAttempts(), errorSummary);
        if (nextAttempt >= properties.getMaxAttempts()) {
            claimer.fail(job, nextAttempt, claimedAt, errorSummary);
        } else {
            claimer.retry(job, nextAttempt, retryAt(claimedAt, nextAttempt), claimedAt, errorSummary);
        }
    }

    private Instant retryAt(Instant failedAt, int attemptCount) {
        Duration delay = properties.getRetryDelay().multipliedBy(attemptCount);
        return failedAt.plus(delay);
    }

    private String safeErrorSummary(RuntimeException failure) {
        return "Elasticsearch projection sync failed: " + failure.getClass().getSimpleName();
    }
}
