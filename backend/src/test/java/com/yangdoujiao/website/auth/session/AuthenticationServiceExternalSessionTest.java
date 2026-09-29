package com.yangdoujiao.website.auth.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.unit.DataSize;

import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;

class AuthenticationServiceExternalSessionTest {
    @Test
    void externalLoginErasesPasswordHashBeforePersistingSecurityContext() {
        SecurityContextRepository contexts = mock(SecurityContextRepository.class);
        AuthenticationService service = new AuthenticationService(mock(AuthenticationManager.class), contexts,
                new AccountIdentifierNormalizer(), mock(AuthRateLimiter.class),
                new AuthRateLimitProperties(5, 5, 5, 5, 5, 5, 5, 5, 5, Duration.ofMinutes(10)),
                new AuthProperties(false, "", "", Duration.ofHours(24), Duration.ofDays(30),
                        Duration.ofMinutes(30), Duration.ofMinutes(10), Duration.ofMinutes(30),
                        DataSize.ofKilobytes(8), new String[0]));
        UserAccount account = new UserAccount("Test User", "test@example.com", null,
                "sensitive-password-hash", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        account.verifyEmail(java.time.OffsetDateTime.now());
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true);
        MockHttpServletResponse response = new MockHttpServletResponse();

        service.establishExternalSession(account, request, response);

        ArgumentCaptor<SecurityContext> captured = ArgumentCaptor.forClass(SecurityContext.class);
        verify(contexts).saveContext(captured.capture(), any(), any());
        UserPrincipal stored = (UserPrincipal) captured.getValue().getAuthentication().getPrincipal();
        assertThat(stored.getPassword()).isNull();
    }
}
