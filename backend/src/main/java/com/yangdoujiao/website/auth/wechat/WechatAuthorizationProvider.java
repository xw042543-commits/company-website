package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

public interface WechatAuthorizationProvider {
    URI authorizationUri(String state);
    WechatProviderIdentity exchange(String authorizationCode);
    String clientId();
}
