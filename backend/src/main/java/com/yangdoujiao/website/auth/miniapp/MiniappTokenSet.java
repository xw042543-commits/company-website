package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;

import com.yangdoujiao.website.auth.account.UserAccount;

record MiniappTokenSet(
        String accessToken,
        OffsetDateTime accessExpiresAt,
        String refreshToken,
        OffsetDateTime refreshExpiresAt,
        UserAccount account) {
}
