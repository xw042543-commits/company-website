package com.yangdoujiao.website.auth.session;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.AuthValidationException;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.config.SessionCookieConfig;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthenticationService {
    private final AuthenticationManager manager;
    private final SecurityContextRepository contexts;
    private final AccountIdentifierNormalizer normalizer;
    private final AuthRateLimiter limiter;
    private final AuthRateLimitProperties limits;
    private final AuthProperties properties;

    public AuthenticationService(AuthenticationManager manager, SecurityContextRepository contexts,
            AccountIdentifierNormalizer normalizer, AuthRateLimiter limiter,
            AuthRateLimitProperties limits, AuthProperties properties) {
        this.manager = manager;
        this.contexts = contexts;
        this.normalizer = normalizer;
        this.limiter = limiter;
        this.limits = limits;
        this.properties = properties;
    }

    public UserPrincipal login(String identifier, String password, boolean rememberMe,
            String clientAddress, HttpServletRequest request, HttpServletResponse response) {
        String canonical = canonical(identifier);
        String subject = AuthHash.sha256(canonical);
        if (password == null || password.isEmpty()) {
            fail(clientAddress, subject);
            throw invalid();
        }
        try {
            Authentication authentication = manager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(canonical, password));
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            limiter.clear("login-identifier", subject);
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            if (rememberMe) {
                request.setAttribute(SessionCookieConfig.REMEMBER_ME_REQUEST_ATTRIBUTE, Boolean.TRUE);
            }
            contexts.saveContext(context, request, response);
            request.changeSessionId();
            request.getSession(false).setMaxInactiveInterval(Math.toIntExact(
                    (rememberMe ? properties.rememberedSessionTimeout() : properties.sessionTimeout()).toSeconds()));
            return principal;
        } catch (AuthenticationException exception) {
            fail(clientAddress, subject);
            throw invalid();
        }
    }

    private String canonical(String identifier) {
        try {
            return normalizer.normalizeLogin(identifier).value();
        } catch (AuthValidationException exception) {
            return identifier == null ? "" : identifier;
        }
    }

    private void fail(String clientAddress, String subject) {
        ApiException rateLimit = null;
        try {
            limiter.consume("login-ip", AuthHash.sha256(clientAddress), limits.loginPerIp(), limits.window());
        } catch (ApiException exception) {
            rateLimit = exception;
        }
        try {
            limiter.consume("login-identifier", subject, limits.loginPerIdentifier(), limits.window());
        } catch (ApiException exception) {
            if (rateLimit == null) rateLimit = exception;
        }
        if (rateLimit != null) throw rateLimit;
    }

    private ApiException invalid() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials");
    }
}
