package com.yangdoujiao.website.auth.account;

import java.time.OffsetDateTime;

public record ProfileEdit(String fullName, String avatarAction, String contentType, String contentBase64, OffsetDateTime expectedUpdatedAt) {
    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void rejectExtraField(String field, Object value) { throw new IllegalArgumentException("仅允许修改用户名和头像"); }
}
