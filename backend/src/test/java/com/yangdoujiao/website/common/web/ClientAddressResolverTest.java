package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;

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
}
