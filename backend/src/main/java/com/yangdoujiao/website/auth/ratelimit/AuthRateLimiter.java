package com.yangdoujiao.website.auth.ratelimit;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.common.exception.ApiException;

@Component
public class AuthRateLimiter {
    private static final String UPSERT = """
            INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
            VALUES (?, ?, 1, ?)
            ON CONFLICT (scope, subject_hash) DO UPDATE SET
                attempts = CASE WHEN auth_rate_limit_buckets.expires_at <= ? THEN 1
                                ELSE auth_rate_limit_buckets.attempts + 1 END,
                expires_at = CASE WHEN auth_rate_limit_buckets.expires_at <= ? THEN ?
                                  ELSE auth_rate_limit_buckets.expires_at END
            RETURNING attempts
            """;

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;

    public AuthRateLimiter(JdbcTemplate jdbc, PlatformTransactionManager manager) {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(manager);
        this.transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void consume(String scope, String subjectHash, int maximum, Duration window) {
        if (maximum < 1 || window == null || window.isNegative() || window.isZero()) {
            throw new IllegalArgumentException("Invalid auth rate limit");
        }
        int attempts;
        try {
            Instant now = Instant.now();
            Timestamp current = Timestamp.from(now);
            Timestamp expiry = Timestamp.from(now.plus(window));
            Integer count = transaction.execute(status -> jdbc.queryForObject(UPSERT, Integer.class,
                    scope, subjectHash, expiry, current, current, expiry));
            if (count == null) throw new IllegalStateException("Rate limit write returned no count");
            attempts = count;
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                    "Authentication service is temporarily unavailable");
        }
        if (attempts > maximum) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "AUTH_RATE_LIMITED",
                    "Too many requests");
        }
    }
}
