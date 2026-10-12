package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.net.URI;
import java.time.Duration;
import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.springframework.jdbc.core.JdbcTemplate;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class HybridCommunityRiskPolicyTest {
    private final CommunityContentSafetyGateway wechat = mock(CommunityContentSafetyGateway.class);
    private final ConfiguredCommunityRiskPolicy local = new ConfiguredCommunityRiskPolicy(
            new CommunityProperties(true, 2, 30, 10, 300, 30, "x".repeat(32),
                    List.of("needs-review"), List.of("hard-reject"), 5),
            new MockEnvironment(),
            new CommunityContentSafetyProperties(false, Duration.ofSeconds(2), 2,
                    URI.create("https://api.weixin.qq.com/cgi-bin/token"), URI.create("https://api.weixin.qq.com/wxa/msg_sec_check")),
            new MiniappAuthProperties(false, null, null, Duration.ofMinutes(15), Duration.ofDays(30), false, null, null));
    private final HybridCommunityRiskPolicy policy = new HybridCommunityRiskPolicy(local, wechat,
            new CommunityMetrics(new SimpleMeterRegistry(), mock(JdbcTemplate.class)));

    @Test
    void localRejectHasHighestPriorityAndSkipsWechat() {
        assertThat(policy.classify(42L, "contains hard-reject term"))
                .isEqualTo(CommunityRiskPolicy.RiskDecision.REJECT);
        verifyNoInteractions(wechat);
    }

    @Test
    void localReviewSkipsWechat() {
        assertThat(policy.classify(42L, "contains needs-review term"))
                .isEqualTo(CommunityRiskPolicy.RiskDecision.REVIEW);
        verifyNoInteractions(wechat);
    }

    @Test
    void mapsWechatPassToPublish() {
        when(wechat.check(42L, "ordinary text")).thenReturn(CommunityContentSafetyGateway.Result.PASS);

        assertThat(policy.classify(42L, "ordinary text"))
                .isEqualTo(CommunityRiskPolicy.RiskDecision.PUBLISH);
    }

    @Test
    void mapsWechatReviewAndUnavailableToManualReview() {
        when(wechat.check(42L, "risky text")).thenReturn(CommunityContentSafetyGateway.Result.REVIEW);
        when(wechat.check(42L, "unavailable text")).thenReturn(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        assertThat(policy.classify(42L, "risky text"))
                .isEqualTo(CommunityRiskPolicy.RiskDecision.REVIEW);
        assertThat(policy.classify(42L, "unavailable text"))
                .isEqualTo(CommunityRiskPolicy.RiskDecision.REVIEW);
    }
}
