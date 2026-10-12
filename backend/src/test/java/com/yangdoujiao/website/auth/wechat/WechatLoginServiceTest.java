package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.util.unit.DataSize;

import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.auth.session.AuthenticationService;
import com.yangdoujiao.website.common.exception.ApiException;

class WechatLoginServiceTest {
    private final WechatAuthorizationProvider provider = mock(WechatAuthorizationProvider.class);
    private final WechatAuthAuditLogger audit = mock(WechatAuthAuditLogger.class);
    private final UserExternalIdentityRepository identities = mock(UserExternalIdentityRepository.class);
    private final UserAccountRepository accounts = mock(UserAccountRepository.class);
    private final AuthenticationService authentication = mock(AuthenticationService.class);
    private WechatLoginService service;
    private WechatOAuthStateStore states;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        WechatAuthProperties properties = new WechatAuthProperties(true, "wx-app", "secret",
                URI.create("https://yangdoujiao.com/api/v1/auth/wechat/callback"),
                Duration.ofMinutes(5), Duration.ofMinutes(15));
        states = new WechatOAuthStateStore(properties);
        ObjectProvider<WechatAuthorizationProvider> providers = mock(ObjectProvider.class);
        when(providers.getIfAvailable()).thenReturn(provider);
        when(accounts.saveAndFlush(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        service = new WechatLoginService(properties, providers, states,
                identities, accounts, authentication, new AuthProperties(
                        true, false, "test-terms-v1", "test-privacy-v1",
                        Duration.ofHours(24), Duration.ofDays(30), Duration.ofMinutes(30),
                        Duration.ofMinutes(10), Duration.ofMinutes(30), DataSize.ofKilobytes(8),
                        new String[0]),
                mock(AuthRateLimiter.class), new AuthRateLimitProperties(
                        5, 5, 5, 5, 5, 5, 5, 5, 5,
                        Duration.ofSeconds(60), Duration.ofMinutes(10)),
                audit, new ImmediateTransactionManager());
    }

    @Test
    void invalidStateIsAuditedAndReturnsToLocalLoginPage() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        URI redirect = service.callback("code", "invalid", null, "127.0.0.1",
                request, new MockHttpServletResponse());

        assertThat(redirect).isEqualTo(URI.create("/zh/login?wechatError=failed"));
        verify(audit).record("callback", "WECHAT_STATE_INVALID", null, "127.0.0.1", request);
    }

    @Test
    void providerFailureIsAuditedAndReturnsToIssuedLocaleAndTarget() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        String state = states.issue(request.getSession(true), "en", "/en/account",
                java.time.Instant.now());
        when(provider.exchange("bad-code")).thenThrow(new ApiException(
                HttpStatus.BAD_GATEWAY, "WECHAT_AUTH_REJECTED", "rejected"));

        URI redirect = service.callback("bad-code", state, null, "127.0.0.1",
                request, new MockHttpServletResponse());

        assertThat(redirect.toString()).isEqualTo(
                "/en/login?wechatError=failed&returnTo=/en/account");
        verify(audit).record("callback", "WECHAT_AUTH_REJECTED", null, "127.0.0.1", request);
    }

    @Test
    void qrConfigurationContainsOnlyPublicOAuthValuesAndIssuesConsumableState() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        WechatQrConfigResponse configuration = service.qrConfiguration(
                "en", "/en/account", "127.0.0.1", request);

        assertThat(configuration.appId()).isEqualTo("wx-app");
        assertThat(configuration.scope()).isEqualTo("snsapi_login");
        assertThat(configuration.redirectUri()).isEqualTo(
                "https://yangdoujiao.com/api/v1/auth/wechat/callback");
        assertThat(configuration.state()).isNotBlank();
        WechatOAuthState issued = states.consume(request.getSession(false),
                configuration.state(), Instant.now());
        assertThat(issued.locale()).isEqualTo("en");
        assertThat(issued.returnTo()).isEqualTo("/en/account");
        verify(audit).record("qr_config", "issued", null, "127.0.0.1", request);
    }

    @Test
    void firstWechatAuthorizationSignsInInsteadOfRedirectingToAccountBinding() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        String state = states.issue(request.getSession(true), "zh", "/zh/account", Instant.now());
        when(provider.exchange("new-code")).thenReturn(new WechatProviderIdentity("wx-app", "new-subject"));
        when(identities.findDetailed(ExternalIdentityProvider.WECHAT, "wx-app", "new-subject"))
                .thenReturn(Optional.empty());

        URI redirect = service.callback("new-code", state, null, "127.0.0.1",
                request, new MockHttpServletResponse());

        assertThat(redirect).isEqualTo(URI.create("/zh/account"));
    }

    private static final class ImmediateTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
        }

        @Override
        public void rollback(TransactionStatus status) {
        }
    }
}
