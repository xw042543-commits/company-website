package com.yangdoujiao.website.auth.config;

import java.net.URI;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@Profile("prod")
public class ProductionRegistrationGuard {
    private final AuthProperties auth;
    private final ProductionRegistrationProperties production;
    private final ObjectProvider<ProductionNotificationReadiness> providers;
    private final String[] allowedOrigins;
    private final boolean secureCookie;

    public ProductionRegistrationGuard(
            AuthProperties auth,
            ProductionRegistrationProperties production,
            ObjectProvider<ProductionNotificationReadiness> providers,
            @Value("${app.cors.allowed-origins:}") String[] allowedOrigins,
            @Value("${server.servlet.session.cookie.secure:false}") boolean secureCookie
    ) {
        this.auth = auth;
        this.production = production;
        this.providers = providers;
        this.allowedOrigins = allowedOrigins;
        this.secureCookie = secureCookie;
    }

    @PostConstruct
    public void validate() {
        if (!auth.registrationEnabled()) return;
        if (production.notificationProvider() != ProductionRegistrationProperties.NotificationProvider.EXTERNAL) {
            throw new IllegalStateException("app.auth.production notification-provider must be EXTERNAL");
        }
        if (providers.stream().noneMatch(ProductionNotificationReadiness::isReady)) {
            throw new IllegalStateException("A ready production notification provider implementation is required");
        }
        URI origin = production.publicSiteOrigin();
        if (!isPublicHttpsOrigin(origin)) {
            throw new IllegalStateException("app.auth.production public-site-origin must be a public HTTPS origin");
        }
        if (!secureCookie) {
            throw new IllegalStateException("Production registration requires Secure session cookie");
        }
        if (allowedOrigins == null || allowedOrigins.length != 1 || !origin.toString().equals(allowedOrigins[0])) {
            throw new IllegalStateException("Production registration requires CORS to allow only the public site origin");
        }
        if (!production.launchApproved()) {
            throw new IllegalStateException("app.auth.production launch-approved is required");
        }
    }

    private boolean isPublicHttpsOrigin(URI origin) {
        if (origin == null || !"https".equalsIgnoreCase(origin.getScheme()) || origin.getHost() == null
                || origin.getRawUserInfo() != null || origin.getRawQuery() != null || origin.getRawFragment() != null
                || !origin.getRawPath().isEmpty() || origin.getPort() != -1) {
            return false;
        }
        String host = origin.getHost();
        return host.contains(".") && !host.equalsIgnoreCase("localhost")
                && !host.matches("[0-9.]+") && !host.contains(":");
    }
}
