package com.yangdoujiao.website.auth.wechat;

import java.io.Serializable;
import java.time.Instant;

public record PendingWechatIdentity(String clientId, String subject, Instant expiresAt,
        String locale, String returnTo) implements Serializable {
}
