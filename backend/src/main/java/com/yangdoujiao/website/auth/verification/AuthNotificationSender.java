package com.yangdoujiao.website.auth.verification;

import java.util.Locale;
import java.time.Instant;

/** Callers must dispatch through an after-commit boundary; this port does not persist deliveries. */
public interface AuthNotificationSender {
    /** Production adapters must override this identifier-independent readiness check. */
    default boolean isAvailable() { return false; }

    /** Local adapters can reserve a monotonic issue order while the account is locked. */
    default long reserveIssueSequence() { return 0L; }

    void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale);
    void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale);
    void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale);

    default void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale, long issueSequence) {
        sendEmailVerification(normalizedEmail, rawToken, locale);
    }

    default void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale, long issueSequence) {
        sendPhoneVerification(normalizedPhone, rawCode, locale);
    }

    default void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale,
            long issueSequence, Instant expiresAt) {
        sendEmailVerification(normalizedEmail, rawToken, locale, issueSequence);
    }

    default void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale,
            long issueSequence, Instant expiresAt) {
        sendPhoneVerification(normalizedPhone, rawCode, locale, issueSequence);
    }

    default void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale,
            long issueSequence, Instant expiresAt) {
        sendPasswordReset(normalizedIdentifier, rawToken, locale);
    }
}
