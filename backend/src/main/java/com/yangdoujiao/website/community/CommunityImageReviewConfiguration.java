package com.yangdoujiao.website.community;

import java.net.http.HttpClient;
import java.time.Clock;
import java.time.Duration;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name="app.community.images.review-enabled",havingValue="true")
@EnableScheduling
class CommunityImageReviewConfiguration {
    @Bean CommunityImageReviewAccess communityImageReviewAccess(@Value("${app.community.images.public-origin}") String origin,
            @Value("${app.community.images.review-secret}") String secret,Clock clock) {
        return new CommunityImageReviewAccess(origin,secret,clock);
    }
    @Bean WechatImageCallbackCrypto wechatImageCallbackCrypto(@Value("${app.community.images.callback-token}") String token,
            @Value("${app.community.images.callback-aes-key}") String key,MiniappAuthProperties auth,CommunityContentSafetyProperties safety) {
        if(!safety.enabled())throw new IllegalStateException("Image review requires content safety to be enabled");
        return new WechatImageCallbackCrypto(token,key,auth.wechatAppId());
    }
    @Bean WechatImageReviewGateway wechatImageReviewGateway(WechatAccessTokenProvider tokens,UserExternalIdentityRepository identities,
            CommunityImageReviewAccess access,ObjectMapper json,
            @Value("${app.community.images.review-diagnostics-enabled:false}") boolean diagnostics) {
        var factory=new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
        factory.setReadTimeout(Duration.ofSeconds(5));
        return new WechatImageReviewGateway(tokens,identities,access,json,RestClient.builder().requestFactory(factory).build(),diagnostics);
    }
    @Bean @ConditionalOnProperty(name="app.community.images.review-worker-enabled",havingValue="true",matchIfMissing=true)
    CommunityImageReviewWorker communityImageReviewWorker(CommunityImageReviewJobs jobs,CommunityImageAttachments images,WechatImageReviewGateway gateway,Clock clock) {
        return new CommunityImageReviewWorker(jobs,images,gateway,clock);
    }
}
