package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.util.unit.DataSize;

import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.UserAccountLookup;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.auth.verification.VerificationService;
import com.yangdoujiao.website.common.exception.ApiException;

class RegistrationServiceEmailOnlyTest {

    @Test
    void rejectsPhoneRegistrationBeforeAccountOrNotificationWorkWhenPhoneRegistrationIsDisabled() {
        UserAccountLookup lookup = mock(UserAccountLookup.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        PasswordEncoder passwords = mock(PasswordEncoder.class);
        VerificationService verification = mock(VerificationService.class);
        var service = new RegistrationService(
                properties(), limits(), new AccountIdentifierNormalizer(), lookup, accounts,
                passwords, mock(AuthRateLimiter.class), verification, mock(PlatformTransactionManager.class));

        assertThatThrownBy(() -> service.register(new RegisterRequest(
                "Test Student", null, "+60123456789", "correct-horse-42",
                true, true, "en"), "192.0.2.1"))
                .isInstanceOfSatisfying(ApiException.class, error -> {
                    org.assertj.core.api.Assertions.assertThat(error.getCode()).isEqualTo("VALIDATION_ERROR");
                });
        verifyNoInteractions(lookup, accounts, passwords, verification);
    }

    private AuthProperties properties() {
        return new AuthProperties(true, false, "2026-09-30", "2026-09-30",
                Duration.ofHours(24), Duration.ofDays(30), Duration.ofMinutes(30),
                Duration.ofMinutes(10), Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[0]);
    }

    private AuthRateLimitProperties limits() {
        return new AuthRateLimitProperties(5, 3, 10, 3, 30, 20, 10, 20, 30, Duration.ofHours(1));
    }
}
