package com.yangdoujiao.website.auth.verification;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Locale;

import org.junit.jupiter.api.Test;

class LocalAuthNotificationStoreTest {
    @Test
    void olderCallbackCannotReplaceNewerNotification() {
        LocalAuthNotificationStore store = new LocalAuthNotificationStore(
                Clock.systemUTC(), Duration.ofMinutes(5), 2);
        long older = store.reserveIssueSequence();
        long newer = store.reserveIssueSequence();
        store.sendEmailVerification("a@example.com", "new", Locale.ENGLISH, newer);
        store.sendEmailVerification("a@example.com", "old", Locale.ENGLISH, older);
        assertThat(store.take("a@example.com")).get().extracting(LocalAuthNotificationStore.Notification::token)
                .isEqualTo("new");
        assertThat(store.take("a@example.com")).isEmpty();
    }

    @Test
    void expiresSecretsAndEvictsOldestWhenAtCapacity() {
        MutableClock clock = new MutableClock();
        LocalAuthNotificationStore store = new LocalAuthNotificationStore(clock, Duration.ofMinutes(5), 2);
        store.sendEmailVerification("a@example.com", "a", Locale.ENGLISH);
        store.sendEmailVerification("b@example.com", "b", Locale.ENGLISH);
        store.sendEmailVerification("c@example.com", "c", Locale.ENGLISH);
        assertThat(store.take("a@example.com")).isEmpty();
        assertThat(store.take("b@example.com")).isPresent();
        clock.advance(Duration.ofMinutes(6));
        assertThat(store.take("c@example.com")).isEmpty();
    }

    private static final class MutableClock extends Clock {
        private Instant instant = Instant.parse("2026-09-24T00:00:00Z");
        void advance(Duration amount) { instant = instant.plus(amount); }
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return instant; }
    }
}
