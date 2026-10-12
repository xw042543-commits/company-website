package com.yangdoujiao.website.community;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public final class HybridCommunityRiskPolicy implements CommunityRiskPolicy {
    private final ConfiguredCommunityRiskPolicy local;
    private final CommunityContentSafetyGateway external;

    HybridCommunityRiskPolicy(ConfiguredCommunityRiskPolicy local,
            CommunityContentSafetyGateway external) {
        this.local = local;
        this.external = external;
    }

    @Override
    public RiskDecision classify(String normalizedText) {
        return local.classify(normalizedText);
    }

    @Override
    public RiskDecision classify(long actorId, String normalizedText) {
        RiskDecision localDecision = local.classify(normalizedText);
        if (localDecision != RiskDecision.PUBLISH) return localDecision;

        return switch (external.check(actorId, normalizedText)) {
            case PASS -> RiskDecision.PUBLISH;
            case REVIEW, UNAVAILABLE -> RiskDecision.REVIEW;
        };
    }
}
