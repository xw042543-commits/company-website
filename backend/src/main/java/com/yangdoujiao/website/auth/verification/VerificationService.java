package com.yangdoujiao.website.auth.verification;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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
    private static final int MAX_EMAIL_CODE_ATTEMPTS = 5;
    private static final int MAX_PHONE_ATTEMPTS = 5;
    private final UserVerificationTokenRepository tokens;
    private final UserAccountRepository accounts;
    private final AccountIdentifierNormalizer normalizer;
    private final AuthProperties properties;
    private final AuthRateLimitProperties limits;
    private final AuthRateLimiter limiter;
    private final ObjectProvider<AuthNotificationSender> senders;
    private final AuthNotificationDispatcher dispatcher;
    private final EntityManager entityManager;
    private final TransactionTemplate transaction;
    private final SecureRandom random = new SecureRandom();

    public VerificationService(UserVerificationTokenRepository tokens, UserAccountRepository accounts,
            AccountIdentifierNormalizer normalizer, AuthProperties properties, AuthRateLimitProperties limits,
            AuthRateLimiter limiter, ObjectProvider<AuthNotificationSender> senders,
            AuthNotificationDispatcher dispatcher, EntityManager entityManager, PlatformTransactionManager manager) {
        this.tokens = tokens;
        this.accounts = accounts;
        this.normalizer = normalizer;
        this.properties = properties;
        this.limits = limits;
        this.limiter = limiter;
        this.senders = senders;
        this.dispatcher = dispatcher;
        this.entityManager = entityManager;
        this.transaction = new TransactionTemplate(manager);
    }

    public void issue(UserAccount account, NormalizedIdentifier identifier, Locale locale) {
        issue(account, identifier, locale, prepareForResend(identifier.type()));
    }

    public void requireNotificationAvailable() {
        AuthNotificationSender sender = senders.getIfAvailable();
        if (sender == null) throw unavailable();
        try {
            if (!sender.isAvailable()) throw unavailable();
        } catch (RuntimeException exception) {
            throw unavailable();
        }
    }

    /** The same random generation and SHA-256 work is done before account lookup on resend. */
    public PreparedChallenge prepareForResend(AccountIdentifierType type) {
        String raw = verificationCode();
        String probeHash = tokenHash(0L, type, raw);
        return new PreparedChallenge(type, raw, probeHash);
    }

    public void issue(UserAccount account, NormalizedIdentifier identifier, Locale locale,
            PreparedChallenge prepared) {
        if (account.getStatus() != UserAccountStatus.PENDING_VERIFICATION ||
                prepared.type() != identifier.type() ||
                (identifier.type() == AccountIdentifierType.EMAIL && !identifier.value().equals(account.getNormalizedEmail())) ||
                (identifier.type() == AccountIdentifierType.PHONE && !identifier.value().equals(account.getNormalizedPhone()))) {
            throw invalid();
        }
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            throw new IllegalStateException("Verification issuance requires an active transaction");
        }
        AuthNotificationSender sender = senders.getIfAvailable();
        if (sender == null) throw unavailable();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        String raw = prepared.raw();
        String hash;
        int tries = 0;
        do {
            if (++tries > 10) throw unavailable();
            if (tries > 1) raw = prepareForResend(identifier.type()).raw();
            hash = tokenHash(account.getId(), identifier.type(), raw);
        } while (tokens.existsByTokenHash(hash));
        tokens.invalidateActive(account.getId(), identifier.type(), now);
        OffsetDateTime expiresAt = now.plus(identifier.type() == AccountIdentifierType.EMAIL
                ? properties.emailVerificationTtl() : properties.phoneVerificationTtl());
        tokens.saveAndFlush(new UserVerificationToken(account.getId(), identifier.type(), hash,
                expiresAt, now));
        long issueSequence = sender.reserveIssueSequence();
        String issuedRaw = raw;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                dispatcher.dispatch(() -> {
                    if (java.time.Instant.now().isBefore(expiresAt.toInstant())) {
                        if (identifier.type() == AccountIdentifierType.EMAIL) {
                            sender.sendEmailVerification(identifier.value(), issuedRaw, locale,
                                    issueSequence, expiresAt.toInstant());
                        } else {
                            sender.sendPhoneVerification(identifier.value(), issuedRaw, locale,
                                    issueSequence, expiresAt.toInstant());
                        }
                    }
                });
            }
        });
    }

    public record PreparedChallenge(AccountIdentifierType type, String raw, String probeHash) {
        @Override public String toString() { return "PreparedChallenge[redacted]"; }
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

    public void verifyEmailCode(String rawEmail, String rawCode) {
        verifyEmailCode(rawEmail, rawCode, null);
    }

    public void verifyEmailCode(String rawEmail, String rawCode, String clientAddress) {
        if (clientAddress != null) limit(clientAddress);
        if (rawCode == null || !rawCode.matches("[0-9]{6}")) throw invalid();
        NormalizedIdentifier identifier;
        try { identifier = normalizer.normalizeLogin(rawEmail); }
        catch (AuthValidationException exception) { throw invalid(); }
        if (identifier.type() != AccountIdentifierType.EMAIL) throw invalid();
        boolean valid = Boolean.TRUE.equals(transaction.execute(status -> {
            Optional<UserAccount> found = accounts.findByNormalizedEmailAndStatusNot(
                    identifier.value(), UserAccountStatus.DELETED);
            if (found.isEmpty()) return false;
            Optional<UserAccount> account = accounts.findLockedById(found.get().getId());
            if (account.isEmpty() || account.get().getStatus() != UserAccountStatus.PENDING_VERIFICATION) return false;
            Optional<UserVerificationToken> candidate = tokens.findTopByUserIdAndTokenTypeOrderByIdDesc(
                    account.get().getId(), AccountIdentifierType.EMAIL);
            if (candidate.isEmpty()) return false;
            Optional<UserVerificationToken> locked = tokens.findLockedById(candidate.get().getId());
            if (locked.isEmpty()) return false;
            entityManager.refresh(locked.get());
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            if (!locked.get().usableAt(now, MAX_EMAIL_CODE_ATTEMPTS)) return false;
            String hash = tokenHash(account.get().getId(), AccountIdentifierType.EMAIL, rawCode);
            if (!AuthHash.constantTimeEquals(locked.get().getTokenHash(), hash)) {
                locked.get().failedAttempt();
                return false;
            }
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
        return AuthHash.sha256(type == AccountIdentifierType.PHONE
                ? accountId + ":" + raw
                : accountId + ":email:" + raw);
    }

    private String verificationCode() { return "%06d".formatted(random.nextInt(1_000_000)); }

    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_VERIFICATION_TOKEN",
                "Verification information is invalid or expired");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                "Authentication service is temporarily unavailable");
    }
}
