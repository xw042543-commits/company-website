package com.yangdoujiao.website.auth.wechat;

public record WechatProviderIdentity(String clientId, String subject) {
    public WechatProviderIdentity {
        if (clientId == null || clientId.isBlank() || subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("WeChat provider identity is incomplete");
        }
    }
}
