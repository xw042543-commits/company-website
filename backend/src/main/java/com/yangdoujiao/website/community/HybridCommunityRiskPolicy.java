package com.yangdoujiao.website.community;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public final class HybridCommunityRiskPolicy implements CommunityRiskPolicy {
    private final ConfiguredCommunityRiskPolicy local;
    private final CommunityContentSafetyGateway external;
    private final CommunityMetrics metrics;

    HybridCommunityRiskPolicy(ConfiguredCommunityRiskPolicy local,
            CommunityContentSafetyGateway external, CommunityMetrics metrics) {
        this.local = local;
        this.external = external;
        this.metrics = metrics;
    }

    @Override
    public RiskDecision classify(String normalizedText) {
        return local.classify(normalizedText);
    }

    @Override
    public RiskDecision classify(long actorId, String normalizedText) {
        return classify(actorId, CommunityTargetType.POST, normalizedText);
    }

    @Override
    public RiskDecision classify(long actorId, CommunityTargetType contentType, String normalizedText) {
        RiskDecision localDecision = local.classify(normalizedText);
        metrics.contentSafety(contentType, CommunityMetrics.SafetyStage.LOCAL, switch (localDecision) {
            case PUBLISH -> CommunityMetrics.SafetyResult.PASS;
            case REVIEW -> CommunityMetrics.SafetyResult.REVIEW;
            case REJECT -> CommunityMetrics.SafetyResult.REJECT;
        });
        if (localDecision != RiskDecision.PUBLISH) return localDecision;

        var externalResult = external.check(actorId, normalizedText);
        metrics.contentSafety(contentType, CommunityMetrics.SafetyStage.WECHAT, switch (externalResult) {
            case PASS -> CommunityMetrics.SafetyResult.PASS;
            case REVIEW -> CommunityMetrics.SafetyResult.REVIEW;
            case UNAVAILABLE -> CommunityMetrics.SafetyResult.UNAVAILABLE;
        });
        return switch (externalResult) {
            case PASS -> RiskDecision.PUBLISH;
            case REVIEW, UNAVAILABLE -> RiskDecision.REVIEW;
        };
    }
}
