package com.yangdoujiao.website.community;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CommunityModerationCommand {
    HIDE, RESTORE, REJECT_REPORT, MUTE, BAN;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static CommunityModerationCommand fromJson(Object value) {
        return CommunityRequestJson.enumToken(value, CommunityModerationCommand.class);
    }
}
