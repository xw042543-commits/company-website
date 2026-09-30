package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;

class WechatAuthPropertiesTest {
    @Test
    void acceptsDisabledConfigurationWithoutCredentials() {
        WechatAuthProperties properties = new WechatAuthProperties(false, "", "", null,
                Duration.ofMinutes(5), Duration.ofMinutes(15));
        assertThatCode(properties::validate).doesNotThrowAnyException();
    }

    @Test
    void requiresCompleteHttpsConfigurationWhenEnabled() {
        assertThatThrownBy(() -> new WechatAuthProperties(true, "", "", null,
                Duration.ofMinutes(5), Duration.ofMinutes(15)).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new WechatAuthProperties(true, "wx-app", "secret",
                URI.create("http://example.com/callback"), Duration.ofMinutes(5), Duration.ofMinutes(15)).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new WechatAuthProperties(true, "wx-app", "secret",
                URI.create("https://yangdoujiao.com/oauth/callback"),
                Duration.ofMinutes(5), Duration.ofMinutes(15)).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatCode(() -> new WechatAuthProperties(true, "wx-app", "secret",
                URI.create("https://yangdoujiao.com/api/v1/auth/wechat/callback"),
                Duration.ofMinutes(5), Duration.ofMinutes(15)).validate()).doesNotThrowAnyException();
    }

    @Test
    void restrictsStateAndBindingLifetime() {
        assertThatThrownBy(() -> new WechatAuthProperties(false, "", "", null,
                Duration.ofSeconds(30), Duration.ofMinutes(15)).validate()).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new WechatAuthProperties(false, "", "", null,
                Duration.ofMinutes(5), Duration.ofMinutes(31)).validate()).isInstanceOf(IllegalStateException.class);
    }
}
