package com.yangdoujiao.website.auth.wechat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/providers")
public class AuthProviderController {
    private final WechatAuthProperties properties;

    public AuthProviderController(WechatAuthProperties properties) {
        this.properties = properties;
    }

    @GetMapping
    public AuthProviderAvailabilityResponse providers() {
        return new AuthProviderAvailabilityResponse(properties.enabled());
    }
}
