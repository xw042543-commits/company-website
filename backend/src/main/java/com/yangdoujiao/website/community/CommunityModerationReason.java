package com.yangdoujiao.website.community;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CommunityModerationReason { SPAM, HARASSMENT, SCAM, INAPPROPRIATE_CONTENT, POLICY_VIOLATION,
    APPEAL_ACCEPTED, REVIEW_APPROVED, REPORT_UNFOUNDED;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static CommunityModerationReason fromJson(Object value) {
        return CommunityRequestJson.enumToken(value, CommunityModerationReason.class);
    }
}
