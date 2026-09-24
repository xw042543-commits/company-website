package com.yangdoujiao.website.consultation;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ConsultationRateLimitInterceptorTest {

    @Test
    void checksPostAttemptsBeforeControllerArgumentResolution() {
        ConsultationRateLimiter limiter = mock(ConsultationRateLimiter.class);
        ConsultationClientAddressResolver resolver = mock(ConsultationClientAddressResolver.class);
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST",
                "/api/v1/consultations"
        );
        MockHttpServletResponse response = new MockHttpServletResponse();
        org.mockito.Mockito.when(resolver.resolve(request)).thenReturn("203.0.113.10");
        ConsultationRateLimitInterceptor interceptor = new ConsultationRateLimitInterceptor(
                limiter,
                resolver
        );

        interceptor.preHandle(request, response, new Object());

        verify(limiter).check("203.0.113.10");
    }

    @Test
    void ignoresNonPostRequests() {
        ConsultationRateLimiter limiter = mock(ConsultationRateLimiter.class);
        ConsultationClientAddressResolver resolver = mock(ConsultationClientAddressResolver.class);
        ConsultationRateLimitInterceptor interceptor = new ConsultationRateLimitInterceptor(
                limiter,
                resolver
        );

        interceptor.preHandle(
                new MockHttpServletRequest("GET", "/api/v1/consultations"),
                new MockHttpServletResponse(),
                new Object()
        );

        verifyNoInteractions(limiter, resolver);
    }
}
