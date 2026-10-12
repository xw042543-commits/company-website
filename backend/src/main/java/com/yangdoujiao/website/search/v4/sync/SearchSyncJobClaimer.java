package com.yangdoujiao.website.search.v4.sync;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchSyncJobClaimer {

    private final JdbcTemplate jdbc;
    private final SearchSyncConfiguration.SearchSyncProperties properties;

    public SearchSyncJobClaimer(JdbcTemplate jdbc, SearchSyncConfiguration.SearchSyncProperties properties) {
        this.jdbc = jdbc;
        this.properties = properties;
    }

    @Transactional
    public List<Long> claimBatch(int batchSize, Instant now) {
        return claimJobs(batchSize, now).stream().map(ClaimedJob::universityId).toList();
    }

    @Transactional
    public List<ClaimedJob> claimJobs(int batchSize, Instant now) {
        if (batchSize < 1) {
            throw new IllegalArgumentException("batchSize must be positive");
        }
        Instant expiredBefore = now.minus(properties.getLockTimeout());
        return jdbc.query("""
                WITH candidates AS (
                    SELECT id
                    FROM search_sync_jobs
                    WHERE (status = 'PENDING' AND available_at <= ?)
                       OR (status = 'PROCESSING' AND locked_at < ?)
                    ORDER BY available_at ASC, id ASC
                    LIMIT ?
                    FOR UPDATE SKIP LOCKED
                )
                UPDATE search_sync_jobs jobs
                   SET status = 'PROCESSING',
                       locked_at = ?,
                       lock_token = gen_random_uuid(),
                       updated_at = ?
                  FROM candidates
                 WHERE jobs.id = candidates.id
                RETURNING jobs.id, jobs.university_id, jobs.attempt_count, jobs.lock_token
                """, (rs, rowNum) -> new ClaimedJob(
                        rs.getLong("id"),
                        rs.getLong("university_id"),
                        rs.getInt("attempt_count"),
                        rs.getObject("lock_token", UUID.class)),
                Timestamp.from(now), Timestamp.from(expiredBefore), batchSize,
                Timestamp.from(now), Timestamp.from(now));
    }

    @Transactional
    public boolean complete(ClaimedJob job) {
        return deleteOwnedJob(job) == 1;
    }

    @Transactional
    public boolean completeOrScheduleReconciliation(ClaimedJob job, Instant now) {
        if (deleteOwnedJob(job) == 1) {
            return true;
        }
        jdbc.update("""
                INSERT INTO search_sync_jobs (
                    university_id, status, attempt_count, available_at, created_at, updated_at
                )
                VALUES (?, 'PENDING', 0, ?, ?, ?)
                """, job.universityId(), Timestamp.from(now), Timestamp.from(now), Timestamp.from(now));
        return false;
    }

    @Transactional
    public boolean retry(ClaimedJob job, int attemptCount, Instant availableAt, Instant updatedAt,
            String lastError) {
        return jdbc.update("""
                UPDATE search_sync_jobs
                   SET status = 'PENDING',
                       attempt_count = ?,
                       available_at = ?,
                       locked_at = NULL,
                       lock_token = NULL,
                       last_error = ?,
                       updated_at = ?
                 WHERE id = ? AND status = 'PROCESSING' AND lock_token = ?
                """, attemptCount, Timestamp.from(availableAt), lastError, Timestamp.from(updatedAt),
                job.id(), job.lockToken()) == 1;
    }

    @Transactional
    public boolean fail(ClaimedJob job, int attemptCount, Instant now, String lastError) {
        return jdbc.update("""
                UPDATE search_sync_jobs
                   SET status = 'FAILED',
                       attempt_count = ?,
                       locked_at = NULL,
                       lock_token = NULL,
                       last_error = ?,
                       updated_at = ?
                 WHERE id = ? AND status = 'PROCESSING' AND lock_token = ?
                """, attemptCount, lastError, Timestamp.from(now), job.id(), job.lockToken()) == 1;
    }

    private int deleteOwnedJob(ClaimedJob job) {
        return jdbc.update("""
                DELETE FROM search_sync_jobs
                 WHERE id = ? AND status = 'PROCESSING' AND lock_token = ?
                """, job.id(), job.lockToken());
    }

    public record ClaimedJob(long id, long universityId, int attemptCount, UUID lockToken) {
    }
}
