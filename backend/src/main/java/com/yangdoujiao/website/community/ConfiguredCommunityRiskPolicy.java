package com.yangdoujiao.website.community;

import jakarta.annotation.PostConstruct;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/** Deployment owns the policy terms. No personal data or example detection terms ship in the default policy. */
@Component
public class ConfiguredCommunityRiskPolicy implements CommunityRiskPolicy {
    private final CommunityProperties properties;
    private final Environment environment;
    public ConfiguredCommunityRiskPolicy(CommunityProperties properties, Environment environment) {
        this.properties = properties; this.environment = environment;
    }
    @PostConstruct void requireProductionPolicy() {
        if (environment.acceptsProfiles(Profiles.of("prod")) && properties.enabled()
                && properties.reviewTerms().isEmpty() && properties.rejectTerms().isEmpty())
            throw new IllegalStateException("Enabled production community requires configured risk policy terms");
    }
    public RiskDecision classify(String normalizedText) {
        if (properties.rejectTerms().stream().anyMatch(normalizedText::contains)) return RiskDecision.REJECT;
        if (properties.reviewTerms().stream().anyMatch(normalizedText::contains)) return RiskDecision.REVIEW;
        return RiskDecision.PUBLISH;
    }
}
