package com.yangdoujiao.website.auth.miniapp;

import java.time.Duration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.ObjectMapper;

@Configuration
@ConditionalOnProperty(prefix = "app.miniapp.auth", name = "enabled", havingValue = "true")
public class MiniappProviderConfig {
    @Bean
    @ConditionalOnProperty(prefix = "app.miniapp.auth", name = "local-provider-enabled",
            havingValue = "false", matchIfMissing = true)
    MiniappIdentityProvider wechatMiniappIdentityProvider(MiniappAuthProperties properties,
            RestClient.Builder builder, ObjectMapper objectMapper) {
        SimpleClientHttpRequestFactory requests = new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(5));
        requests.setReadTimeout(Duration.ofSeconds(8));
        return new WechatMiniappClient(properties, builder.requestFactory(requests), objectMapper);
    }

    @Bean
    @Profile("!prod")
    @ConditionalOnProperty(prefix = "app.miniapp.auth", name = "local-provider-enabled", havingValue = "true")
    MiniappIdentityProvider localMiniappIdentityProvider(MiniappAuthProperties properties) {
        return new LocalMiniappIdentityProvider(properties);
    }
}
