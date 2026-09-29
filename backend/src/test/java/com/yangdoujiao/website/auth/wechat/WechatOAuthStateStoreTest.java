package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

import com.yangdoujiao.website.common.exception.ApiException;

class WechatOAuthStateStoreTest {
    private final WechatOAuthStateStore store = new WechatOAuthStateStore(
            new WechatAuthProperties(false, "", "", null, Duration.ofMinutes(5), Duration.ofMinutes(15)));

    @Test
    void issuesRandomUrlSafeOneTimeStateBoundToTheSession() {
        Instant now = Instant.parse("2026-09-29T02:00:00Z");
        MockHttpSession first = new MockHttpSession();
        MockHttpSession second = new MockHttpSession();
        String state = store.issue(first, "zh", "/zh/account", now);
        assertThat(state).matches("[A-Za-z0-9_-]{43}");
        assertThat(store.issue(second, "zh", "/zh/account", now)).isNotEqualTo(state);
        assertThatThrownBy(() -> store.consume(second, state, now.plusSeconds(1)))
                .isInstanceOf(ApiException.class);
        assertThat(store.consume(first, state, now.plusSeconds(1)).returnTo()).isEqualTo("/zh/account");
        assertThatThrownBy(() -> store.consume(first, state, now.plusSeconds(2)))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void rejectsExpiredState() {
        Instant now = Instant.parse("2026-09-29T02:00:00Z");
        MockHttpSession session = new MockHttpSession();
        String state = store.issue(session, "en", "/en/universities", now);
        assertThatThrownBy(() -> store.consume(session, state, now.plus(Duration.ofMinutes(6))))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void rejectsStateAtTheExactExpiryBoundary() {
        Instant now = Instant.parse("2026-09-29T02:00:00Z");
        MockHttpSession session = new MockHttpSession();
        String state = store.issue(session, "zh", "/zh/account", now);
        assertThatThrownBy(() -> store.consume(session, state, now.plus(Duration.ofMinutes(5))))
                .isInstanceOf(ApiException.class);
    }
}
