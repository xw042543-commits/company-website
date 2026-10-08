package com.yangdoujiao.website.community;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

class CommunityCursorProductionConfigTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withBean(ObjectMapper.class, () -> JsonMapper.builder().build())
            .withBean(Clock.class, Clock::systemUTC)
            .withUserConfiguration(CursorConfiguration.class);

    @Test
    void productionRefusesMissingBlankAndShortSigningKeys() {
        for (String secret : new String[] { "", "   ", "too-short" }) {
            runner.withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
                    .withPropertyValues("app.community.cursor-secret=" + secret)
                    .run(context -> org.assertj.core.api.Assertions.assertThat(context).hasFailed());
        }
    }

    @Test
    void sharedProductionKeyAndEphemeralLocalKeyBothStartSuccessfully() {
        runner.withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
                .withPropertyValues("app.community.cursor-secret=shared-production-key-at-least-32-bytes")
                .run(context -> org.assertj.core.api.Assertions.assertThat(context).hasNotFailed());
        runner.run(context -> org.assertj.core.api.Assertions.assertThat(context).hasNotFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @Import(CommunityCursorCodec.class)
    static class CursorConfiguration {}
}
