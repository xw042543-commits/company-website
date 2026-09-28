package com.yangdoujiao.website.auth.api;

public record DeleteAccountRequest(String currentPassword, String confirmation) {
}
