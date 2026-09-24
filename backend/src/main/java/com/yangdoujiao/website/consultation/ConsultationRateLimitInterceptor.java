package com.yangdoujiao.website.consultation;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ConsultationRateLimitInterceptor implements HandlerInterceptor {

    private final ConsultationRateLimiter rateLimiter;
    private final ConsultationClientAddressResolver clientAddressResolver;

    public ConsultationRateLimitInterceptor(
            ConsultationRateLimiter rateLimiter,
            ConsultationClientAddressResolver clientAddressResolver
    ) {
        this.rateLimiter = rateLimiter;
        this.clientAddressResolver = clientAddressResolver;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        if ("POST".equals(request.getMethod())) {
            rateLimiter.check(clientAddressResolver.resolve(request));
        }
        return true;
    }
}
