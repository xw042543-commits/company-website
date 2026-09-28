package com.yangdoujiao.website.auth.password;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.AuthValidationException;
import com.yangdoujiao.website.auth.account.NormalizedIdentifier;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountLookup;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.auth.session.UserSessionService;
import com.yangdoujiao.website.auth.verification.AuthNotificationDispatcher;
import com.yangdoujiao.website.auth.verification.AuthNotificationSender;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.persistence.EntityManager;

@Service
public class PasswordService {
    private final PasswordResetTokenRepository tokens;
    private final UserAccountRepository accounts;
    private final UserAccountLookup lookup;
    private final AccountIdentifierNormalizer normalizer;
    private final AuthProperties properties;
    private final AuthRateLimitProperties limits;
    private final AuthRateLimiter limiter;
    private final PasswordEncoder passwords;
    private final UserSessionService sessions;
    private final ObjectProvider<AuthNotificationSender> senders;
    private final AuthNotificationDispatcher dispatcher;
    private final EntityManager entityManager;
    private final TransactionTemplate transaction;
    private final SecureRandom random = new SecureRandom();

    public PasswordService(PasswordResetTokenRepository tokens, UserAccountRepository accounts,
            UserAccountLookup lookup, AccountIdentifierNormalizer normalizer, AuthProperties properties,
            AuthRateLimitProperties limits, AuthRateLimiter limiter, PasswordEncoder passwords,
            UserSessionService sessions, ObjectProvider<AuthNotificationSender> senders,
            AuthNotificationDispatcher dispatcher, EntityManager entityManager,
            PlatformTransactionManager manager) {
        this.tokens = tokens;
        this.accounts = accounts;
        this.lookup = lookup;
        this.normalizer = normalizer;
        this.properties = properties;
        this.limits = limits;
        this.limiter = limiter;
        this.passwords = passwords;
        this.sessions = sessions;
        this.senders = senders;
        this.dispatcher = dispatcher;
        this.entityManager = entityManager;
        this.transaction = new TransactionTemplate(manager);
    }

    public void forgotPassword(String rawIdentifier, String rawLocale, String clientAddress) {
        Optional<NormalizedIdentifier> identifier = normalize(rawIdentifier);
        String subject = identifier.map(NormalizedIdentifier::value).orElse(rawIdentifier == null ? "" : rawIdentifier);
        limit("forgot-ip", AuthHash.sha256(clientAddress), limits.resendPerIp());
        limit("forgot-identifier", AuthHash.sha256(subject), limits.resendPerIdentifier());

        AuthNotificationSender sender = availableSender();
        String rawToken = newToken();
        String tokenHash = AuthHash.sha256(rawToken);
        // The expensive password-encoding work is identical for present and absent identifiers.
        passwords.encode(tokenHash);
        Locale locale = "zh".equalsIgnoreCase(rawLocale) ? Locale.CHINESE : Locale.ENGLISH;
        transaction.executeWithoutResult(status -> identifier.flatMap(lookup::findLoginAccount).ifPresent(found -> {
            Optional<UserAccount> locked = accounts.findLockedById(found.getId());
            if (locked.isEmpty() || locked.get().getStatus() != UserAccountStatus.ACTIVE) return;
            UserAccount account = locked.get();
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            tokens.invalidateActive(account.getId(), now);
            OffsetDateTime expiresAt = now.plus(properties.passwordResetTtl());
            tokens.saveAndFlush(new PasswordResetToken(account.getId(), tokenHash, expiresAt, now));
            long sequence = sender.reserveIssueSequence();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatcher.dispatch(() -> {
                        if (java.time.Instant.now().isBefore(expiresAt.toInstant())) {
                            sender.sendPasswordReset(identifier.orElseThrow().value(), rawToken, locale,
                                    sequence, expiresAt.toInstant());
                        }
                    });
                }
            });
        }));
    }

    public void resetPassword(String rawToken, String newPassword, String clientAddress) {
        String subject = AuthHash.sha256(rawToken == null ? "" : rawToken);
        limit("reset-ip", AuthHash.sha256(clientAddress), limits.verificationPerIp());
        limit("reset-token", subject, limits.loginPerIdentifier());
        String validPassword = validateNewPassword(newPassword);
        if (rawToken == null || rawToken.length() < 20 || rawToken.length() > 256) throw invalidToken();
        PasswordResetToken candidate = tokens.findByTokenHash(subject).orElseThrow(this::invalidToken);
        boolean changed = Boolean.TRUE.equals(transaction.execute(status -> {
            Optional<UserAccount> lockedAccount = accounts.findLockedById(candidate.getUserId());
            if (lockedAccount.isEmpty() || lockedAccount.get().getStatus() != UserAccountStatus.ACTIVE) return false;
            Optional<PasswordResetToken> lockedToken = tokens.findLockedById(candidate.getId());
            if (lockedToken.isEmpty()) return false;
            entityManager.refresh(lockedToken.get());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            if (!lockedToken.get().usableAt(now)
                    || !AuthHash.constantTimeEquals(lockedToken.get().getTokenHash(), subject)) return false;
            lockedToken.get().consume(now);
            lockedAccount.get().changePassword(passwords.encode(validPassword), now);
            tokens.invalidateOtherTokens(candidate.getUserId(), candidate.getId(), now);
            sessions.revokeAll(candidate.getUserId());
            return true;
        }));
        if (!changed) throw invalidToken();
    }

    public void changePassword(long userId, String currentPassword, String newPassword, String clientAddress) {
        limit("change-ip", AuthHash.sha256(clientAddress), limits.loginPerIp());
        limit("change-account", AuthHash.sha256(Long.toString(userId)), limits.loginPerIdentifier());
        String validPassword = validateNewPassword(newPassword);
        transaction.executeWithoutResult(status -> {
            UserAccount account = accounts.findLockedById(userId).orElseThrow(this::invalidCurrentPassword);
            if (account.getStatus() != UserAccountStatus.ACTIVE || currentPassword == null
                    || !passwords.matches(currentPassword, account.getPasswordHash())) {
                throw invalidCurrentPassword();
            }
            if (passwords.matches(validPassword, account.getPasswordHash())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "PASSWORD_REUSE", "Choose a different password");
            }
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            account.changePassword(passwords.encode(validPassword), now);
            tokens.invalidateActive(userId, now);
            sessions.revokeAll(userId);
        });
    }

    private Optional<NormalizedIdentifier> normalize(String raw) {
        try { return Optional.of(normalizer.normalizeLogin(raw)); }
        catch (AuthValidationException exception) { return Optional.empty(); }
    }

    private void limit(String scope, String subject, int maximum) {
        limiter.consume(scope, subject, maximum, limits.window());
    }

    private AuthNotificationSender availableSender() {
        AuthNotificationSender sender = senders.getIfAvailable();
        if (sender == null) throw unavailable();
        try {
            if (!sender.isAvailable()) throw unavailable();
        } catch (RuntimeException exception) {
            throw unavailable();
        }
        return sender;
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String validateNewPassword(String value) {
        if (value == null || value.length() < 12 || value.length() > 128) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed");
        }
        return value;
    }

    private ApiException invalidToken() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RESET_TOKEN", "Reset information is invalid or expired");
    }

    private ApiException invalidCurrentPassword() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CURRENT_PASSWORD", "Current password is incorrect");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                "Authentication service is temporarily unavailable");
    }
}
