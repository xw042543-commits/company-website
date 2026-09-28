package com.yangdoujiao.website.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.yangdoujiao.website.common.web.RequestTraceFilter;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.databind.ObjectMapper;

class ProductionHttpsFilterTest {
    private final ProductionHttpsFilter filter = new ProductionHttpsFilter(
            new ObjectMapper(), new String[] {"192.0.2.10"});

    @Test
    void rejectsHttpEvenWhenUntrustedClientClaimsHttps() throws Exception {
        MockHttpServletRequest request = request("203.0.113.9", false);
        request.addHeader("X-Forwarded-Proto", "https");
        request.addHeader("Forwarded", "proto=https");

        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        new RequestTraceFilter().doFilter(request, response,
                (req, res) -> filter.doFilter(req, res, chain));

        assertThat(chain.getRequest()).isNull();
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getHeader("X-Trace-Id")).isNotBlank();
        assertThat(response.getContentAsString()).contains("HTTPS_REQUIRED")
                .contains(response.getHeader("X-Trace-Id"));
    }

    @Test
    void allowsOnlyTrustedProxyWithSingleHttpsProtocolHeader() throws Exception {
        MockHttpServletRequest request = request("192.0.2.10", false);
        request.addHeader("X-Forwarded-Proto", "https");
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        HttpServletRequest downstream = (HttpServletRequest) chain.getRequest();
        assertThat(downstream.isSecure()).isTrue();
        assertThat(downstream.getScheme()).isEqualTo("https");
        assertThat(downstream.getServerPort()).isEqualTo(443);
    }

    @Test
    void rejectsTrustedProxyThatReportsHttpOrAmbiguousProtocols() throws Exception {
        assertRejected(request("192.0.2.10", false));
        for (String protocol : new String[] {"http", "https,http", "HTTPS"}) {
            MockHttpServletRequest request = request("192.0.2.10", false);
            request.addHeader("X-Forwarded-Proto", protocol);
            assertRejected(request);
        }
        MockHttpServletRequest repeated = request("192.0.2.10", false);
        repeated.addHeader("X-Forwarded-Proto", "https");
        repeated.addHeader("X-Forwarded-Proto", "https");
        assertRejected(repeated);

        MockHttpServletRequest conflicting = request("192.0.2.10", false);
        conflicting.addHeader("X-Forwarded-Proto", "https");
        conflicting.addHeader("Forwarded", "proto=http");
        assertRejected(conflicting);
    }

    @Test
    void allowsDirectTlsFromUntrustedPeer() throws Exception {
        MockHttpServletRequest request = request("203.0.113.9", true);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void allowsDirectTlsFromTrustedProxyAddressWithoutForwardedHeaders() throws Exception {
        MockHttpServletRequest request = request("192.0.2.10", true);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void preservesForwardDispatch() throws Exception {
        MockHttpServletRequest request = request("203.0.113.9", false);
        request.setDispatcherType(DispatcherType.FORWARD);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isSameAs(request);
    }

    private void assertRejected(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertThat(chain.getRequest()).isNull();
        assertThat(response.getStatus()).isEqualTo(403);
    }

    private MockHttpServletRequest request(String remoteAddress, boolean secure) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/csrf");
        request.setRemoteAddr(remoteAddress);
        request.setSecure(secure);
        return request;
    }
}
