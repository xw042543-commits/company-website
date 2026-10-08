package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;

class ProductionMiniappGuardTest {
    @Test
    void rejectsEnabledLocalProviderInProduction() {
        MiniappAuthProperties unsafe = properties(true, true);

        assertThatThrownBy(() -> new ProductionMiniappGuard(unsafe).validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Local miniapp identity provider must be disabled in production");
    }

    @Test
    void permitsDisabledOrOfficialProvider() {
        assertThatCode(() -> new ProductionMiniappGuard(properties(false, false)).validate())
                .doesNotThrowAnyException();
        assertThatCode(() -> new ProductionMiniappGuard(properties(true, false)).validate())
                .doesNotThrowAnyException();
    }

    private MiniappAuthProperties properties(boolean enabled, boolean localProvider) {
        return new MiniappAuthProperties(enabled, enabled && !localProvider ? "mini-app" : "",
                enabled && !localProvider ? "secret" : "", Duration.ofMinutes(15), Duration.ofDays(30),
                localProvider, localProvider ? "fixed-code" : "", localProvider ? "local-subject" : "");
    }
}
