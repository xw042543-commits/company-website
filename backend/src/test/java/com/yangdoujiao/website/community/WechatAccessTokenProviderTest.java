package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;

import tools.jackson.databind.ObjectMapper;

@ExtendWith(OutputCaptureExtension.class)
class WechatAccessTokenProviderTest {
    private static final String TOKEN_URI = "https://api.weixin.qq.com/cgi-bin/token"
            + "?grant_type=client_credential&appid=mini-app&secret=mini-secret";

    private MockRestServiceServer server;
    private RestClient client;
    private MutableClock clock;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = builder.build();
        clock = new MutableClock(Instant.parse("2026-10-12T00:00:00Z"));
    }

    @Test
    void cachesValidTokenUntilSafeExpiryAndRefreshesAfterwards() {
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess("{\"access_token\":\"token-one\",\"expires_in\":7200}",
                        MediaType.APPLICATION_JSON));
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess("{\"access_token\":\"token-two\",\"expires_in\":7200}",
                        MediaType.APPLICATION_JSON));
        WechatAccessTokenProvider provider = provider();

        assertThat(provider.accessToken()).contains("token-one");
        clock.advance(Duration.ofMinutes(118));
        assertThat(provider.accessToken()).contains("token-one");
        clock.advance(Duration.ofMinutes(2));
        assertThat(provider.accessToken()).contains("token-two");

        server.verify();
    }

    @Test
    void concurrentCallersShareOneRefresh() throws Exception {
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess("{\"access_token\":\"shared-token\",\"expires_in\":7200}",
                        MediaType.APPLICATION_JSON));
        WechatAccessTokenProvider provider = provider();
        CountDownLatch start = new CountDownLatch(1);

        try (var pool = Executors.newFixedThreadPool(8)) {
            List<Future<Optional<String>>> calls = java.util.stream.IntStream.range(0, 8)
                    .mapToObj(ignored -> pool.submit(() -> {
                        start.await();
                        return provider.accessToken();
                    }))
                    .toList();
            start.countDown();

            for (Future<Optional<String>> call : calls) {
                assertThat(call.get()).contains("shared-token");
            }
        }

        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{}",
            "{\"access_token\":null,\"expires_in\":7200}",
            "{\"access_token\":\"  \",\"expires_in\":7200}",
            "{\"access_token\":\"token\",\"expires_in\":null}",
            "{\"access_token\":\"token\",\"expires_in\":30}",
            "{\"errcode\":40013,\"errmsg\":\"invalid appid mini-secret\"}",
            "not-json"
    })
    void malformedOrProviderErrorResponseIsUnavailable(String body) {
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        assertThat(provider().accessToken()).isEmpty();

        server.verify();
    }

    @Test
    void oversizedResponseIsUnavailable() {
        String body = "{\"access_token\":\"" + "a".repeat(17_000) + "\",\"expires_in\":7200}";
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        assertThat(provider().accessToken()).isEmpty();

        server.verify();
    }

    @Test
    void networkFailureIsUnavailable() {
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withException(new IOException("network mini-secret token-leak")));

        assertThat(provider().accessToken()).isEmpty();

        server.verify();
    }

    @Test
    void providerFailureLogsOnlySafeMetadata(CapturedOutput output) {
        server.expect(once(), requestTo(TOKEN_URI))
                .andRespond(withSuccess("""
                        {"errcode":40013,"errmsg":"do not log mini-secret or leaked-token"}
                        """, MediaType.APPLICATION_JSON));

        assertThat(provider().accessToken()).isEmpty();

        assertThat(output).contains("providerCode=40013")
                .doesNotContain("mini-secret")
                .doesNotContain("leaked-token")
                .doesNotContain("errmsg");
        server.verify();
    }

    @Test
    void disabledContentSafetyDoesNotCallWechat() {
        CommunityContentSafetyProperties disabled = new CommunityContentSafetyProperties(false,
                Duration.ofSeconds(2), 2,
                URI.create("https://api.weixin.qq.com/cgi-bin/token"),
                URI.create("https://api.weixin.qq.com/wxa/msg_sec_check"));
        WechatAccessTokenProvider provider = new WechatAccessTokenProvider(
                disabled, credentials(), client, new ObjectMapper(), clock);

        assertThat(provider.accessToken()).isEmpty();

        server.verify();
    }

    private WechatAccessTokenProvider provider() {
        return new WechatAccessTokenProvider(properties(), credentials(), client, new ObjectMapper(), clock);
    }

    private CommunityContentSafetyProperties properties() {
        return new CommunityContentSafetyProperties(true, Duration.ofSeconds(2), 2,
                URI.create("https://api.weixin.qq.com/cgi-bin/token"),
                URI.create("https://api.weixin.qq.com/wxa/msg_sec_check"));
    }

    private MiniappAuthProperties credentials() {
        return new MiniappAuthProperties(true, "mini-app", "mini-secret",
                Duration.ofMinutes(15), Duration.ofDays(30), false, "", "");
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        private MutableClock(Instant current) {
            this.current = current;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }

        private void advance(Duration duration) {
            current = current.plus(duration);
        }
    }
}
