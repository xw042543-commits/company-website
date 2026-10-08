package com.yangdoujiao.website.auth.miniapp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.http.HttpStatus;

import com.yangdoujiao.website.common.exception.ApiException;

public final class LocalMiniappIdentityProvider implements MiniappIdentityProvider {
    private static final String LOCAL_CLIENT_ID = "local-miniapp";

    private final MiniappAuthProperties properties;

    public LocalMiniappIdentityProvider(MiniappAuthProperties properties) {
        this.properties = properties;
    }

    @Override
    public MiniappProviderIdentity exchange(String code) {
        if (code == null || code.isBlank()) throw invalidCode();
        byte[] supplied = code.getBytes(StandardCharsets.UTF_8);
        byte[] expected = properties.localTestCode().getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(supplied, expected)) throw rejected();
        return new MiniappProviderIdentity(LOCAL_CLIENT_ID, properties.localTestSubject(), null);
    }

    private ApiException invalidCode() {
        return new ApiException(HttpStatus.BAD_REQUEST, "MINIAPP_AUTH_INVALID_CODE",
                "Mini program login code is required");
    }

    private ApiException rejected() {
        return new ApiException(HttpStatus.BAD_GATEWAY, "MINIAPP_AUTH_REJECTED",
                "Mini program authorization was rejected");
    }
}
