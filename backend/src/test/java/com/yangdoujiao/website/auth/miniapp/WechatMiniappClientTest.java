package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

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

class WechatMiniappClientTest {
    private MockRestServiceServer server;
    private WechatMiniappClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new WechatMiniappClient(properties(), builder, new ObjectMapper());
    }

    @Test
    void exchangesCodeWithoutExposingSessionKey() {
        server.expect(requestTo("https://api.weixin.qq.com/sns/jscode2session?appid=mini-app&secret=secret&js_code=good-code&grant_type=authorization_code"))
                .andRespond(withSuccess("""
                        {"openid":"mini-subject","session_key":"must-not-escape","unionid":"union-subject"}
                        """, MediaType.APPLICATION_JSON));

        MiniappProviderIdentity identity = client.exchange("good-code");

        assertThat(identity)
                .isEqualTo(new MiniappProviderIdentity("mini-app", "mini-subject", "union-subject"));
        assertThat(identity.toString()).doesNotContain("must-not-escape");
        server.verify();
    }

    @Test
    void rejectsBlankCodeBeforeCallingWechat() {
        assertThatThrownBy(() -> client.exchange("  "))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_INVALID_CODE");
        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = { "{}", "{\"openid\":null}", "{\"openid\":123}",
            "{\"openid\":\" \"}", "not-json" })
    void treatsMissingOrMalformedOpenidAsUnavailable(String body) {
        server.expect(requestTo("https://api.weixin.qq.com/sns/jscode2session?appid=mini-app&secret=secret&js_code=good-code&grant_type=authorization_code"))
                .andRespond(withSuccess(body, MediaType.TEXT_PLAIN));

        assertThatThrownBy(() -> client.exchange("good-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_UNAVAILABLE");
        server.verify();
    }

    @Test
    void mapsInvalidCodeToRejected() {
        server.expect(requestTo("https://api.weixin.qq.com/sns/jscode2session?appid=mini-app&secret=secret&js_code=bad-code&grant_type=authorization_code"))
                .andRespond(withSuccess("{\"errcode\":40029,\"errmsg\":\"invalid code\"}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.exchange("bad-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_REJECTED");
        server.verify();
    }

    @Test
    void mapsWechatSystemBusyToUnavailable() {
        server.expect(requestTo("https://api.weixin.qq.com/sns/jscode2session?appid=mini-app&secret=secret&js_code=busy-code&grant_type=authorization_code"))
                .andRespond(withSuccess("{\"errcode\":-1,\"errmsg\":\"system busy\"}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.exchange("busy-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_UNAVAILABLE");
        server.verify();
    }

    private MiniappAuthProperties properties() {
        return new MiniappAuthProperties(true, "mini-app", "secret",
                Duration.ofMinutes(15), Duration.ofDays(30), false, "", "");
    }
}
