package com.yangdoujiao.website.auth.api;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
