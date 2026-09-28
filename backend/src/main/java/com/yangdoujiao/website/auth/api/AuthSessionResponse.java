package com.yangdoujiao.website.auth.api;

import com.yangdoujiao.website.auth.session.UserPrincipal;

public record AuthSessionResponse(boolean authenticated, Long userId, String fullName,
        String email, String phone) {
    public static AuthSessionResponse anonymous() {
        return new AuthSessionResponse(false, null, null, null, null);
    }

    public static AuthSessionResponse authenticated(UserPrincipal principal) {
        return new AuthSessionResponse(true, principal.userId(), principal.fullName(),
                principal.email(), principal.phone());
    }
}
