package com.yangdoujiao.website.auth.verification;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod & (dev | test)")
public class LocalAuthNotificationStore implements AuthNotificationSender {
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(15);
    private static final int DEFAULT_CAPACITY = 1_000;

    private final ConcurrentHashMap<String, Notification> notifications = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Watermark> watermarks = new ConcurrentHashMap<>();
    private final AtomicLong issueSequence = new AtomicLong();
    private long evictionFloor;
    private final Clock clock;
    private final Duration ttl;
    private final int capacity;

    public LocalAuthNotificationStore() { this(Clock.systemUTC(), DEFAULT_TTL, DEFAULT_CAPACITY); }

    LocalAuthNotificationStore(Clock clock, Duration ttl, int capacity) {
        if (clock == null || ttl == null || ttl.isZero() || ttl.isNegative() || capacity < 1) {
            throw new IllegalArgumentException("Invalid local notification cache limits");
        }
        this.clock = clock;
        this.ttl = ttl;
        this.capacity = capacity;
    }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public long reserveIssueSequence() { return issueSequence.incrementAndGet(); }

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale) {
        sendEmailVerification(normalizedEmail, rawToken, locale, reserveIssueSequence());
    }

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale, long sequence) {
        publish(normalizedEmail, "EMAIL", rawToken, sequence, clock.instant().plus(ttl.multipliedBy(2)));
    }

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale,
            long sequence, Instant expiresAt) {
        publish(normalizedEmail, "EMAIL", rawToken, sequence, expiresAt);
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale) {
        sendPhoneVerification(normalizedPhone, rawCode, locale, reserveIssueSequence());
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale, long sequence) {
        publish(normalizedPhone, "PHONE", rawCode, sequence, clock.instant().plus(ttl.multipliedBy(2)));
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale,
            long sequence, Instant expiresAt) {
        publish(normalizedPhone, "PHONE", rawCode, sequence, expiresAt);
    }

    @Override
    public void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale) {
        publish(normalizedIdentifier, "PASSWORD_RESET", rawToken, reserveIssueSequence(),
                clock.instant().plus(ttl.multipliedBy(2)));
    }

    public synchronized Optional<Notification> take(String exactIdentifier) {
        Notification notification = notifications.remove(exactIdentifier);
        return notification == null || !notification.expiresAt().isAfter(clock.instant())
                ? Optional.empty() : Optional.of(notification);
    }

    public synchronized boolean awaitAvailable(String exactIdentifier, Duration timeout) throws InterruptedException {
        long remaining = timeout.toNanos();
        long deadline = System.nanoTime() + remaining;
        while (true) {
            Notification current = notifications.get(exactIdentifier);
            if (current != null && current.expiresAt().isAfter(clock.instant())) return true;
            if (remaining <= 0) return false;
            TimeUnit.NANOSECONDS.timedWait(this, remaining);
            remaining = deadline - System.nanoTime();
        }
    }

    private synchronized void publish(String identifier, String method, String token, long sequence,
            Instant tokenExpiresAt) {
        Instant now = clock.instant();
        if (!tokenExpiresAt.isAfter(now)) return;
        notifications.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));
        watermarks.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));
        Watermark previous = watermarks.get(identifier);
        if (sequence <= evictionFloor || (previous != null && sequence <= previous.issueSequence())) return;
        if (previous == null && watermarks.size() >= capacity) {
            watermarks.entrySet().stream()
                    .min(Comparator.comparingLong(entry -> entry.getValue().issueSequence()))
                    .ifPresent(entry -> {
                        evictionFloor = Math.max(evictionFloor, entry.getValue().issueSequence());
                        watermarks.remove(entry.getKey());
                        notifications.remove(entry.getKey());
                    });
        }
        watermarks.put(identifier, new Watermark(sequence, tokenExpiresAt));
        Instant visibleUntil = now.plus(ttl).isBefore(tokenExpiresAt) ? now.plus(ttl) : tokenExpiresAt;
        Notification incoming = new Notification(method, token, sequence, visibleUntil);
        notifications.compute(identifier, (key, existing) -> existing == null || sequence > existing.issueSequence()
                ? incoming : existing);
        notifyAll();
    }

    public record Notification(String method, String token, long issueSequence, Instant expiresAt) {}
    private record Watermark(long issueSequence, Instant expiresAt) {}
}
