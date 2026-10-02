package com.yangdoujiao.website.auth.wechat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpSession;

@Component
public class WechatOAuthStateStore {
    static final String STATE_ATTRIBUTE = WechatOAuthStateStore.class.getName() + ".state";
    static final String PENDING_ATTRIBUTE = WechatOAuthStateStore.class.getName() + ".pending";
    private static final int MAX_OUTSTANDING_STATES = 20;
    private final SecureRandom random = new SecureRandom();
    private final WechatAuthProperties properties;

    public WechatOAuthStateStore(WechatAuthProperties properties) {
        this.properties = properties;
    }

    public String issue(HttpSession session, String locale, String returnTo, Instant now) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String value = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        WechatOAuthState state = new WechatOAuthState(value, "zh".equals(locale) ? "zh" : "en",
                WechatReturnTarget.normalize(locale, returnTo), now.plus(properties.stateTtl()));
        synchronized (session) {
            LinkedHashMap<String, WechatOAuthState> states = outstanding(session, now);
            while (states.size() >= MAX_OUTSTANDING_STATES) {
                states.remove(states.keySet().iterator().next());
            }
            states.put(value, state);
            session.setAttribute(STATE_ATTRIBUTE, states);
        }
        return value;
    }

    public WechatOAuthState consume(HttpSession session, String supplied, Instant now) {
        synchronized (session) {
            LinkedHashMap<String, WechatOAuthState> states = outstanding(session, now);
            WechatOAuthState state = supplied == null ? null : states.remove(supplied);
            if (states.isEmpty()) session.removeAttribute(STATE_ATTRIBUTE);
            else session.setAttribute(STATE_ATTRIBUTE, states);
            if (state == null || !now.isBefore(state.expiresAt())
                    || !MessageDigest.isEqual(state.value().getBytes(StandardCharsets.UTF_8),
                            supplied.getBytes(StandardCharsets.UTF_8))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "WECHAT_STATE_INVALID", "WeChat authorization expired");
            }
            return state;
        }
    }

    private LinkedHashMap<String, WechatOAuthState> outstanding(HttpSession session, Instant now) {
        Object stored = session.getAttribute(STATE_ATTRIBUTE);
        LinkedHashMap<String, WechatOAuthState> states = new LinkedHashMap<>();
        if (stored instanceof WechatOAuthState legacy) {
            states.put(legacy.value(), legacy);
        } else if (stored instanceof Map<?, ?> values) {
            for (Map.Entry<?, ?> entry : values.entrySet()) {
                if (entry.getKey() instanceof String key && entry.getValue() instanceof WechatOAuthState state) {
                    states.put(key, state);
                }
            }
        }
        states.entrySet().removeIf(entry -> !now.isBefore(entry.getValue().expiresAt()));
        return states;
    }
}
