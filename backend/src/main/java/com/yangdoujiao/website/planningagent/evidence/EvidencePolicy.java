package com.yangdoujiao.website.planningagent.evidence;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;

public class EvidencePolicy {
    public EvidenceState assess(Evidence evidence, Instant now, String intake) {
        if (evidence == null || now == null || intake == null || intake.isBlank()
                || !intake.equals(evidence.intake())
                || !"OFFICIAL".equals(evidence.sourceType())
                || !"CN_MAINLAND".equals(evidence.studentScope())
                || !"VERIFIED".equals(evidence.reviewStatus())
                || evidence.reviewerId() == null || evidence.reviewerId() <= 0
                || evidence.conflict() || !isHttpsUrl(evidence.sourceUrl())
                || evidence.checkedAt() == null || evidence.checkedAt().isAfter(now)
                || Duration.between(evidence.checkedAt(), now).compareTo(Duration.ofDays(90)) > 0
                || (evidence.expiresAt() != null && !evidence.expiresAt().isAfter(now))) {
            return EvidenceState.REVIEW_REQUIRED;
        }
        return EvidenceState.VERIFIED;
    }

    private boolean isHttpsUrl(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) {
            return false;
        }
        try {
            URI uri = new URI(sourceUrl);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && uri.getHost() != null && uri.getRawUserInfo() == null;
        } catch (URISyntaxException invalidUrl) {
            return false;
        }
    }
}
