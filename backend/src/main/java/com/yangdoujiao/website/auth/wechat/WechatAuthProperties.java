package com.yangdoujiao.website.auth.wechat;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties("app.auth.wechat")
public record WechatAuthProperties(boolean enabled, String appId, String appSecret,
        URI callbackUrl, Duration stateTtl, Duration bindingTtl) {
    private static final String CALLBACK_PATH = "/api/v1/auth/wechat/callback";

    @PostConstruct
    public void validate() {
        duration(stateTtl, Duration.ofMinutes(1), Duration.ofMinutes(15), "state-ttl");
        duration(bindingTtl, Duration.ofMinutes(5), Duration.ofMinutes(30), "binding-ttl");
        if (!enabled) return;
        if (blank(appId) || blank(appSecret) || callbackUrl == null) {
            throw new IllegalStateException("app.auth.wechat credentials and callback-url are required when enabled");
        }
        if (!"https".equalsIgnoreCase(callbackUrl.getScheme()) || callbackUrl.getHost() == null
                || callbackUrl.getUserInfo() != null || callbackUrl.getFragment() != null
                || callbackUrl.getQuery() != null || callbackUrl.getPort() != -1
                || !CALLBACK_PATH.equals(callbackUrl.getPath())) {
            throw new IllegalStateException("app.auth.wechat callback-url must be a safe HTTPS URL");
        }
    }

    private static void duration(Duration value, Duration minimum, Duration maximum, String name) {
        if (value == null || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            throw new IllegalStateException("app.auth.wechat " + name + " is outside the allowed range");
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
