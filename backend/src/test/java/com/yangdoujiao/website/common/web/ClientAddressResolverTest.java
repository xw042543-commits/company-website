package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientAddressResolverTest {

    @Test
    void ignoresForwardedAddressesFromUntrustedPeers() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("198.51.100.7");
        request.addHeader("X-Forwarded-For", "203.0.113.9");

        assertThat(new ClientAddressResolver(new String[0]).resolve(request))
                .isEqualTo("198.51.100.7");
    }

    @Test
    void walksTrustedProxiesFromTheRightAndRejectsOversizedHeaders() {
        ClientAddressResolver resolver = new ClientAddressResolver(new String[] {"127.0.0.1"});
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "192.0.2.1, 198.51.100.7");
        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.7");

        request.removeHeader("X-Forwarded-For");
        request.addHeader("X-Forwarded-For", "x".repeat(2_049));
        assertThat(resolver.resolve(request)).isEqualTo("127.0.0.1");
    }

    @Test
    void sharesIpv6TrustedProxyPolicyWithAuthAndConsultation() {
        TrustedProxySettings settings = new TrustedProxySettings(new String[] {"2001:db8::1"},
                new String[0], new String[0]);
        ClientAddressResolver resolver = new ClientAddressResolver(settings);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/register");
        request.setRemoteAddr("2001:db8::1");
        request.addHeader("X-Forwarded-For", "198.51.100.19");
        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.19");
        request.setRemoteAddr("2001:db8::2");
        assertThat(resolver.resolve(request)).isNotEqualTo("198.51.100.19");
    }

    @Test
    void normalizesBothIpv4MappedIpv6FormsToIpv4() {
        ClientAddressResolver resolver = new ClientAddressResolver(new String[0]);

        assertThat(resolveRemoteAddress(resolver, "::ffff:192.0.2.1"))
                .isEqualTo("192.0.2.1");
        assertThat(resolveRemoteAddress(resolver, "::ffff:c000:201"))
                .isEqualTo("192.0.2.1");
    }

    @Test
    void rejectsHostnamesAndZoneIdentifiersAsTrustedProxies() {
        assertThatThrownBy(() -> new ClientAddressResolver(new String[] {"localhost"}))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("literal IP address");
        assertThatThrownBy(() -> new ClientAddressResolver(new String[] {"fe80::1%en0"}))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("literal IP address");
    }

    @Test
    void acceptsForwardedHeaderAtExactlyTheMaximumLength() {
        ClientAddressResolver resolver = new ClientAddressResolver(new String[] {"127.0.0.1"});
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "198.51.100.7" + " ".repeat(2_048 - "198.51.100.7".length()));

        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.7");
    }

    @Test
    void ignoresMalformedForwardedChainsAndFallsBackToTheTrustedPeer() {
        ClientAddressResolver resolver = new ClientAddressResolver(new String[] {"127.0.0.1"});
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "198.51.100.7, not-an-ip");

        assertThat(resolver.resolve(request)).isEqualTo("127.0.0.1");
    }

    private String resolveRemoteAddress(ClientAddressResolver resolver, String remoteAddress) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr(remoteAddress);
        return resolver.resolve(request);
    }
}
