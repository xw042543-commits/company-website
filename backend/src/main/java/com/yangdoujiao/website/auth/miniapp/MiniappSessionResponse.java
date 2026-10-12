package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;

import com.yangdoujiao.website.auth.external.UserExternalIdentity;

public record MiniappSessionResponse(
        String accessToken,
        OffsetDateTime accessExpiresAt,
        String refreshToken,
        OffsetDateTime refreshExpiresAt,
        MiniappAccountResponse account) {
    public static MiniappSessionResponse from(MiniappTokenSet tokens, UserExternalIdentity identity) {
        return new MiniappSessionResponse(tokens.accessToken(), tokens.accessExpiresAt(),
                tokens.refreshToken(), tokens.refreshExpiresAt(),
                MiniappAccountResponse.from(tokens.account(), identity));
    }
}
