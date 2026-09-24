package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ConsultationClientAddressResolverTest {

    @Test
    void rejectsTrustedProxyThatIsNotALiteralIpAddress() {
        assertThatThrownBy(() -> new ConsultationClientAddressResolver(
                new String[] {"proxy.internal"}
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("literal IP address");

        assertThatThrownBy(() -> new ConsultationClientAddressResolver(
                new String[] {"2130706433"}
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("literal IP address");
    }

    @Test
    void ignoresForwardedHeaderFromUntrustedCaller() {
        ConsultationClientAddressResolver resolver = new ConsultationClientAddressResolver(
                new String[] {"127.0.0.1"}
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.10");
        request.addHeader("X-Forwarded-For", "198.51.100.99");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    void resolvesDifferentClientsBehindATrustedProxyAndDiscardsSpoofedPrefix() {
        ConsultationClientAddressResolver resolver = new ConsultationClientAddressResolver(
                new String[] {"127.0.0.1"}
        );
        MockHttpServletRequest first = proxiedRequest("198.51.100.20");
        MockHttpServletRequest second = proxiedRequest("198.51.100.21");

        assertThat(resolver.resolve(first)).isEqualTo("198.51.100.20");
        assertThat(resolver.resolve(second)).isEqualTo("198.51.100.21");

        first.removeHeader("X-Forwarded-For");
        first.addHeader("X-Forwarded-For", "192.0.2.200, 198.51.100.20");
        assertThat(resolver.resolve(first)).isEqualTo("198.51.100.20");
    }

    @Test
    void usesTheRightmostUntrustedAddressAcrossRepeatedForwardedHeaders() {
        ConsultationClientAddressResolver resolver = new ConsultationClientAddressResolver(
                new String[] {"127.0.0.1"}
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "192.0.2.200");
        request.addHeader("X-Forwarded-For", "198.51.100.20");

        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.20");
    }

    private MockHttpServletRequest proxiedRequest(String clientAddress) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", clientAddress);
        return request;
    }
}
