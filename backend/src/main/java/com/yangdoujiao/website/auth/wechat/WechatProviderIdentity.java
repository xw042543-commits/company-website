package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

public record WechatProviderIdentity(String clientId, String subject, String displayName, String avatarUrl) {
    public WechatProviderIdentity(String clientId, String subject) {
        this(clientId, subject, null, null);
    }

    public WechatProviderIdentity {
        if (clientId == null || clientId.isBlank() || subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("WeChat provider identity is incomplete");
        }
        displayName = normalizeDisplayName(displayName);
        avatarUrl = normalizeAvatarUrl(avatarUrl);
    }

    private static String normalizeDisplayName(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.strip();
        return normalized.length() <= 100 ? normalized : null;
    }

    private static String normalizeAvatarUrl(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            URI parsed = URI.create(value.strip().replaceFirst("^http://", "https://"));
            String host = parsed.getHost();
            if (!"https".equalsIgnoreCase(parsed.getScheme()) || host == null
                    || !(host.equals("qlogo.cn") || host.endsWith(".qlogo.cn"))
                    || parsed.getUserInfo() != null || parsed.getFragment() != null
                    || parsed.toString().length() > 500) return null;
            return parsed.toString();
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
