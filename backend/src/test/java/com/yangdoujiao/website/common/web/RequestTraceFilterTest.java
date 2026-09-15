package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestTraceFilterTest {

    @Test
    void generatesTraceIdWhenRequestHeaderIsMissing() throws Exception {
        RequestTraceFilter filter = new RequestTraceFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/v1/universities"
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String responseTraceId = response.getHeader(RequestTraceFilter.TRACE_ID_HEADER);
        assertThat(responseTraceId).isNotBlank();
        assertThat(request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE))
                .isEqualTo(responseTraceId);
        assertThat(MDC.get(RequestTraceFilter.TRACE_ID_MDC_KEY)).isNull();
    }

    @Test
    void reusesValidTraceIdFromRequestHeader() throws Exception {
        RequestTraceFilter filter = new RequestTraceFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/v1/universities"
        );
        request.addHeader(RequestTraceFilter.TRACE_ID_HEADER, "frontend-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(RequestTraceFilter.TRACE_ID_HEADER))
                .isEqualTo("frontend-123");
        assertThat(request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE))
                .isEqualTo("frontend-123");
    }

    @Test
    void replacesUnsafeTraceIdFromRequestHeader() throws Exception {
        RequestTraceFilter filter = new RequestTraceFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/v1/universities"
        );
        request.addHeader(RequestTraceFilter.TRACE_ID_HEADER, "unsafe trace id\nvalue");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String responseTraceId = response.getHeader(RequestTraceFilter.TRACE_ID_HEADER);
        assertThat(responseTraceId)
                .isNotEqualTo("unsafe trace id\nvalue")
                .matches("[0-9a-f-]{36}");
        assertThat(request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE))
                .isEqualTo(responseTraceId);
    }
}
