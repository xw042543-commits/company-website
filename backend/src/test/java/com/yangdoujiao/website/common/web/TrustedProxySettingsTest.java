package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class TrustedProxySettingsTest {
    @Test
    void usesSiteWideExactIpsAndRejectsAmbiguousLegacyScopes() {
        TrustedProxySettings site = new TrustedProxySettings(new String[] {"192.0.2.10", "2001:db8::1"},
                new String[0], new String[0]);
        assertThat(site.addresses()).containsExactly("192.0.2.10", "2001:db8::1");
        assertThatThrownBy(() -> new TrustedProxySettings(new String[] {"192.0.2.10"},
                new String[] {"198.51.100.1"}, new String[0])).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new TrustedProxySettings(new String[0],
                new String[] {"192.0.2.10"}, new String[] {"198.51.100.1"}))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void singleLegacyScopeFallsBackWithoutUnion() {
        TrustedProxySettings settings = new TrustedProxySettings(new String[0],
                new String[] {"2001:db8::1"}, new String[0]);
        assertThat(settings.addresses()).containsExactly("2001:db8::1");
    }
}
