package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.common.exception.ApiException;

class LocalMiniappIdentityProviderTest {
    private final LocalMiniappIdentityProvider provider = new LocalMiniappIdentityProvider(
            new MiniappAuthProperties(true, "", "", Duration.ofMinutes(15), Duration.ofDays(30),
                    true, "fixed-development-code", "local-subject"));

    @Test
    void acceptsOnlyConfiguredCodeAndSubject() {
        assertThat(provider.exchange("fixed-development-code"))
                .isEqualTo(new MiniappProviderIdentity("local-miniapp", "local-subject", null));

        assertThatThrownBy(() -> provider.exchange("another-code"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_REJECTED");
    }

    @Test
    void rejectsBlankCode() {
        assertThatThrownBy(() -> provider.exchange(" "))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_AUTH_INVALID_CODE");
    }
}
