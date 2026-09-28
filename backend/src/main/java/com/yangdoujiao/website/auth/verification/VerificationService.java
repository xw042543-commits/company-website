package com.yangdoujiao.website.auth.verification;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.AccountIdentifierType;
import com.yangdoujiao.website.auth.account.AuthValidationException;
import com.yangdoujiao.website.auth.account.NormalizedIdentifier;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.persistence.EntityManager;

@Service
public class VerificationService {
    private static final int MAX_PHONE_ATTEMPTS = 5;
    private final UserVerificationTokenRepository tokens;
    private final UserAccountRepository accounts;
    private final AccountIdentifierNormalizer normalizer;
    private final AuthProperties properties;
    private final AuthRateLimitProperties limits;
    private final AuthRateLimiter limiter;
    private final ObjectProvider<AuthNotificationSender> senders;
    private final EntityManager entityManager;
    private final TransactionTemplate transaction;
    private final SecureRandom random = new SecureRandom();

    public VerificationService(UserVerificationTokenRepository tokens, UserAccountRepository accounts,
            AccountIdentifierNormalizer normalizer, AuthProperties properties, AuthRateLimitProperties limits,
            AuthRateLimiter limiter, ObjectProvider<AuthNotificationSender> senders,
            EntityManager entityManager, PlatformTransactionManager manager) {
        this.tokens = tokens;
        this.accounts = accounts;
        this.normalizer = normalizer;
        this.properties = properties;
        this.limits = limits;
        this.limiter = limiter;
        this.senders = senders;
        this.entityManager = entityManager;
        this.transaction = new TransactionTemplate(manager);
    }

    public void issue(UserAccount account, NormalizedIdentifier identifier, Locale locale) {
        if (account.getStatus() != UserAccountStatus.PENDING_VERIFICATION ||
                (identifier.type() == AccountIdentifierType.EMAIL && !identifier.value().equals(account.getNormalizedEmail())) ||
                (identifier.type() == AccountIdentifierType.PHONE && !identifier.value().equals(account.getNormalizedPhone()))) {
            throw invalid();
        }
        AuthNotificationSender sender = senders.getIfAvailable();
        if (sender == null) throw unavailable();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        String raw;
        String hash;
        int tries = 0;
        do {
            if (++tries > 10) throw unavailable();
            raw = identifier.type() == AccountIdentifierType.EMAIL ? emailToken() : phoneCode();
            hash = tokenHash(account.getId(), identifier.type(), raw);
        } while (tokens.existsByTokenHash(hash));
        tokens.invalidateActive(account.getId(), identifier.type(), now);
        tokens.saveAndFlush(new UserVerificationToken(account.getId(), identifier.type(), hash,
                now.plus(identifier.type() == AccountIdentifierType.EMAIL
                        ? properties.emailVerificationTtl() : properties.phoneVerificationTtl()), now));
        try {
            if (identifier.type() == AccountIdentifierType.EMAIL) {
                sender.sendEmailVerification(identifier.value(), raw, locale);
            } else {
                sender.sendPhoneVerification(identifier.value(), raw, locale);
            }
        } catch (RuntimeException exception) {
            throw unavailable();
        }
    }

    public void verifyEmail(String rawToken) { verifyEmail(rawToken, null); }

    public void verifyEmail(String rawToken, String clientAddress) {
        if (clientAddress != null) limit(clientAddress);
        if (rawToken == null || rawToken.length() < 20 || rawToken.length() > 256) throw invalid();
        String hash = AuthHash.sha256(rawToken);
        Optional<UserVerificationToken> candidate = tokens.findByTokenHashAndTokenType(hash, AccountIdentifierType.EMAIL);
        if (candidate.isEmpty()) throw invalid();
        boolean valid = Boolean.TRUE.equals(transaction.execute(status -> {
            Optional<UserAccount> account = accounts.findLockedById(candidate.get().getUserId());
            if (account.isEmpty() || account.get().getStatus() != UserAccountStatus.PENDING_VERIFICATION) return false;
            Optional<UserVerificationToken> locked = tokens.findLockedById(candidate.get().getId());
            if (locked.isEmpty()) return false;
            entityManager.refresh(locked.get());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            if (!locked.get().usableAt(now, 1) ||
                    !AuthHash.constantTimeEquals(locked.get().getTokenHash(), hash)) return false;
            locked.get().consume(now);
            account.get().verifyEmail(now);
            return true;
        }));
        if (!valid) throw invalid();
    }

    public void verifyPhone(String rawPhone, String rawCode) { verifyPhone(rawPhone, rawCode, null); }

    public void verifyPhone(String rawPhone, String rawCode, String clientAddress) {
        if (clientAddress != null) limit(clientAddress);
        if (rawCode == null || !rawCode.matches("[0-9]{6}")) throw invalid();
        NormalizedIdentifier identifier;
        try { identifier = normalizer.normalizeLogin(rawPhone); }
        catch (AuthValidationException exception) { throw invalid(); }
        if (identifier.type() != AccountIdentifierType.PHONE) throw invalid();
        boolean valid = Boolean.TRUE.equals(transaction.execute(status -> {
            Optional<UserAccount> found = accounts.findByNormalizedPhoneAndStatusNot(
                    identifier.value(), UserAccountStatus.DELETED);
            if (found.isEmpty()) return false;
            Optional<UserAccount> account = accounts.findLockedById(found.get().getId());
            if (account.isEmpty() || account.get().getStatus() != UserAccountStatus.PENDING_VERIFICATION) return false;
            Optional<UserVerificationToken> candidate = tokens.findTopByUserIdAndTokenTypeOrderByIdDesc(
                    account.get().getId(), AccountIdentifierType.PHONE);
            if (candidate.isEmpty()) return false;
            Optional<UserVerificationToken> locked = tokens.findLockedById(candidate.get().getId());
            if (locked.isEmpty()) return false;
            entityManager.refresh(locked.get());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            if (!locked.get().usableAt(now, MAX_PHONE_ATTEMPTS)) return false;
            String hash = tokenHash(account.get().getId(), AccountIdentifierType.PHONE, rawCode);
            if (!AuthHash.constantTimeEquals(locked.get().getTokenHash(), hash)) {
                locked.get().failedAttempt();
                return false;
            }
            locked.get().consume(now);
            account.get().verifyPhone(now);
            return true;
        }));
        if (!valid) throw invalid();
    }

    private void limit(String address) {
        limiter.consume("verify-ip", AuthHash.sha256(address), limits.verificationPerIp(), limits.window());
    }

    private String tokenHash(Long accountId, AccountIdentifierType type, String raw) {
        return AuthHash.sha256(type == AccountIdentifierType.PHONE ? accountId + ":" + raw : raw);
    }

    private String emailToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String phoneCode() { return "%06d".formatted(random.nextInt(1_000_000)); }

    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_VERIFICATION_TOKEN",
                "Verification information is invalid or expired");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                "Authentication service is temporarily unavailable");
    }
}
