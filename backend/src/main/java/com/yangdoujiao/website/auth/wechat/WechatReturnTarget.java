package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

public final class WechatReturnTarget {
    private WechatReturnTarget() {
    }

    public static String normalize(String locale, String value) {
        String safeLocale = "zh".equals(locale) ? "zh" : "en";
        String fallback = "/" + safeLocale + "/account";
        if (value == null || !value.startsWith("/") || value.startsWith("//")
                || value.contains("\\") || value.chars().anyMatch(Character::isISOControl)) return fallback;
        try {
            URI parsed = URI.create(value);
            if (parsed.isAbsolute() || parsed.getRawAuthority() != null
                    || !parsed.getPath().startsWith("/" + safeLocale + "/")) return fallback;
            return value;
        } catch (IllegalArgumentException exception) {
            return fallback;
        }
    }
}
