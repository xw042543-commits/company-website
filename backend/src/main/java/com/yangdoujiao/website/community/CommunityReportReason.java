package com.yangdoujiao.website.community;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CommunityReportReason {
    SPAM, HARASSMENT, SCAM, INAPPROPRIATE_CONTENT, OTHER;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static CommunityReportReason fromJson(Object value) {
        return CommunityRequestJson.enumToken(value, CommunityReportReason.class);
    }
}
