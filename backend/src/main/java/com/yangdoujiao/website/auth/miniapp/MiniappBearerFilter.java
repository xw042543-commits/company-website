package com.yangdoujiao.website.auth.miniapp;

import java.io.IOException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@ConditionalOnBean(MiniappTokenService.class)
public class MiniappBearerFilter extends OncePerRequestFilter {
    private static final String PREFIX = "Bearer ";

    private final MiniappTokenService tokens;

    public MiniappBearerFilter(MiniappTokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.startsWith("/api/v1/miniapp/") && !path.startsWith("/api/v1/community/");
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
            } catch (ApiException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
