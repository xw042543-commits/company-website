package com.yangdoujiao.website.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.util.unit.DataSize;
import org.springframework.web.filter.CorsFilter;

import jakarta.servlet.FilterChain;

import com.yangdoujiao.website.common.web.ApiPayloadLimitFilter;
import com.yangdoujiao.website.common.web.RequestTraceFilter;
import com.yangdoujiao.website.consultation.ConsultationRateLimitInterceptor;

import tools.jackson.databind.ObjectMapper;

class WebConfigTest {

    @Test
    void corsRegistrationDoesNotOccupySpringSecurityCorsFilterBeanName() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().getPropertySources().addFirst(new MapPropertySource(
                    "test", Map.of("app.cors.allowed-origins", "http://localhost:3000")));
            context.registerBean(ConsultationRateLimitInterceptor.class,
                    () -> org.mockito.Mockito.mock(ConsultationRateLimitInterceptor.class));
            context.register(WebConfig.class);
            context.refresh();

            assertThat(context.containsBean("corsFilter")).isFalse();
            FilterRegistrationBean<?> registration = context.getBean(
                    "corsFilterRegistration", FilterRegistrationBean.class);
            assertThat(registration.getFilter()).isInstanceOf(CorsFilter.class);
        }
    }

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

        configuration.corsFilterRegistration().getFilter().doFilter(request, response, downstream);

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getHeader("Access-Control-Allow-Origin"))
                .isEqualTo("http://localhost:3000");
    }

    @Test
    void appliesCorsHeadersWhenAuthenticationPayloadLimitReturns413() throws Exception {
        WebConfig configuration = new WebConfig(
                new String[] {"http://localhost:3000"},
                org.mockito.Mockito.mock(ConsultationRateLimitInterceptor.class)
        );
        ApiPayloadLimitFilter payloadLimitFilter = new ApiPayloadLimitFilter(
                new ObjectMapper(), DataSize.ofKilobytes(16), DataSize.ofKilobytes(8));
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST", "/api/v1/auth/register");
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent("x".repeat(8_193).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        request.addHeader("Origin", "http://localhost:3000");
        request.setAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE, "auth-trace");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain payloadFilter = (servletRequest, servletResponse) ->
                payloadLimitFilter.doFilter(servletRequest, servletResponse,
                        (ignoredRequest, ignoredResponse) -> {
                            throw new AssertionError("payload filter must stop");
                        });

        configuration.corsFilterRegistration().getFilter().doFilter(request, response, payloadFilter);

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getHeader("Access-Control-Allow-Origin"))
                .isEqualTo("http://localhost:3000");
        assertThat(response.getContentAsString()).contains("AUTH_PAYLOAD_TOO_LARGE", "auth-trace");
    }
}
