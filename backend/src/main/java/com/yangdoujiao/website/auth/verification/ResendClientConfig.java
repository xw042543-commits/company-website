package com.yangdoujiao.website.auth.verification;

import java.net.http.HttpClient;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@Profile("prod")
class ResendClientConfig {
    @Bean
    @Qualifier("resendRestClientBuilder")
    RestClient.Builder resendRestClientBuilder(ResendProperties properties) {
        var httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.requestTimeout())
                .build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.requestTimeout());
        return RestClient.builder().requestFactory(requestFactory);
    }
}
