package com.yangdoujiao.website.community;

public interface CommunityRiskPolicy {
    enum RiskDecision { PUBLISH, REVIEW, REJECT }
    RiskDecision classify(String normalizedText);

    default RiskDecision classify(long actorId, String normalizedText) {
        return classify(normalizedText);
    }
}
