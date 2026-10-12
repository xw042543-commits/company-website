package com.yangdoujiao.website.auth.miniapp;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.common.exception.ApiException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

public final class WechatMiniappClient implements MiniappIdentityProvider {
    private static final Logger log = LoggerFactory.getLogger(WechatMiniappClient.class);
    private static final String SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";
    private static final int MAXIMUM_RESPONSE_BYTES = 16 * 1024;

    private final MiniappAuthProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public WechatMiniappClient(MiniappAuthProperties properties, RestClient.Builder builder,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public MiniappProviderIdentity exchange(String code) {
        if (code == null || code.isBlank()) throw invalidCode();
        URI uri = UriComponentsBuilder.fromUriString(SESSION_URL)
                .queryParam("appid", properties.wechatAppId())
                .queryParam("secret", properties.wechatAppSecret())
                .queryParam("js_code", code.strip())
                .queryParam("grant_type", "authorization_code")
                .build().encode().toUri();
        try {
            byte[] body = restClient.get().uri(uri).retrieve().body(byte[].class);
            if (body == null || body.length == 0 || body.length > MAXIMUM_RESPONSE_BYTES) throw unavailable();
            JsonNode response = objectMapper.readTree(new String(body, StandardCharsets.UTF_8));
            if (response == null || !response.isObject()) throw unavailable();
            JsonNode errorCode = response.get("errcode");
            if (errorCode != null && !errorCode.isNull()) {
                String providerCode = errorCode.asText("unknown");
                log.warn("miniapp code exchange failed providerCode={}", providerCode);
                if ("-1".equals(providerCode)) throw unavailable();
                throw rejected();
            }
            String subject = requiredText(response, "openid");
            String unionId = optionalText(response, "unionid");
            return new MiniappProviderIdentity(properties.wechatAppId(), subject, unionId);
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException | JacksonException | IllegalArgumentException exception) {
            log.warn("miniapp code exchange unavailable failureType={}", exception.getClass().getSimpleName());
            throw unavailable();
        }
    }

    private String requiredText(JsonNode response, String field) {
        String value = optionalText(response, field);
        if (value == null) throw unavailable();
        return value;
    }

    private String optionalText(JsonNode response, String field) {
        JsonNode node = response.get(field);
        if (node == null || node.isNull()) return null;
        if (!node.isTextual()) throw unavailable();
        String value = node.textValue().strip();
        return value.isEmpty() ? null : value;
    }

    private ApiException invalidCode() {
        return new ApiException(HttpStatus.BAD_REQUEST, "MINIAPP_AUTH_INVALID_CODE",
                "Mini program login code is required");
    }

    private ApiException rejected() {
        return new ApiException(HttpStatus.BAD_GATEWAY, "MINIAPP_AUTH_REJECTED",
                "Mini program authorization was rejected");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MINIAPP_AUTH_UNAVAILABLE",
                "Mini program authorization is temporarily unavailable");
    }
}
