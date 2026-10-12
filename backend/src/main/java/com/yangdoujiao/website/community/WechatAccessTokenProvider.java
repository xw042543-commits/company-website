package com.yangdoujiao.website.community;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public final class WechatAccessTokenProvider {
    private static final Logger log = LoggerFactory.getLogger(WechatAccessTokenProvider.class);
    private static final int MAXIMUM_RESPONSE_BYTES = 16 * 1024;
    private static final int MAXIMUM_TOKEN_LENGTH = 4 * 1024;
    private static final long MINIMUM_LIFETIME_SECONDS = 60;
    private static final long MAXIMUM_LIFETIME_SECONDS = 24 * 60 * 60;
    private static final Duration EXPIRY_SAFETY_MARGIN = Duration.ofMinutes(1);

    private final CommunityContentSafetyProperties properties;
    private final MiniappAuthProperties credentials;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    private CachedToken cached;

    @Autowired
    WechatAccessTokenProvider(CommunityContentSafetyProperties properties,
            MiniappAuthProperties credentials, ObjectMapper objectMapper, Clock clock) {
        this(properties, credentials, timedClient(properties), objectMapper, clock);
    }

    WechatAccessTokenProvider(CommunityContentSafetyProperties properties,
            MiniappAuthProperties credentials, RestClient restClient,
            ObjectMapper objectMapper, Clock clock) {
        this.properties = properties;
        this.credentials = credentials;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    synchronized Optional<String> accessToken() {
        if (!properties.enabled()) return Optional.empty();

        Instant now = clock.instant();
        if (cached != null && now.isBefore(cached.safeExpiry())) {
            return Optional.of(cached.value());
        }

        Optional<CachedToken> refreshed = refresh(now);
        refreshed.ifPresent(token -> cached = token);
        return refreshed.map(CachedToken::value);
    }

    private Optional<CachedToken> refresh(Instant now) {
        URI uri = UriComponentsBuilder.fromUri(properties.accessTokenEndpoint())
                .queryParam("grant_type", "client_credential")
                .queryParam("appid", credentials.wechatAppId())
                .queryParam("secret", credentials.wechatAppSecret())
                .build().encode().toUri();
        try {
            byte[] body = restClient.get().uri(uri).retrieve().body(byte[].class);
            if (body == null || body.length == 0 || body.length > MAXIMUM_RESPONSE_BYTES) {
                return Optional.empty();
            }
            JsonNode response = objectMapper.readTree(new String(body, StandardCharsets.UTF_8));
            if (response == null || !response.isObject()) return Optional.empty();

            JsonNode errorCode = response.get("errcode");
            if (errorCode != null && !errorCode.isNull()) {
                log.warn("community content safety token rejected providerCode={}",
                        errorCode.asText("unknown"));
                return Optional.empty();
            }

            String token = requiredToken(response.get("access_token"));
            long lifetimeSeconds = requiredLifetime(response.get("expires_in"));
            Instant safeExpiry = now.plusSeconds(lifetimeSeconds).minus(EXPIRY_SAFETY_MARGIN);
            return Optional.of(new CachedToken(token, safeExpiry));
        } catch (RestClientException | JacksonException | IllegalArgumentException exception) {
            log.warn("community content safety token unavailable failureType={}",
                    exception.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    private String requiredToken(JsonNode node) {
        if (node == null || !node.isTextual()) throw new IllegalArgumentException("invalid token response");
        String token = node.textValue().strip();
        if (token.isEmpty() || token.length() > MAXIMUM_TOKEN_LENGTH) {
            throw new IllegalArgumentException("invalid token response");
        }
        return token;
    }

    private long requiredLifetime(JsonNode node) {
        if (node == null || !node.isIntegralNumber()) {
            throw new IllegalArgumentException("invalid token lifetime");
        }
        long seconds = node.longValue();
        if (seconds < MINIMUM_LIFETIME_SECONDS || seconds > MAXIMUM_LIFETIME_SECONDS) {
            throw new IllegalArgumentException("invalid token lifetime");
        }
        return seconds;
    }

    private static RestClient timedClient(CommunityContentSafetyProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.requestTimeout())
                .build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.requestTimeout());
        return RestClient.builder().requestFactory(requestFactory).build();
    }

    private record CachedToken(String value, Instant safeExpiry) {}
}
