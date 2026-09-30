package com.yangdoujiao.website.auth.api;

public record VerifyEmailRequest(String email, String code, String token) {}
