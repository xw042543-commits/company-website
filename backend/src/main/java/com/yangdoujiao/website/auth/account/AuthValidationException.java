package com.yangdoujiao.website.auth.account;

public class AuthValidationException extends IllegalArgumentException {
    public AuthValidationException() {
        super("Invalid account identifier");
    }
}
