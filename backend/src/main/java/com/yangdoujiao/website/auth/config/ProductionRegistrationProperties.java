package com.yangdoujiao.website.auth.config;

import java.net.URI;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth.production")
public record ProductionRegistrationProperties(
        NotificationProvider notificationProvider,
        ApprovedDomain approvedDomain,
        URI publicSiteOrigin,
        boolean launchApproved
) {
    public enum NotificationProvider {
        NONE, EXTERNAL
    }

    public enum ApprovedDomain {
        NONE(null), YANGDOUJIAO_COM("yangdoujiao.com");

        private final String domain;

        ApprovedDomain(String domain) {
            this.domain = domain;
        }

        public String domain() {
            return domain;
        }
    }
}
