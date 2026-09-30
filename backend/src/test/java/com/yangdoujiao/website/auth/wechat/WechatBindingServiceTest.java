package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.PlatformTransactionManager;

import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.session.AuthenticationService;
import com.yangdoujiao.website.common.exception.ApiException;

class WechatBindingServiceTest {
    @Test
    void disabledProviderRejectsBindingBeforeReadingPendingStateOrCredentials() {
        AuthenticationService authentication = mock(AuthenticationService.class);
        WechatAuthProperties properties = new WechatAuthProperties(false, "", "", null,
                Duration.ofMinutes(5), Duration.ofMinutes(15));
        WechatBindingService service = new WechatBindingService(properties, authentication,
                mock(UserAccountRepository.class), mock(UserExternalIdentityRepository.class),
                mock(WechatAuthAuditLogger.class), mock(PlatformTransactionManager.class));

        assertThatThrownBy(() -> service.bind(
                new BindWechatAccountRequest("member@example.com", "password", false),
                "198.51.100.10", new MockHttpServletRequest(), new MockHttpServletResponse()))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    org.assertj.core.api.Assertions.assertThat(exception.getStatus().value()).isEqualTo(503);
                    org.assertj.core.api.Assertions.assertThat(exception.getCode()).isEqualTo("WECHAT_AUTH_UNAVAILABLE");
                });
        verifyNoInteractions(authentication);
    }
}
