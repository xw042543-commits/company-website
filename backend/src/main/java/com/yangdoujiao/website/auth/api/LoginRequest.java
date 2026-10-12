package com.yangdoujiao.website.auth.api;

public record LoginRequest(String identifier, String password, Boolean rememberMe) {}
