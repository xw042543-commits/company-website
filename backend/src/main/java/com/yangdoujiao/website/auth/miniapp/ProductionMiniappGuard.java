package com.yangdoujiao.website.auth.miniapp;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@Profile("prod")
public class ProductionMiniappGuard {
    private final MiniappAuthProperties properties;

    public ProductionMiniappGuard(MiniappAuthProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    public void validate() {
        if (properties.enabled() && properties.localProviderEnabled()) {
            throw new IllegalStateException("Local miniapp identity provider must be disabled in production");
        }
    }
}
