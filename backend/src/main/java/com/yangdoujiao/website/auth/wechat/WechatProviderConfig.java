package com.yangdoujiao.website.auth.wechat;

import java.time.Duration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class WechatProviderConfig {
    @Bean
    @ConditionalOnProperty(prefix = "app.auth.wechat", name = "enabled", havingValue = "true")
    WechatAuthorizationProvider wechatAuthorizationProvider(WechatAuthProperties properties,
            RestClient.Builder builder) {
        SimpleClientHttpRequestFactory requests = new SimpleClientHttpRequestFactory();
        requests.setConnectTimeout(Duration.ofSeconds(5));
        requests.setReadTimeout(Duration.ofSeconds(8));
        return new WechatOpenPlatformClient(properties, builder.requestFactory(requests));
    }
}
