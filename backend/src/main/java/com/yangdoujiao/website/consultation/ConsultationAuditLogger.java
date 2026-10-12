package com.yangdoujiao.website.consultation;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Audits only workflow identifiers; request bodies and consultation entities are never logged. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ConsultationAuditLogger extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(ConsultationAuditLogger.class);
    private static final String RECORDED = ConsultationAuditLogger.class.getName() + ".recorded";
    private static final String PREFIX = "/api/v1/adviser/consultations/";
    private static final String SUFFIX = "/status";

    public void record(UUID reference, Long actorId, ConsultationStatus priorStatus,
            ConsultationStatus newStatus, String outcome, String traceId) {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            attributes.getRequest().setAttribute(RECORDED, true);
        }
        log.info("event=consultation_status_update outcome={} actorId={} referenceHash={} priorStatus={} newStatus={} traceId={}",
                safe(outcome), actorId == null ? "unknown" : actorId,
                reference == null ? "unknown" : AuthHash.sha256(reference.toString()),
                priorStatus == null ? "unknown" : priorStatus.name(),
                newStatus == null ? "unknown" : newStatus.name(),
                traceId == null ? "unknown" : "sha256:" + AuthHash.sha256(traceId));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !request.getMethod().equals("PATCH") || !path.startsWith(PREFIX) || !path.endsWith(SUFFIX)
                || path.length() <= PREFIX.length() + SUFFIX.length()
                || path.substring(PREFIX.length(), path.length() - SUFFIX.length()).contains("/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Capture session identity before security clears its thread context, including CSRF rejections.
        Long actorId = actorId(request);
        try {
            chain.doFilter(request, response);
        } finally {
            if (response.getStatus() >= 400 && !Boolean.TRUE.equals(request.getAttribute(RECORDED))) {
                Object trace = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
                record(reference(request), actorId, null, null, "REJECTED_HTTP_" + response.getStatus(),
                        trace == null ? null : trace.toString());
            }
        }
    }

    private Long actorId(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null && request.getSession(false) != null
                && request.getSession(false).getAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY) instanceof SecurityContext context) {
            authentication = context.getAuthentication();
        }
        return authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal
                ? principal.userId() : null;
    }

    private UUID reference(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        String candidate = path.substring(PREFIX.length(), path.length() - SUFFIX.length());
        try {
            UUID reference = UUID.fromString(candidate);
            return reference.toString().equalsIgnoreCase(candidate) ? reference : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String safe(String value) {
        if (value == null) return "unknown";
        String sanitized = value.replaceAll("[^A-Za-z0-9._-]", "_");
        return sanitized.substring(0, Math.min(sanitized.length(), 64));
    }
}
