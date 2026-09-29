package com.yangdoujiao.website.auth.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties("app.auth.rate-limit")
public record AuthRateLimitProperties(int registrationPerIp, int registrationPerIdentifier,
        int resendPerIp, int resendPerIdentifier, int verificationPerIp,
        int loginPerIp, int loginPerIdentifier, int wechatStartPerIp, int wechatCallbackPerIp,
        Duration window) {
    @PostConstruct
    public void validate() {
        if (registrationPerIp < 1 || registrationPerIdentifier < 1 || resendPerIp < 1
                || resendPerIdentifier < 1 || verificationPerIp < 1 || loginPerIp < 1
                || loginPerIdentifier < 1 || wechatStartPerIp < 1 || wechatCallbackPerIp < 1 || window == null
                || window.isZero() || window.isNegative() || window.compareTo(Duration.ofDays(365)) > 0) {
            throw new IllegalStateException("app.auth.rate-limit requires positive thresholds and window");
        }
    }
}
