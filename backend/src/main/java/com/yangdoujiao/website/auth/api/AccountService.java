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
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.password.PasswordResetTokenRepository;
import com.yangdoujiao.website.auth.session.UserSessionService;
import com.yangdoujiao.website.auth.verification.UserVerificationTokenRepository;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.planningagent.session.PlanningCleanup;

@Service
public class AccountService {
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final UserVerificationTokenRepository verificationTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final UserSessionService sessions;
    private final UserExternalIdentityRepository externalIdentities;
    private final PlanningCleanup planningCleanup;

    public AccountService(UserAccountRepository accounts, PasswordEncoder passwords,
            UserVerificationTokenRepository verificationTokens, PasswordResetTokenRepository resetTokens,
            UserSessionService sessions, UserExternalIdentityRepository externalIdentities,
            PlanningCleanup planningCleanup) {
        this.accounts = accounts;
        this.passwords = passwords;
        this.verificationTokens = verificationTokens;
        this.resetTokens = resetTokens;
        this.sessions = sessions;
        this.externalIdentities = externalIdentities;
        this.planningCleanup = planningCleanup;
    }

    @Transactional(readOnly = true)
    public AccountResponse profile(long userId) {
        UserAccount account = accounts.findById(userId).filter(this::available)
                .orElseThrow(this::unavailable);
        return AccountResponse.from(account, externalIdentities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT, userId));
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse session(long userId) {
        return accounts.findById(userId).filter(this::available).map(account -> {
            String legacy = externalIdentities.findByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT, userId)
                .map(com.yangdoujiao.website.auth.external.UserExternalIdentity::getAvatarUrl).orElse(null);
            return new AuthSessionResponse(true, userId, account.getFullName(),
                account.getRole() == com.yangdoujiao.website.auth.account.UserAccountRole.ADVISER,
                account.getRole() == com.yangdoujiao.website.auth.account.UserAccountRole.ADMIN, account.displayAvatar(legacy));
        }).orElseGet(AuthSessionResponse::anonymous);
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
        planningCleanup.purgeOwner(userId);
    }

    private boolean available(UserAccount account) {
        return account.getStatus() == UserAccountStatus.ACTIVE && account.getDeletedAt() == null;
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Authentication required");
    }
}
