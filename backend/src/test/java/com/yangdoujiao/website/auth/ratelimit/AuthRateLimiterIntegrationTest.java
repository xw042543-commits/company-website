package com.yangdoujiao.website.auth.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class AuthRateLimiterIntegrationTest {
    @Autowired private AuthRateLimiter limiter;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PlatformTransactionManager transactions;

    @Test
    void concurrentRequestsCannotExceedLimitAndRejectedAttemptsPersist() throws Exception {
        String hash = UUID.randomUUID().toString().replace("-", "").repeat(2);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try (var executor = Executors.newFixedThreadPool(8)) {
            for (int attempt = 0; attempt < 8; attempt++) {
                results.add(executor.submit(() -> {
                    start.await();
                    try { limiter.consume("test-race", hash, 3, Duration.ofMinutes(10)); return true; }
                    catch (ApiException exception) {
                        assertThat(exception.getCode()).isEqualTo("AUTH_RATE_LIMITED");
                        return false;
                    }
                }));
            }
            start.countDown();
            int accepted = 0;
            for (Future<Boolean> result : results) if (result.get()) accepted++;
            assertThat(accepted).isEqualTo(3);
        }
        assertThat(jdbc.queryForObject("SELECT attempts FROM auth_rate_limit_buckets WHERE scope = 'test-race' AND subject_hash = ?", Integer.class, hash)).isEqualTo(8);
    }

    @Test
    void resetsExpiredWindowAndDoesNotRollBackWithFailedBusinessOperation() {
        String hash = UUID.randomUUID().toString().replace("-", "").repeat(2);
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            limiter.consume("test-rollback", hash, 1, Duration.ofMinutes(1));
            status.setRollbackOnly();
        });
        assertThatThrownBy(() -> limiter.consume("test-rollback", hash, 1, Duration.ofMinutes(1)))
                .isInstanceOfSatisfying(ApiException.class, exception -> assertThat(exception.getStatus().value()).isEqualTo(429));
        jdbc.update("UPDATE auth_rate_limit_buckets SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second' WHERE scope = 'test-rollback' AND subject_hash = ?", hash);
        limiter.consume("test-rollback", hash, 1, Duration.ofMinutes(1));
        assertThat(jdbc.queryForObject("SELECT attempts FROM auth_rate_limit_buckets WHERE scope = 'test-rollback' AND subject_hash = ?", Integer.class, hash)).isEqualTo(1);
    }

    @Test
    void databaseWriteFailureFailsClosed() {
        // A scope too long for the real PostgreSQL column forces an actual write failure.
        assertThatThrownBy(() -> limiter.consume("x".repeat(51), "a".repeat(64), 3, Duration.ofMinutes(1)))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    assertThat(exception.getStatus().value()).isEqualTo(503);
                    assertThat(exception.getCode()).isEqualTo("AUTH_SERVICE_UNAVAILABLE");
                });
    }
}
