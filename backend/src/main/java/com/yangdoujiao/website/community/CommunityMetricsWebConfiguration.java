package com.yangdoujiao.website.community;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** MVC-only test slices do not own a database/registry; the full application always owns CommunityMetrics. */
@Configuration(proxyBeanMethods = false)
class CommunityMetricsWebConfiguration implements WebMvcConfigurer {
    private final ObjectProvider<CommunityMetrics> metrics;
    CommunityMetricsWebConfiguration(ObjectProvider<CommunityMetrics> metrics) { this.metrics = metrics; }
    @Override public void addInterceptors(InterceptorRegistry interceptors) {
        metrics.ifAvailable(value -> interceptors.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                return value.preHandle(request, response, handler);
            }
            @Override public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                    Object handler, Exception exception) {
                value.afterCompletion(request, response, handler, exception);
            }
        }).addPathPatterns("/api/v1/community/**", "/api/v1/adviser/community/**"));
    }
}
