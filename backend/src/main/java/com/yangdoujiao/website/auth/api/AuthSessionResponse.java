package com.yangdoujiao.website.auth.api;

import com.yangdoujiao.website.auth.session.UserPrincipal;

public record AuthSessionResponse(boolean authenticated, Long userId, String fullName, boolean adviser) {
    public static AuthSessionResponse anonymous() {
        return new AuthSessionResponse(false, null, null, false);
    }

    public static AuthSessionResponse authenticated(UserPrincipal principal) {
        return new AuthSessionResponse(true, principal.userId(), principal.fullName(), principal.isAdviser());
    }
}
