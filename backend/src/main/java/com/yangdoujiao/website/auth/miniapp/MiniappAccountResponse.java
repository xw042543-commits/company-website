package com.yangdoujiao.website.auth.miniapp;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;

public record MiniappAccountResponse(
        Long id,
        String displayName,
        String avatarUrl,
        String bindingStatus) {
    public static MiniappAccountResponse from(UserAccount account, UserExternalIdentity identity) {
        String name = identity != null && identity.getDisplayName() != null && !identity.getDisplayName().isBlank()
                ? identity.getDisplayName() : account.getFullName();
        return new MiniappAccountResponse(account.getId(), name,
                account.displayAvatar(identity == null ? null : identity.getAvatarUrl()), identity == null ? "UNLINKED" : "LINKED");
    }
}
