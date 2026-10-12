package com.yangdoujiao.website.community;

public interface CommunityRiskPolicy {
    enum RiskDecision { PUBLISH, REVIEW, REJECT }
    RiskDecision classify(String normalizedText);
}
