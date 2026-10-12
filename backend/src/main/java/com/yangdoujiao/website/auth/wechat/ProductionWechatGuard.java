package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.auth.config.ProductionRegistrationProperties;

import jakarta.annotation.PostConstruct;

@Component
@Profile("prod")
public class ProductionWechatGuard {
    private static final String CALLBACK_PATH = "/api/v1/auth/wechat/callback";

    private final WechatAuthProperties wechat;
    private final ProductionRegistrationProperties production;

    public ProductionWechatGuard(WechatAuthProperties wechat, ProductionRegistrationProperties production) {
        this.wechat = wechat;
        this.production = production;
    }

    @PostConstruct
    public void validate() {
        if (!wechat.enabled()) return;
        URI publicOrigin = production.publicSiteOrigin();
        URI expected = publicOrigin == null ? null : publicOrigin.resolve(CALLBACK_PATH);
        if (expected == null || !expected.equals(wechat.callbackUrl())) {
            throw new IllegalStateException(
                    "app.auth.wechat callback-url must use the production public-site-origin and documented path");
        }
    }
}
