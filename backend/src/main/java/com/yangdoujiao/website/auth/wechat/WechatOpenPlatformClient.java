package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

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

public final class WechatOpenPlatformClient implements WechatAuthorizationProvider {
    private static final Logger log = LoggerFactory.getLogger(WechatOpenPlatformClient.class);
    private static final String AUTHORIZE_URL = "https://open.weixin.qq.com/connect/qrconnect";
    private static final String TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";
    private static final String USER_INFO_URL = "https://api.weixin.qq.com/sns/userinfo";

    private final WechatAuthProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public WechatOpenPlatformClient(WechatAuthProperties properties, RestClient.Builder builder,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public URI authorizationUri(String state) {
        return UriComponentsBuilder.fromUriString(AUTHORIZE_URL)
                .queryParam("appid", properties.appId())
                .queryParam("redirect_uri", properties.callbackUrl().toString())
                .queryParam("response_type", "code")
                .queryParam("scope", "snsapi_login")
                .queryParam("state", state)
                .fragment("wechat_redirect")
                .build().encode().toUri();
    }

    @Override
    public WechatProviderIdentity exchange(String authorizationCode) {
        if (authorizationCode == null || authorizationCode.isBlank()) throw rejected();
        URI uri = UriComponentsBuilder.fromUriString(TOKEN_URL)
                .queryParam("appid", properties.appId())
                .queryParam("secret", properties.appSecret())
                .queryParam("code", authorizationCode)
                .queryParam("grant_type", "authorization_code")
                .build().encode().toUri();
        try {
            String body = restClient.get().uri(uri).retrieve().body(String.class);
            JsonNode response = body == null ? null : objectMapper.readTree(body);
            if (response == null || !response.isObject()) throw unavailable();
            JsonNode providerCode = response.get("errcode");
            if (providerCode != null && !providerCode.isNull()) {
                log.warn("wechat token exchange rejected providerCode={}", providerCode.asText("unknown"));
                throw rejected();
            }
            JsonNode subjectNode = response.get("openid");
            if (subjectNode == null || !subjectNode.isTextual()) throw unavailable();
            String subject = subjectNode.textValue().strip();
            if (subject.isEmpty()) throw unavailable();
            JsonNode tokenNode = response.get("access_token");
            if (tokenNode == null || !tokenNode.isTextual() || tokenNode.textValue().isBlank()) {
                return new WechatProviderIdentity(properties.appId(), subject);
            }
            return profile(tokenNode.textValue().strip(), subject);
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException | JacksonException | IllegalArgumentException exception) {
            log.warn("wechat token exchange unavailable failureType={}",
                    exception.getClass().getSimpleName());
            throw unavailable();
        }
    }

    private WechatProviderIdentity profile(String accessToken, String subject) {
        URI uri = UriComponentsBuilder.fromUriString(USER_INFO_URL)
                .queryParam("access_token", accessToken)
                .queryParam("openid", subject)
                .queryParam("lang", "zh_CN")
                .build().encode().toUri();
        try {
            String body = restClient.get().uri(uri).retrieve().body(String.class);
            JsonNode response = body == null ? null : objectMapper.readTree(body);
            if (response == null || !response.isObject() || response.has("errcode")) {
                return new WechatProviderIdentity(properties.appId(), subject);
            }
            JsonNode nickname = response.get("nickname");
            JsonNode avatar = response.get("headimgurl");
            return new WechatProviderIdentity(properties.appId(), subject,
                    nickname != null && nickname.isTextual() ? nickname.textValue() : null,
                    avatar != null && avatar.isTextual() ? avatar.textValue() : null);
        } catch (RestClientException | JacksonException | IllegalArgumentException exception) {
            log.warn("wechat profile unavailable failureType={}", exception.getClass().getSimpleName());
            return new WechatProviderIdentity(properties.appId(), subject);
        }
    }

    @Override
    public String clientId() {
        return properties.appId();
    }

    private ApiException rejected() {
        return new ApiException(HttpStatus.BAD_GATEWAY, "WECHAT_AUTH_REJECTED", "WeChat authorization was rejected");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "WECHAT_AUTH_UNAVAILABLE",
                "WeChat authorization is temporarily unavailable");
    }
}
