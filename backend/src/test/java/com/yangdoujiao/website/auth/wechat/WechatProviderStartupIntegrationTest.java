package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.web.client.RestClient;

class WechatProviderStartupIntegrationTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(JacksonAutoConfiguration.class))
            .withUserConfiguration(WechatTestConfig.class)
            .withPropertyValues(
                    "app.auth.wechat.enabled=true",
                    "app.auth.wechat.app-id=test-wechat-client",
                    "app.auth.wechat.app-secret=test-wechat-secret",
                    "app.auth.wechat.callback-url=https://yangdoujiao.com/api/v1/auth/wechat/callback",
                    "app.auth.wechat.state-ttl=5m",
                    "app.auth.wechat.binding-ttl=10m");

    @Test
    void startsWithTheApplicationJsonMapperWhenWechatIsEnabled() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context).hasSingleBean(WechatAuthorizationProvider.class);
            assertThat(context.getBean(WechatAuthorizationProvider.class))
                    .isInstanceOf(WechatOpenPlatformClient.class);
        });
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EnableConfigurationProperties(WechatAuthProperties.class)
    @Import(WechatProviderConfig.class)
    static class WechatTestConfig {
        @Bean
        RestClient.Builder restClientBuilder() {
            return RestClient.builder();
        }
    }
}
