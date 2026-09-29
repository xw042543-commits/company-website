package com.yangdoujiao.website.auth.api;

import java.time.OffsetDateTime;

import com.yangdoujiao.website.auth.account.UserAccount;

public record AccountResponse(Long id, String fullName, String email, String phone,
        boolean emailVerified, boolean phoneVerified, OffsetDateTime createdAt) {
    public static AccountResponse from(UserAccount account) {
        return new AccountResponse(account.getId(), account.getFullName(), maskEmail(account.getNormalizedEmail()),
                maskPhone(account.getNormalizedPhone()), account.getEmailVerifiedAt() != null,
                account.getPhoneVerifiedAt() != null, account.getCreatedAt());
    }

    private static String maskEmail(String email) {
        if (email == null) return null;
        int at = email.indexOf('@');
        if (at <= 0) return "***";
        return email.charAt(0) + "***" + email.substring(at);
    }

    private static String maskPhone(String phone) {
        if (phone == null) return null;
        if (phone.length() <= 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }
}
