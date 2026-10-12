package com.yangdoujiao.website.auth.api;

import com.yangdoujiao.website.auth.account.AccountIdentifierType;

public record RegistrationResponse(AccountIdentifierType verificationMethod, String message) {
    public static RegistrationResponse accepted(AccountIdentifierType method) {
        return new RegistrationResponse(method, "If eligible, verification instructions have been sent");
    }
}
