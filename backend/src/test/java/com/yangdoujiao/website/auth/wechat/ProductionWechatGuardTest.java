package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.auth.config.ProductionRegistrationProperties;
import com.yangdoujiao.website.auth.config.ProductionRegistrationProperties.ApprovedDomain;
import com.yangdoujiao.website.auth.config.ProductionRegistrationProperties.NotificationProvider;

class ProductionWechatGuardTest {
    @Test
    void requiresTheOfficialCallbackOnTheConfiguredPublicOrigin() {
        ProductionRegistrationProperties production = new ProductionRegistrationProperties(
                NotificationProvider.NONE, ApprovedDomain.YANGDOUJIAO_COM,
                URI.create("https://www.yangdoujiao.com"), false);

        assertThatCode(() -> guard(false, null, production).validate()).doesNotThrowAnyException();
        assertThatCode(() -> guard(true,
                URI.create("https://www.yangdoujiao.com/api/v1/auth/wechat/callback"), production).validate())
                .doesNotThrowAnyException();
        assertThatThrownBy(() -> guard(true,
                URI.create("https://yangdoujiao.com/api/v1/auth/wechat/callback"), production).validate())
                .isInstanceOf(IllegalStateException.class);
    }

    private ProductionWechatGuard guard(boolean enabled, URI callback,
            ProductionRegistrationProperties production) {
        WechatAuthProperties wechat = new WechatAuthProperties(enabled,
                enabled ? "wx-app" : "", enabled ? "secret" : "", callback,
                Duration.ofMinutes(5), Duration.ofMinutes(15));
        return new ProductionWechatGuard(wechat, production);
    }
}
