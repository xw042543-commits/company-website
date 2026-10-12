package com.yangdoujiao.website.community;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public final class WechatCommunityContentSafetyGateway implements CommunityContentSafetyGateway {
    private static final Logger log = LoggerFactory.getLogger(WechatCommunityContentSafetyGateway.class);
    private static final int MAXIMUM_RESPONSE_BYTES = 16 * 1024;

    private final CommunityContentSafetyProperties properties;
    private final UserExternalIdentityRepository identities;
    private final WechatAccessTokenProvider tokens;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    WechatCommunityContentSafetyGateway(CommunityContentSafetyProperties properties,
            UserExternalIdentityRepository identities, WechatAccessTokenProvider tokens,
            ObjectMapper objectMapper) {
        this(properties, identities, tokens, timedClient(properties), objectMapper);
    }

    WechatCommunityContentSafetyGateway(CommunityContentSafetyProperties properties,
            UserExternalIdentityRepository identities, WechatAccessTokenProvider tokens,
            RestClient restClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.identities = identities;
        this.tokens = tokens;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public Result check(long actorId, String normalizedText) {
        if (!properties.enabled()) return Result.PASS;

        Optional<String> openid;
        try {
            openid = identities.findProviderSubjectByProviderAndUserAccountId(
                    ExternalIdentityProvider.WECHAT_MINI_PROGRAM, actorId);
        } catch (DataAccessException exception) {
            log.warn("community content safety identity unavailable failureType={}",
                    exception.getClass().getSimpleName());
            return Result.UNAVAILABLE;
        }
        if (openid.isEmpty()) return Result.UNAVAILABLE;
        var token = tokens.accessToken();
        if (token.isEmpty()) return Result.UNAVAILABLE;

        for (int attempt = 1; attempt <= properties.maximumAttempts(); attempt++) {
            Result result = attempt(token.get(), openid.get(), normalizedText);
            if (result != Result.UNAVAILABLE) return result;
        }
        return Result.UNAVAILABLE;
    }

    private Result attempt(String token, String openid, String normalizedText) {
        URI uri = UriComponentsBuilder.fromUri(properties.messageCheckEndpoint())
                .queryParam("access_token", token)
                .build().encode().toUri();
        try {
            // WeChat rejects chunked request bodies with HTTP 412. Buffer this bounded text
            // payload so the transport sends the exact UTF-8 Content-Length.
            byte[] payload = objectMapper.writeValueAsBytes(Map.of(
                    "content", normalizedText, "version", 2, "scene", 2, "openid", openid));
            byte[] body = restClient.post().uri(uri)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .contentLength(payload.length)
                    .body(payload)
                    .retrieve().body(byte[].class);
            if (body == null || body.length == 0 || body.length > MAXIMUM_RESPONSE_BYTES) {
                return Result.UNAVAILABLE;
            }
            JsonNode response = objectMapper.readTree(new String(body, StandardCharsets.UTF_8));
            if (response == null || !response.isObject()) return Result.UNAVAILABLE;
            JsonNode errorCode = response.get("errcode");
            if (errorCode == null || !errorCode.isIntegralNumber()) return Result.UNAVAILABLE;
            if (errorCode.longValue() != 0) {
                log.warn("community content safety check unavailable providerCode={}",
                        errorCode.asText("unknown"));
                return Result.UNAVAILABLE;
            }
            JsonNode result = response.get("result");
            if (result == null || !result.isObject()) return Result.UNAVAILABLE;
            JsonNode suggestion = result.get("suggest");
            if (suggestion == null || !suggestion.isTextual()) return Result.UNAVAILABLE;
            return switch (suggestion.textValue()) {
                case "pass" -> Result.PASS;
                case "review", "risky" -> Result.REVIEW;
                default -> Result.UNAVAILABLE;
            };
        } catch (RestClientResponseException exception) {
            log.warn("community content safety check unavailable httpStatus={} providerCode={}",
                    exception.getStatusCode().value(), safeProviderCode(exception.getResponseBodyAsByteArray()));
            return Result.UNAVAILABLE;
        } catch (RestClientException | JacksonException | IllegalArgumentException exception) {
            log.warn("community content safety check unavailable failureType={}",
                    exception.getClass().getSimpleName());
            return Result.UNAVAILABLE;
        }
    }

    private String safeProviderCode(byte[] body) {
        if (body.length == 0 || body.length > MAXIMUM_RESPONSE_BYTES) return "unknown";
        try {
            JsonNode response = objectMapper.readTree(new String(body, StandardCharsets.UTF_8));
            JsonNode code = response == null ? null : response.get("errcode");
            // Never log upstream messages, response bodies or URLs: they may contain credentials.
            return code != null && code.isIntegralNumber() && code.canConvertToInt()
                    ? Integer.toString(code.intValue()) : "unknown";
        } catch (JacksonException | IllegalArgumentException exception) {
            return "unknown";
        }
    }

    private static RestClient timedClient(CommunityContentSafetyProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.requestTimeout())
                .build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.requestTimeout());
        return RestClient.builder().requestFactory(requestFactory).build();
    }
}
