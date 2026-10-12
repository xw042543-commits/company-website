package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;

import tools.jackson.databind.ObjectMapper;

@ExtendWith(OutputCaptureExtension.class)
class WechatCommunityContentSafetyGatewayTest {
    private static final String CHECK_URI = "https://api.weixin.qq.com/wxa/msg_sec_check?access_token=content-token";

    private final UserExternalIdentityRepository identities = mock(UserExternalIdentityRepository.class);
    private final WechatAccessTokenProvider tokens = mock(WechatAccessTokenProvider.class);
    private MockRestServiceServer server;
    private RestClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = builder.build();
        when(identities.findProviderSubjectByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.of("real-openid"));
        when(tokens.accessToken()).thenReturn(Optional.of("content-token"));
    }

    @Test
    void checksNormalizedTextWithCurrentAccountsMiniProgramOpenid() {
        expectCheck("ordinary text", "{\"errcode\":0,\"result\":{\"suggest\":\"pass\",\"label\":100}}", 1);

        assertThat(gateway(1).check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.PASS);

        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = { "review", "risky" })
    void sendsWechatRiskResultsToManualReview(String suggestion) {
        expectCheck("candidate text", "{\"errcode\":0,\"result\":{\"suggest\":\"" + suggestion
                + "\",\"label\":100}}", 1);

        assertThat(gateway(1).check(42L, "candidate text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.REVIEW);

        server.verify();
    }

    @Test
    void missingMiniProgramIdentityIsUnavailableWithoutFetchingToken() {
        when(identities.findProviderSubjectByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.empty());

        assertThat(gateway(2).check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        verify(tokens, never()).accessToken();
        server.verify();
    }

    @Test
    void identityStoreFailureIsUnavailableWithoutExternalCalls() {
        when(identities.findProviderSubjectByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L))
                .thenThrow(new DataAccessResourceFailureException("identity store unavailable"));

        assertThat(gateway(2).check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        verify(tokens, never()).accessToken();
        server.verify();
    }

    @Test
    void disabledContentSafetyPreservesLocalPublishWithoutExternalCalls() {
        CommunityContentSafetyProperties disabled = new CommunityContentSafetyProperties(false,
                Duration.ofSeconds(2), 2,
                URI.create("https://api.weixin.qq.com/cgi-bin/token"),
                URI.create("https://api.weixin.qq.com/wxa/msg_sec_check"));
        var gateway = new WechatCommunityContentSafetyGateway(disabled, identities, tokens, client,
                new ObjectMapper());

        assertThat(gateway.check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.PASS);

        verify(identities, never()).findProviderSubjectByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L);
        verify(tokens, never()).accessToken();
        server.verify();
    }

    @Test
    void unavailableTokenFailsClosedWithoutHttpRequest() {
        when(tokens.accessToken()).thenReturn(Optional.empty());

        assertThat(gateway(2).check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{}",
            "not-json",
            "{\"errcode\":0}",
            "{\"errcode\":0,\"result\":{\"suggest\":\"unknown\"}}",
            "{\"errcode\":-1,\"errmsg\":\"system busy with real-openid and private body\"}"
    })
    void malformedAndProviderErrorsAreUnavailableAfterBoundedRetry(String body) {
        expectCheck("private body", body, 2);

        assertThat(gateway(2).check(42L, "private body"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        server.verify();
    }

    @Test
    void networkFailureIsUnavailableAfterBoundedRetry(CapturedOutput output) {
        server.expect(once(), requestTo(CHECK_URI))
                .andRespond(withException(new IOException("do not log real-openid private body mini-secret")));
        server.expect(once(), requestTo(CHECK_URI))
                .andRespond(withException(new IOException("still unavailable")));

        assertThat(gateway(2).check(42L, "private body"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        assertThat(output).doesNotContain("real-openid")
                .doesNotContain("private body")
                .doesNotContain("mini-secret");
        server.verify();
    }

    @Test
    void oversizedResponseIsUnavailable() {
        expectCheck("ordinary text", "x".repeat(17_000), 1);

        assertThat(gateway(1).check(42L, "ordinary text"))
                .isEqualTo(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        server.verify();
    }

    private void expectCheck(String text, String response, int times) {
        for (int attempt = 0; attempt < times; attempt++) {
            server.expect(once(), requestTo(CHECK_URI))
                    .andExpect(method(HttpMethod.POST))
                    .andExpect(content().json("""
                            {"content":"%s","version":2,"scene":2,"openid":"real-openid"}
                            """.formatted(text)))
                    .andRespond(withSuccess(response, MediaType.APPLICATION_JSON));
        }
    }

    private WechatCommunityContentSafetyGateway gateway(int attempts) {
        CommunityContentSafetyProperties properties = new CommunityContentSafetyProperties(true,
                Duration.ofSeconds(2), attempts,
                URI.create("https://api.weixin.qq.com/cgi-bin/token"),
                URI.create("https://api.weixin.qq.com/wxa/msg_sec_check"));
        return new WechatCommunityContentSafetyGateway(properties, identities, tokens, client,
                new ObjectMapper());
    }
}
