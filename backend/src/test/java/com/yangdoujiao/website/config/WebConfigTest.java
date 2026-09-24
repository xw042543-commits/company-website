package com.yangdoujiao.website.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;

import com.yangdoujiao.website.consultation.ConsultationRateLimitInterceptor;

class WebConfigTest {

    @Test
    void appliesCorsHeadersBeforeAFilterReturnsAnErrorResponse() throws Exception {
        WebConfig configuration = new WebConfig(
                new String[] {"http://localhost:3000"},
                org.mockito.Mockito.mock(ConsultationRateLimitInterceptor.class)
        );
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST",
                "/api/v1/consultations"
        );
        request.addHeader("Origin", "http://localhost:3000");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain downstream = (servletRequest, servletResponse) ->
                ((MockHttpServletResponse) servletResponse).setStatus(413);

        configuration.corsFilter().getFilter().doFilter(request, response, downstream);

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getHeader("Access-Control-Allow-Origin"))
                .isEqualTo("http://localhost:3000");
    }
}
