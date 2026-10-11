package com.yangdoujiao.website.auth.miniapp;

import java.io.IOException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.auth.api.AuthSecurityErrorWriter;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@ConditionalOnBean(MiniappTokenService.class)
public class MiniappBearerFilter extends OncePerRequestFilter {
    public static final String AUTHENTICATED_ATTRIBUTE = MiniappBearerFilter.class.getName() + ".authenticated";
    private static final String PREFIX = "Bearer ";

    private final MiniappTokenService tokens;
    private final AuthSecurityErrorWriter errors;

    public MiniappBearerFilter(MiniappTokenService tokens, AuthSecurityErrorWriter errors) {
        this.tokens = tokens;
        this.errors = errors;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.startsWith("/api/v1/miniapp/") && !path.startsWith("/api/v1/community/")
                && !path.equals("/api/v1/consultations");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (path.startsWith("/api/v1/miniapp/") || (authorization != null && authorization.startsWith(PREFIX))) {
            SecurityContextHolder.clearContext();
        }
        if (authorization != null && authorization.startsWith(PREFIX)) {
            try {
                UserPrincipal principal = UserPrincipal.from(tokens.authenticate(
                        authorization.substring(PREFIX.length())));
                SecurityContextHolder.getContext().setAuthentication(
                        UsernamePasswordAuthenticationToken.authenticated(
                                principal, null, principal.getAuthorities()));
                request.setAttribute(AUTHENTICATED_ATTRIBUTE, true);
            } catch (ApiException ignored) {
                SecurityContextHolder.clearContext();
                errors.writeUnauthorized(request, response);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
