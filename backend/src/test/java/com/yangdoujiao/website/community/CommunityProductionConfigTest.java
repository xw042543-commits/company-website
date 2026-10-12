package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;

class CommunityProductionConfigTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner().withUserConfiguration(PolicyConfiguration.class)
            .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
            .withPropertyValues("app.community.cursor-secret=shared-production-key-with-at-least-32-bytes",
                    "app.miniapp.auth.access-token-ttl=15m", "app.miniapp.auth.refresh-token-ttl=30d");
    private ApplicationContextRunner enabledRunner() {
        return runner.withPropertyValues("app.community.enabled=true",
                "app.community.review-terms=policy-owned-term", "app.community.content-safety.enabled=true",
                "app.miniapp.auth.enabled=true", "app.miniapp.auth.wechat-app-id=owned-app-id",
                "app.miniapp.auth.wechat-app-secret=owned-app-secret",
                "app.miniapp.auth.local-test-code=synthetic-code", "app.miniapp.auth.local-test-subject=synthetic-subject");
    }
    @Test void disabledCommunityStartsWithSafeDefaultsAndEnabledNeedsAnOwnedPolicy() {
        runner.run(context -> assertThat(context).hasNotFailed());
        runner.withPropertyValues("app.community.enabled=true").run(context -> assertThat(context).hasFailed());
        enabledRunner()
                .run(context -> assertThat(context).hasNotFailed());
    }
    @Test void enabledProductionRequiresBothOwnedLocalReviewRulesAndWechatSafety() {
        for (String property : new String[]{"app.community.review-terms=", "app.community.review-terms=   ",
                "app.community.review-terms=synthetic-review", "app.community.review-terms=example-review",
                "app.community.reject-terms=hard-reject", "app.community.content-safety.enabled=false",
                "app.miniapp.auth.enabled=false", "app.miniapp.auth.local-provider-enabled=true"}) {
            enabledRunner().withPropertyValues(property).run(context -> assertThat(context).hasFailed());
        }
        enabledRunner().withPropertyValues("app.community.review-terms=", "app.community.reject-terms=owned-reject-rule")
                .run(context -> assertThat(context).hasFailed());
        runner.withPropertyValues("app.community.review-terms=synthetic-review")
                .run(context -> assertThat(context).hasNotFailed());
        enabledRunner().withInitializer(context -> context.getEnvironment().setActiveProfiles("test"))
                .withPropertyValues("app.community.review-terms=synthetic-review", "app.community.content-safety.enabled=false")
                .run(context -> assertThat(context).hasNotFailed());
    }
    @Test void productionCredentialsMustComeFromMiniappAuthProperties() {
        for (String property : new String[]{"app.miniapp.auth.wechat-app-id=", "app.miniapp.auth.wechat-app-secret=   "}) {
            enabledRunner().withPropertyValues("app.miniapp.auth.enabled=false", property,
                    "app.community.content-safety.wechat-app-id=ignored-app",
                    "app.community.content-safety.wechat-app-secret=ignored-secret")
                    .run(context -> assertThat(context).hasFailed());
        }
    }
    @Test void productionEndpointsMustBeExactOfficialHttpsEndpoints() {
        for (String endpoint : new String[]{"http://api.weixin.qq.com/wxa/msg_sec_check",
                "https://api.weixin.qq.com.evil.test/wxa/msg_sec_check", "https://evil.test/wxa/msg_sec_check",
                "https://api.weixin.qq.com:8443/wxa/msg_sec_check", "https://api.weixin.qq.com/wrong-path"}) {
            enabledRunner().withPropertyValues("app.community.content-safety.message-check-endpoint=" + endpoint)
                    .run(context -> assertThat(context).hasFailed());
        }
        for (String endpoint : new String[]{"http://api.weixin.qq.com/cgi-bin/token",
                "https://evil.test/cgi-bin/token", "https://api.weixin.qq.com/wrong-path"}) {
            enabledRunner().withPropertyValues("app.community.content-safety.access-token-endpoint=" + endpoint)
                    .run(context -> assertThat(context).hasFailed());
        }
    }
    @Test void limitBoundariesRejectNonPositiveUnsafeAndContradictoryLimits() {
        for (String property : new String[]{"post-per-minute=0", "post-per-minute=101", "post-per-day=1", "post-per-day=1001",
                "comment-per-minute=0", "comment-per-minute=301", "comment-per-day=9", "comment-per-day=10001",
                "report-per-day=0", "report-per-day=301", "auto-hide-report-threshold=1", "auto-hide-report-threshold=101"}) {
            runner.withPropertyValues("app.community." + property).run(context -> assertThat(context).hasFailed());
        }
    }
    @Test void enabledCommunityRequiresSharedPrivateKeyAndRejectPolicyHasPrecedence() {
        for (String key : new String[]{"", "short", "                                "}) {
            enabledRunner().withPropertyValues("app.community.cursor-secret=" + key,
                            "app.community.review-terms=policy-owned-term")
                    .run(context -> assertThat(context).hasFailed());
        }
        enabledRunner().withPropertyValues("app.community.review-terms=policy-owned-term",
                "app.community.reject-terms=policy-owned-term").run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBean(CommunityRiskPolicy.class).classify("policy-owned-term"))
                            .isEqualTo(CommunityRiskPolicy.RiskDecision.REJECT);
                });
    }
    @Configuration(proxyBeanMethods = false) @EnableConfigurationProperties({CommunityProperties.class,
            CommunityContentSafetyProperties.class, MiniappAuthProperties.class})
    @Import(ConfiguredCommunityRiskPolicy.class) static class PolicyConfiguration {}
}
