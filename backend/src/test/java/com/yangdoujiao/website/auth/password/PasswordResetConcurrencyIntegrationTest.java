package com.yangdoujiao.website.auth.password;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.OffsetDateTime;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;
import com.yangdoujiao.website.common.exception.ApiException;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class PasswordResetConcurrencyIntegrationTest {
    @Autowired private PasswordService passwords;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private LocalAuthNotificationStore notifications;

    @Test
    void exactlyOneConcurrentResetConsumesTheToken() throws Exception {
        String email = "reset-race-" + UUID.randomUUID() + "@example.com";
        jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Password Test', ?, ?, 'ACTIVE', 'test-terms-v1', 'test-privacy-v1', ?, ?)
                """, email, encoder.encode("correct-horse-42"), OffsetDateTime.now(), OffsetDateTime.now());
        passwords.forgotPassword(email, "en", "198.51.100.31");
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String token = notifications.take(email).orElseThrow().token();

        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (int attempt = 0; attempt < 2; attempt++) {
                int address = attempt;
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        passwords.resetPassword(token, "new-correct-horse-84", "198.51.100." + (32 + address));
                        return true;
                    } catch (ApiException exception) {
                        assertThat(exception.getCode()).isEqualTo("INVALID_RESET_TOKEN");
                        return false;
                    }
                }));
            }
            start.countDown();
            assertThat(List.of(results.get(0).get(), results.get(1).get()))
                    .containsExactlyInAnyOrder(true, false);
        }
        String hash = jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE normalized_email = ?",
                String.class, email);
        assertThat(encoder.matches("new-correct-horse-84", hash)).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE used_at IS NOT NULL "
                + "AND user_id = (SELECT id FROM user_accounts WHERE normalized_email = ?)", Integer.class, email))
                .isEqualTo(1);
    }
}
