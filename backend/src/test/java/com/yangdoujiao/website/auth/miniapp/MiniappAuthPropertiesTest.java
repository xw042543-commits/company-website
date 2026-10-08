package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;

class MiniappAuthPropertiesTest {

    @Test
    void acceptsDisabledDefaultsWithoutCredentials() {
        MiniappAuthProperties properties = properties(false, false, "", "", "", "");

        assertThatCode(properties::validate).doesNotThrowAnyException();
    }

    @Test
    void requiresOfficialCredentialsWhenOfficialAuthenticationIsEnabled() {
        assertThatThrownBy(() -> properties(true, false, "", "", "", "").validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("credentials");
        assertThatCode(() -> properties(true, false, "wx-miniapp", "secret", "", "").validate())
                .doesNotThrowAnyException();
    }

    @Test
    void requiresFixedLocalCredentialsWhenLocalProviderIsEnabled() {
        assertThatThrownBy(() -> properties(true, true, "", "", "", "").validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("local test");
        assertThatCode(() -> properties(true, true, "", "", "fixed-code", "fixed-subject").validate())
                .doesNotThrowAnyException();
    }

    @Test
    void restrictsAccessAndRefreshLifetimes() {
        assertThatThrownBy(() -> new MiniappAuthProperties(false, "", "",
                Duration.ofMinutes(4), Duration.ofDays(30), false, "", "").validate())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new MiniappAuthProperties(false, "", "",
                Duration.ofMinutes(15), Duration.ofDays(91), false, "", "").validate())
                .isInstanceOf(IllegalStateException.class);
    }

    private MiniappAuthProperties properties(boolean enabled, boolean localProvider,
            String appId, String secret, String localCode, String localSubject) {
        return new MiniappAuthProperties(enabled, appId, secret,
                Duration.ofMinutes(15), Duration.ofDays(30), localProvider, localCode, localSubject);
    }
}
