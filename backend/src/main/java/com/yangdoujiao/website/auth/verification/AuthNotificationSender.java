package com.yangdoujiao.website.auth.verification;

import java.util.Locale;

public interface AuthNotificationSender {
    void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale);
    void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale);
    void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale);
}
