package com.yangdoujiao.website.auth.api;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.auth.account.AccountIdentifierType;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.password.PasswordResetTokenRepository;
import com.yangdoujiao.website.auth.session.UserSessionService;
import com.yangdoujiao.website.auth.verification.UserVerificationTokenRepository;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class AccountService {
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final UserVerificationTokenRepository verificationTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final UserSessionService sessions;

    public AccountService(UserAccountRepository accounts, PasswordEncoder passwords,
            UserVerificationTokenRepository verificationTokens, PasswordResetTokenRepository resetTokens,
            UserSessionService sessions) {
        this.accounts = accounts;
        this.passwords = passwords;
        this.verificationTokens = verificationTokens;
        this.resetTokens = resetTokens;
        this.sessions = sessions;
    }

    @Transactional(readOnly = true)
    public AccountResponse profile(long userId) {
        return AccountResponse.from(accounts.findById(userId).filter(this::available)
                .orElseThrow(this::unavailable));
    }

    @Transactional
    public void delete(long userId, DeleteAccountRequest request) {
        UserAccount account = accounts.findLockedById(userId).filter(this::available)
                .orElseThrow(this::unavailable);
        if (request == null || request.currentPassword() == null
                || !passwords.matches(request.currentPassword(), account.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CURRENT_PASSWORD", "Current password is incorrect");
        }
        if (!"DELETE".equals(request.confirmation())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed");
        }
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        account.delete(now);
        verificationTokens.invalidateActive(userId, AccountIdentifierType.EMAIL, now);
        verificationTokens.invalidateActive(userId, AccountIdentifierType.PHONE, now);
        resetTokens.invalidateActive(userId, now);
        sessions.revokeAll(userId);
    }

    private boolean available(UserAccount account) {
        return account.getStatus() == UserAccountStatus.ACTIVE && account.getDeletedAt() == null;
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Authentication required");
    }
}
