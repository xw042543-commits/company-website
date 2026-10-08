package com.yangdoujiao.website.auth.miniapp;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;

public record MiniappAccountResponse(
        Long id,
        String displayName,
        String avatarUrl,
        String bindingStatus) {
    public static MiniappAccountResponse from(UserAccount account, UserExternalIdentity identity) {
        return new MiniappAccountResponse(account.getId(), account.getFullName(),
                identity == null ? null : identity.getAvatarUrl(), identity == null ? "UNLINKED" : "LINKED");
    }
}
