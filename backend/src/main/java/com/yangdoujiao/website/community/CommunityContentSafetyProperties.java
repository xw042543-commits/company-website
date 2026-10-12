package com.yangdoujiao.website.community;

import java.net.URI;
import java.time.Duration;
import java.util.Set;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("app.community.content-safety")
public record CommunityContentSafetyProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("2s") Duration requestTimeout,
        @DefaultValue("2") int maximumAttempts,
        @DefaultValue("https://api.weixin.qq.com/cgi-bin/token") URI accessTokenEndpoint,
        @DefaultValue("https://api.weixin.qq.com/wxa/msg_sec_check") URI messageCheckEndpoint) {

    private static final Duration MINIMUM_TIMEOUT = Duration.ofMillis(250);
    private static final Duration MAXIMUM_TIMEOUT = Duration.ofSeconds(5);
    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    public CommunityContentSafetyProperties {
        if (requestTimeout == null || requestTimeout.compareTo(MINIMUM_TIMEOUT) < 0
                || requestTimeout.compareTo(MAXIMUM_TIMEOUT) > 0) {
            throw new IllegalArgumentException("Invalid community content safety request timeout");
        }
        if (maximumAttempts < 1 || maximumAttempts > 3) {
            throw new IllegalArgumentException("Invalid community content safety attempt limit");
        }
        requireEndpoint(accessTokenEndpoint);
        requireEndpoint(messageCheckEndpoint);
    }

    private static void requireEndpoint(URI endpoint) {
        if (endpoint == null || !endpoint.isAbsolute() || endpoint.getHost() == null
                || !ALLOWED_SCHEMES.contains(endpoint.getScheme()) || endpoint.getUserInfo() != null
                || endpoint.getFragment() != null || endpoint.getQuery() != null) {
            throw new IllegalArgumentException("Invalid community content safety endpoint");
        }
    }
}
