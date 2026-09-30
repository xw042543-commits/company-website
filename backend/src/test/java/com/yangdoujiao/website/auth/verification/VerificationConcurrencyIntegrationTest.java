package com.yangdoujiao.website.auth.verification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.api.RegisterRequest;
import com.yangdoujiao.website.auth.api.RegistrationService;
import com.yangdoujiao.website.common.exception.ApiException;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class VerificationConcurrencyIntegrationTest {
    @Autowired private RegistrationService registration;
    @Autowired private VerificationService verification;
    @Autowired private LocalAuthNotificationStore notifications;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void allowsOnlyOneConcurrentUseOfVerificationCode() throws Exception {
        String email = "concurrent-" + UUID.randomUUID() + "@example.com";
        register(email, null);
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String rawToken = notifications.take(email).orElseThrow().token();
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (int attempt = 0; attempt < 2; attempt++) {
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        verification.verifyEmailCode(email, rawToken);
                        return true;
                    } catch (ApiException exception) {
                        assertThat(exception.getCode()).isEqualTo("INVALID_VERIFICATION_TOKEN");
                        return false;
                    }
                }));
            }
            start.countDown();
            assertThat(List.of(results.get(0).get(), results.get(1).get())).containsExactlyInAnyOrder(true, false);
        }
    }

    @Test
    void expiredTokenCannotActivateAccount() throws Exception {
        String email = "expired-" + UUID.randomUUID() + "@example.com";
        register(email, null);
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String token = notifications.take(email).orElseThrow().token();
        jdbc.update("UPDATE user_verification_tokens SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second' WHERE user_id = (SELECT id FROM user_accounts WHERE normalized_email = ?)", email);
        assertInvalid(() -> verification.verifyEmailCode(email, token));
        assertThat(jdbc.queryForObject("SELECT status FROM user_accounts WHERE normalized_email = ?", String.class, email)).isEqualTo("PENDING_VERIFICATION");
    }

    @Test
    void emailGuessAttemptsAreCommittedAndExhaustedCodeStaysUnusable() throws Exception {
        String email = "guesses-" + UUID.randomUUID() + "@example.com";
        register(email, null);
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String code = notifications.take(email).orElseThrow().token();
        String incorrect = code.equals("000000") ? "000001" : "000000";
        for (int attempt = 0; attempt < 5; attempt++) {
            assertInvalid(() -> verification.verifyEmailCode(email, incorrect));
        }
        assertInvalid(() -> verification.verifyEmailCode(email, code));
        assertThat(jdbc.queryForObject("SELECT attempts FROM user_verification_tokens WHERE user_id = (SELECT id FROM user_accounts WHERE normalized_email = ?)", Integer.class, email)).isEqualTo(5);
    }

    @Test
    void phoneGuessAttemptsAreCommittedAndExhaustedTokenStaysUnusable() throws Exception {
        String phone = "+60" + String.format("%010d", Math.abs(UUID.randomUUID().getLeastSignificantBits() % 10000000000L));
        register(null, phone);
        assertThat(notifications.awaitAvailable(phone, Duration.ofSeconds(5))).isTrue();
        String code = notifications.take(phone).orElseThrow().token();
        String incorrect = code.equals("000000") ? "000001" : "000000";
        for (int attempt = 0; attempt < 5; attempt++) assertInvalid(() -> verification.verifyPhone(phone, incorrect));
        assertInvalid(() -> verification.verifyPhone(phone, code));
        assertThat(jdbc.queryForObject("SELECT attempts FROM user_verification_tokens WHERE user_id = (SELECT id FROM user_accounts WHERE normalized_phone = ?)", Integer.class, phone)).isEqualTo(5);
    }

    private void register(String email, String phone) {
        registration.register(new RegisterRequest("Test User", email, phone, "correct-horse-42", true, true, "en"), UUID.randomUUID().toString());
    }

    private void assertInvalid(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.getCode()).isEqualTo("INVALID_VERIFICATION_TOKEN"));
    }
}
