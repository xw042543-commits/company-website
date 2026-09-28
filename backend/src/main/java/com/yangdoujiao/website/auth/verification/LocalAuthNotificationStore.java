package com.yangdoujiao.website.auth.verification;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod & (dev | test)")
public class LocalAuthNotificationStore implements AuthNotificationSender {
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(15);
    private static final int DEFAULT_CAPACITY = 1_000;

    private final ConcurrentHashMap<String, Notification> notifications = new ConcurrentHashMap<>();
    private final AtomicLong issueSequence = new AtomicLong();
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
        publish(normalizedEmail, "EMAIL", rawToken, sequence);
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale) {
        sendPhoneVerification(normalizedPhone, rawCode, locale, reserveIssueSequence());
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale, long sequence) {
        publish(normalizedPhone, "PHONE", rawCode, sequence);
    }

    @Override
    public void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale) {
        publish(normalizedIdentifier, "PASSWORD_RESET", rawToken, reserveIssueSequence());
    }

    public synchronized Optional<Notification> take(String exactIdentifier) {
        Notification notification = notifications.remove(exactIdentifier);
        return notification == null || !notification.expiresAt().isAfter(clock.instant())
                ? Optional.empty() : Optional.of(notification);
    }

    private synchronized void publish(String identifier, String method, String token, long sequence) {
        Instant now = clock.instant();
        notifications.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));
        Notification incoming = new Notification(method, token, sequence, now.plus(ttl));
        notifications.compute(identifier, (key, existing) -> existing == null || sequence > existing.issueSequence()
                ? incoming : existing);
        while (notifications.size() > capacity) {
            notifications.entrySet().stream()
                    .min(Comparator.comparingLong(entry -> entry.getValue().issueSequence()))
                    .ifPresent(entry -> notifications.remove(entry.getKey()));
        }
    }

    public record Notification(String method, String token, long issueSequence, Instant expiresAt) {}
}
