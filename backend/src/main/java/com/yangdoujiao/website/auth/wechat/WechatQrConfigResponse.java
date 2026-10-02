package com.yangdoujiao.website.auth.wechat;

public record WechatQrConfigResponse(String appId, String scope, String redirectUri, String state) {
}
