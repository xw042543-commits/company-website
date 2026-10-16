package com.yangdoujiao.website.planningagent.evidence;

import java.time.Instant;

public record Evidence(long id, long programmeId, String factType,
        String sourceUrl, String sourceType, String studentScope, String intake,
        Instant checkedAt, Instant expiresAt, String reviewStatus,
        Long reviewerId, String excerpt, boolean conflict) {
}
