package com.yangdoujiao.website.auth.wechat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpSession;

@Component
public class WechatOAuthStateStore {
    static final String STATE_ATTRIBUTE = WechatOAuthStateStore.class.getName() + ".state";
    static final String PENDING_ATTRIBUTE = WechatOAuthStateStore.class.getName() + ".pending";
    private final SecureRandom random = new SecureRandom();
    private final WechatAuthProperties properties;

    public WechatOAuthStateStore(WechatAuthProperties properties) {
        this.properties = properties;
    }

    public String issue(HttpSession session, String locale, String returnTo, Instant now) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String value = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        session.setAttribute(STATE_ATTRIBUTE, new WechatOAuthState(value, "zh".equals(locale) ? "zh" : "en",
                WechatReturnTarget.normalize(locale, returnTo), now.plus(properties.stateTtl())));
        return value;
    }

    public WechatOAuthState consume(HttpSession session, String supplied, Instant now) {
        Object stored = session.getAttribute(STATE_ATTRIBUTE);
        session.removeAttribute(STATE_ATTRIBUTE);
        if (!(stored instanceof WechatOAuthState state) || supplied == null
                || !now.isBefore(state.expiresAt())
                || !MessageDigest.isEqual(state.value().getBytes(StandardCharsets.UTF_8),
                        supplied.getBytes(StandardCharsets.UTF_8))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "WECHAT_STATE_INVALID", "WeChat authorization expired");
        }
        return state;
    }
}
