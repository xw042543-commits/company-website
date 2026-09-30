package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.common.exception.ApiException;

public final class WechatOpenPlatformClient implements WechatAuthorizationProvider {
    private static final String AUTHORIZE_URL = "https://open.weixin.qq.com/connect/qrconnect";
    private static final String TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";

    private final WechatAuthProperties properties;
    private final RestClient restClient;

    public WechatOpenPlatformClient(WechatAuthProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.restClient = builder.build();
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
            TokenResponse response = restClient.get().uri(uri).retrieve().body(TokenResponse.class);
            if (response == null || response.errcode() != null || response.openid() == null
                    || response.openid().isBlank()) throw rejected();
            return new WechatProviderIdentity(properties.appId(), response.openid());
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException | IllegalArgumentException exception) {
            throw unavailable();
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

    private record TokenResponse(String openid, Integer errcode) {
    }
}
