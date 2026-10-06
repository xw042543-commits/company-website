package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.yangdoujiao.website.common.exception.ApiException;

import tools.jackson.databind.ObjectMapper;

class WechatOpenPlatformClientTest {
    private RestClient.Builder builder;
    private MockRestServiceServer server;
    private WechatOpenPlatformClient client;

    @BeforeEach
    void setUp() {
        builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new WechatOpenPlatformClient(new WechatAuthProperties(true, "wx-app", "secret",
                URI.create("https://yangdoujiao.com/api/v1/auth/wechat/callback"),
                Duration.ofMinutes(5), Duration.ofMinutes(15)), builder, new ObjectMapper());
    }

    @Test
    void buildsOfficialQrAuthorizationRequest() {
        String uri = client.authorizationUri("safe-state").toString();
        assertThat(uri).startsWith("https://open.weixin.qq.com/connect/qrconnect?")
                .contains("appid=wx-app")
                .contains("scope=snsapi_login")
                .contains("state=safe-state")
                .endsWith("#wechat_redirect");
    }

    @Test
    void exchangesCodeAndRejectsProviderErrors() {
        server.expect(requestTo("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx-app&secret=secret&code=good-code&grant_type=authorization_code"))
                .andRespond(withSuccess("{\"openid\":\"wechat-subject\"}", MediaType.APPLICATION_JSON));
        assertThat(client.exchange("good-code"))
                .isEqualTo(new WechatProviderIdentity("wx-app", "wechat-subject"));
        server.verify();

        RestClient.Builder rejectedBuilder = RestClient.builder();
        MockRestServiceServer rejectedServer = MockRestServiceServer.bindTo(rejectedBuilder).build();
        WechatOpenPlatformClient rejected = new WechatOpenPlatformClient(new WechatAuthProperties(true,
                "wx-app", "secret", URI.create("https://yangdoujiao.com/api/v1/auth/wechat/callback"),
                Duration.ofMinutes(5), Duration.ofMinutes(15)), rejectedBuilder, new ObjectMapper());
        rejectedServer.expect(requestTo("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx-app&secret=secret&code=bad-code&grant_type=authorization_code"))
                .andRespond(withSuccess("{\"errcode\":40029}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> rejected.exchange("bad-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("WECHAT_AUTH_REJECTED");
        rejectedServer.verify();
    }

    @Test
    void acceptsSuccessfulWechatJsonWhenProviderUsesTextPlain() {
        server.expect(requestTo("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx-app&secret=secret&code=good-code&grant_type=authorization_code"))
                .andRespond(withSuccess("""
                        {"access_token":"provider-token","expires_in":7200,"refresh_token":"refresh-token","openid":"wechat-subject","scope":"snsapi_login","unionid":"wechat-union"}
                        """, MediaType.TEXT_PLAIN));

        assertThat(client.exchange("good-code"))
                .isEqualTo(new WechatProviderIdentity("wx-app", "wechat-subject"));
        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = { "{}", "{\"openid\":null}", "{\"openid\":123}",
            "{\"openid\":\" \"}", "not-json" })
    void treatsMalformedProviderResponsesAsUnavailable(String body) {
        server.expect(requestTo("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx-app&secret=secret&code=good-code&grant_type=authorization_code"))
                .andRespond(withSuccess(body, MediaType.TEXT_PLAIN));

        assertThatThrownBy(() -> client.exchange("good-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("WECHAT_AUTH_UNAVAILABLE");
        server.verify();
    }
}
