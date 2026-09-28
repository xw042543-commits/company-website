package com.yangdoujiao.website.auth.verification;

import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@Profile("!prod & (dev | test)")
public class LocalAuthNotificationStore implements AuthNotificationSender {
    private final ConcurrentHashMap<String, Notification> notifications = new ConcurrentHashMap<>();

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale) {
        publish(normalizedEmail, new Notification("EMAIL", rawToken));
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale) {
        publish(normalizedPhone, new Notification("PHONE", rawCode));
    }

    @Override
    public void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale) {
        publish(normalizedIdentifier, new Notification("PASSWORD_RESET", rawToken));
    }

    public Optional<Notification> take(String exactIdentifier) {
        return Optional.ofNullable(notifications.remove(exactIdentifier));
    }

    private void publish(String identifier, Notification notification) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() { notifications.put(identifier, notification); }
            });
        } else {
            notifications.put(identifier, notification);
        }
    }

    public record Notification(String method, String token) {}
}
