package com.yangdoujiao.website.auth.config;

import java.net.URI;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth.production")
public record ProductionRegistrationProperties(
        NotificationProvider notificationProvider,
        URI publicSiteOrigin,
        boolean launchApproved
) {
    public enum NotificationProvider {
        NONE, EXTERNAL
    }
}
