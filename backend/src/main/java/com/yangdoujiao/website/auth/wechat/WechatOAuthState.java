package com.yangdoujiao.website.auth.wechat;

import java.io.Serializable;
import java.time.Instant;

public record WechatOAuthState(String value, String locale, String returnTo, Instant expiresAt)
        implements Serializable {
}
