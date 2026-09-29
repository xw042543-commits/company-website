package com.yangdoujiao.website.auth.api;

public record ResetPasswordRequest(String token, String newPassword) {}
