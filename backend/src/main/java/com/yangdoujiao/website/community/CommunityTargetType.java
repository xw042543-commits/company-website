package com.yangdoujiao.website.community;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CommunityTargetType {
    POST, COMMENT;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static CommunityTargetType fromJson(Object value) {
        return CommunityRequestJson.enumToken(value, CommunityTargetType.class);
    }
}
