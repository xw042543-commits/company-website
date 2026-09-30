package com.yangdoujiao.website.auth.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

class AuthPropertiesTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(AuthConfig.class)
            .withPropertyValues(
                    "app.auth.session-timeout=24h",
                    "app.auth.remembered-session-timeout=30d",
                    "app.auth.email-verification-ttl=30m",
                    "app.auth.phone-verification-ttl=10m",
                    "app.auth.password-reset-ttl=30m",
                    "app.auth.maximum-body-size=8KB",
                    "app.auth.trusted-proxies=");

    @Test
    void bindingRejectsRegistrationWithoutPoliciesAtStartup() {
        contextRunner.withPropertyValues("app.auth.registration-enabled=true")
                .run(context -> assertThat(context.getStartupFailure())
                        .hasRootCauseMessage("app.auth agreement-version and privacy-version are required when registration is enabled"));
    }

    @Test
    void bindsValidRegistrationAndDurations() {
        contextRunner.withPropertyValues("app.auth.registration-enabled=true",
                "app.auth.agreement-version=test-terms-v1",
                "app.auth.privacy-version=test-privacy-v1")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBean(AuthProperties.class).sessionTimeout()).isEqualTo(Duration.ofHours(24));
                    assertThat(context.getBean(AuthProperties.class).maximumBodySize()).isEqualTo(DataSize.ofKilobytes(8));
                });
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(AuthProperties.class)
    static class AuthConfig {
    }

    @Test
    void registrationCannotBeEnabledWithoutPolicyVersions() {
        AuthProperties properties = valid(true, "", "");
        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("agreement-version")
                .hasMessageContaining("privacy-version");
    }

    @Test
    void rejectsInvalidTtlsAndRememberedSessionShorterThanNormal() {
        assertThatThrownBy(() -> new AuthProperties(false, "", "", Duration.ofHours(24),
                Duration.ofHours(1), Duration.ofMinutes(30), Duration.ofMinutes(10),
                Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[0]).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AuthProperties(false, "", "", Duration.ZERO,
                Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofMinutes(10),
                Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[0]).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AuthProperties(false, "", "", Duration.ofHours(24),
                Duration.ofDays(30), Duration.ofMinutes(-1), Duration.ofMinutes(10),
                Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[0]).validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AuthProperties(false, "", "", Duration.ofHours(24),
                Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofMinutes(10),
                Duration.ofMinutes(30), DataSize.ofBytes(0), new String[0]).validate())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsHostnamesAndAllCidrTrustedProxies() {
        for (String invalid : new String[] {"proxy.example.com", "192.168.1.999", "10.0.0.0/8", "2001:db8::/32"}) {
            assertThatThrownBy(() -> new AuthProperties(false, "", "", Duration.ofHours(24),
                    Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofMinutes(10),
                    Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[] {invalid}).validate())
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Test
    void acceptsOnlyExactLiteralIpTrustedProxies() {
        new AuthProperties(false, "", "", Duration.ofHours(24), Duration.ofDays(30),
                Duration.ofMinutes(30), Duration.ofMinutes(10), Duration.ofMinutes(30),
                DataSize.ofKilobytes(8), new String[] {"192.0.2.1", "2001:db8::1"})
                .validate();
    }

    private AuthProperties valid(boolean registration, String agreement, String privacy) {
        return new AuthProperties(registration, agreement, privacy, Duration.ofHours(24),
                Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofMinutes(10),
                Duration.ofMinutes(30), DataSize.ofKilobytes(8), new String[0]);
    }
}
