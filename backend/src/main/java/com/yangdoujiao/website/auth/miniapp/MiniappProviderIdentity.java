package com.yangdoujiao.website.auth.miniapp;

public record MiniappProviderIdentity(String clientId, String subject, String unionId) {
    public MiniappProviderIdentity {
        if (clientId == null || clientId.isBlank()) throw new IllegalArgumentException("clientId is required");
        if (subject == null || subject.isBlank()) throw new IllegalArgumentException("subject is required");
        clientId = clientId.strip();
        subject = subject.strip();
        unionId = unionId == null || unionId.isBlank() ? null : unionId.strip();
    }
}
