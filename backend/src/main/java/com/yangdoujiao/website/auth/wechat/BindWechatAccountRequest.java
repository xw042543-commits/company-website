package com.yangdoujiao.website.auth.wechat;

public record BindWechatAccountRequest(String identifier, String password, Boolean rememberMe) {
    public boolean shouldRemember() {
        return Boolean.TRUE.equals(rememberMe);
    }
}
