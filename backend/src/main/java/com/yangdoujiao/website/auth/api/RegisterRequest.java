package com.yangdoujiao.website.auth.api;

public record RegisterRequest(String fullName, String email, String phone, String password,
        boolean agreementAccepted, boolean privacyAccepted, String locale) {}
