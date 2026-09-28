package com.yangdoujiao.website.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

class ProductionRegistrationGuardTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
            .withUserConfiguration(GuardConfig.class)
            .withPropertyValues(
                    "app.auth.session-timeout=24h",
                    "app.auth.remembered-session-timeout=30d",
                    "app.auth.email-verification-ttl=30m",
                    "app.auth.phone-verification-ttl=10m",
                    "app.auth.password-reset-ttl=30m",
                    "app.auth.maximum-body-size=8KB",
                    "app.auth.trusted-proxies=",
                    "server.servlet.session.cookie.secure=true");

    @Test
    void productionStaysClosedWithNoProviderOrPublicOrigin() {
        contextRunner.withPropertyValues("app.auth.registration-enabled=false")
                .run(context -> assertThat(context).hasNotFailed());
        contextRunner.withPropertyValues("app.auth.registration-enabled=true",
                "app.auth.agreement-version=terms-v1", "app.auth.privacy-version=privacy-v1")
                .run(context -> assertThat(context.getStartupFailure()).rootCause().hasMessageContaining("notification-provider"));
    }

    @Test
    void configuredProviderFlagCannotSubstituteForAnActualProvider() {
        enabled().run(context -> assertThat(context.getStartupFailure())
                .rootCause().hasMessageContaining("notification provider implementation"));
    }

    @Test
    void rejectsInsecureOriginOrCorsEvenWithReadyProvider() {
        enabled().withUserConfiguration(ReadyProviderConfig.class)
                .withPropertyValues("app.auth.production.public-site-origin=http://example.com")
                .run(context -> assertThat(context.getStartupFailure()).rootCause().hasMessageContaining("HTTPS"));
        enabled().withUserConfiguration(ReadyProviderConfig.class)
                .withPropertyValues("app.cors.allowed-origins=http://example.com")
                .run(context -> assertThat(context.getStartupFailure()).rootCause().hasMessageContaining("CORS"));
    }

    @Test
    void rejectsMissingLaunchApprovalAndInsecureCookie() {
        enabled().withUserConfiguration(ReadyProviderConfig.class)
                .withPropertyValues("app.auth.production.launch-approved=false")
                .run(context -> assertThat(context.getStartupFailure()).rootCause().hasMessageContaining("launch-approved"));
        enabled().withUserConfiguration(ReadyProviderConfig.class)
                .withPropertyValues("server.servlet.session.cookie.secure=false")
                .run(context -> assertThat(context.getStartupFailure()).rootCause().hasMessageContaining("Secure session cookie"));
    }

    @Test
    void acceptsOnlyCompleteProductionReadiness() {
        enabled().withUserConfiguration(ReadyProviderConfig.class)
                .run(context -> assertThat(context).hasNotFailed());
    }

    private ApplicationContextRunner enabled() {
        return contextRunner.withPropertyValues(
                "app.auth.registration-enabled=true",
                "app.auth.agreement-version=terms-v1",
                "app.auth.privacy-version=privacy-v1",
                "app.auth.production.notification-provider=EXTERNAL",
                "app.auth.production.public-site-origin=https://example.com",
                "app.auth.production.launch-approved=true",
                "app.cors.allowed-origins=https://example.com");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties({AuthProperties.class, ProductionRegistrationProperties.class})
    @Import(ProductionRegistrationGuard.class)
    static class GuardConfig {
    }

    @Configuration(proxyBeanMethods = false)
    static class ReadyProviderConfig {
        @Bean
        ProductionNotificationReadiness provider() {
            return () -> true;
        }
    }
}
