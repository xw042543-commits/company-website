package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

class CommunityProductionConfigTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner().withUserConfiguration(PolicyConfiguration.class)
            .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
            .withPropertyValues("app.community.cursor-secret=shared-production-key-with-at-least-32-bytes");
    @Test void disabledCommunityStartsWithSafeDefaultsAndEnabledNeedsAnOwnedPolicy() {
        runner.run(context -> assertThat(context).hasNotFailed());
        runner.withPropertyValues("app.community.enabled=true").run(context -> assertThat(context).hasFailed());
        runner.withPropertyValues("app.community.enabled=true", "app.community.review-terms=policy-owned-term")
                .run(context -> assertThat(context).hasNotFailed());
    }
    @Test void limitBoundariesRejectNonPositiveUnsafeAndContradictoryLimits() {
        for (String property : new String[]{"post-per-minute=0", "post-per-minute=101", "post-per-day=1", "post-per-day=1001",
                "comment-per-minute=0", "comment-per-minute=301", "comment-per-day=9", "comment-per-day=10001",
                "report-per-day=0", "report-per-day=301"}) {
            runner.withPropertyValues("app.community." + property).run(context -> assertThat(context).hasFailed());
        }
    }
    @Test void enabledCommunityRequiresSharedPrivateKeyAndRejectPolicyHasPrecedence() {
        for (String key : new String[]{"", "short", "                                "}) {
            runner.withPropertyValues("app.community.enabled=true", "app.community.cursor-secret=" + key,
                            "app.community.review-terms=policy-owned-term")
                    .run(context -> assertThat(context).hasFailed());
        }
        runner.withPropertyValues("app.community.enabled=true", "app.community.review-terms=policy-owned-term",
                "app.community.reject-terms=policy-owned-term").run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBean(CommunityRiskPolicy.class).classify("policy-owned-term"))
                            .isEqualTo(CommunityRiskPolicy.RiskDecision.REJECT);
                });
    }
    @Configuration(proxyBeanMethods = false) @EnableConfigurationProperties(CommunityProperties.class)
    @Import(ConfiguredCommunityRiskPolicy.class) static class PolicyConfiguration {}
}
