package com.yangdoujiao.website.auth.miniapp;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties("app.miniapp.auth")
public record MiniappAuthProperties(
        boolean enabled,
        String wechatAppId,
        String wechatAppSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        boolean localProviderEnabled,
        String localTestCode,
        String localTestSubject) {

    @PostConstruct
    public void validate() {
        duration(accessTokenTtl, Duration.ofMinutes(5), Duration.ofMinutes(60), "access-token-ttl");
        duration(refreshTokenTtl, Duration.ofDays(1), Duration.ofDays(90), "refresh-token-ttl");

        if (!enabled) return;
        if (localProviderEnabled) {
            if (blank(localTestCode) || blank(localTestSubject)) {
                throw new IllegalStateException("app.miniapp.auth local test code and subject are required");
            }
            return;
        }
        if (blank(wechatAppId) || blank(wechatAppSecret)) {
            throw new IllegalStateException("app.miniapp.auth WeChat credentials are required when enabled");
        }
    }

    private static void duration(Duration value, Duration minimum, Duration maximum, String name) {
        if (value == null || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            throw new IllegalStateException("app.miniapp.auth " + name + " is outside the allowed range");
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
