package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class CommunityContentSafetyPropertiesTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesConfiguration.class);

    @Test
    void bindsSafeDisabledDefaults() {
        runner.run(context -> {
            assertThat(context).hasNotFailed();
            CommunityContentSafetyProperties properties = context.getBean(CommunityContentSafetyProperties.class);
            assertThat(properties.enabled()).isFalse();
            assertThat(properties.requestTimeout()).isEqualTo(Duration.ofSeconds(2));
            assertThat(properties.maximumAttempts()).isEqualTo(2);
            assertThat(properties.accessTokenEndpoint())
                    .isEqualTo(URI.create("https://api.weixin.qq.com/cgi-bin/token"));
            assertThat(properties.messageCheckEndpoint())
                    .isEqualTo(URI.create("https://api.weixin.qq.com/wxa/msg_sec_check"));
        });
    }

    @Test
    void acceptsBoundedOverridesForControlledProviderTests() {
        runner.withPropertyValues(
                "app.community.content-safety.enabled=true",
                "app.community.content-safety.request-timeout=750ms",
                "app.community.content-safety.maximum-attempts=3",
                "app.community.content-safety.access-token-endpoint=http://127.0.0.1:18080/token",
                "app.community.content-safety.message-check-endpoint=http://127.0.0.1:18080/check")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    CommunityContentSafetyProperties properties = context.getBean(CommunityContentSafetyProperties.class);
                    assertThat(properties.enabled()).isTrue();
                    assertThat(properties.requestTimeout()).isEqualTo(Duration.ofMillis(750));
                    assertThat(properties.maximumAttempts()).isEqualTo(3);
                });
    }

    @Test
    void rejectsUnboundedTimeoutsAttemptsAndUnsafeEndpointShapes() {
        for (String property : new String[] {
                "request-timeout=249ms",
                "request-timeout=5001ms",
                "maximum-attempts=0",
                "maximum-attempts=4",
                "access-token-endpoint=relative/token",
                "access-token-endpoint=ftp://api.weixin.qq.com/token",
                "message-check-endpoint=https://user:password@api.weixin.qq.com/check",
                "message-check-endpoint=https://api.weixin.qq.com/check#fragment"
        }) {
            runner.withPropertyValues("app.community.content-safety." + property)
                    .run(context -> assertThat(context).as(property).hasFailed());
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(CommunityContentSafetyProperties.class)
    static class PropertiesConfiguration {
    }
}
