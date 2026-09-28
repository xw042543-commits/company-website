package com.yangdoujiao.website.auth.api;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.AccountIdentifierNormalizer;
import com.yangdoujiao.website.auth.account.AccountIdentifierType;
import com.yangdoujiao.website.auth.account.AuthValidationException;
import com.yangdoujiao.website.auth.account.NormalizedIdentifier;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountLookup;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.auth.verification.VerificationService;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class RegistrationService {
    private final AuthProperties properties;
    private final AuthRateLimitProperties limits;
    private final AccountIdentifierNormalizer normalizer;
    private final UserAccountLookup lookup;
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final AuthRateLimiter limiter;
    private final VerificationService verification;
    private final TransactionTemplate transaction;

    public RegistrationService(AuthProperties properties, AuthRateLimitProperties limits,
            AccountIdentifierNormalizer normalizer, UserAccountLookup lookup, UserAccountRepository accounts,
            PasswordEncoder passwords, AuthRateLimiter limiter, VerificationService verification,
            PlatformTransactionManager manager) {
        this.properties = properties;
        this.limits = limits;
        this.normalizer = normalizer;
        this.lookup = lookup;
        this.accounts = accounts;
        this.passwords = passwords;
        this.limiter = limiter;
        this.verification = verification;
        this.transaction = new TransactionTemplate(manager);
    }

    public RegistrationResponse register(RegisterRequest request, String clientAddress) {
        requireEnabled();
        limiter.consume("register-ip", AuthHash.sha256(clientAddress), limits.registrationPerIp(), limits.window());
        ValidatedRegistration validated = validate(request);
        NormalizedIdentifier identifier = validated.identifier();
        limiter.consume("register-identifier", AuthHash.sha256(identifier.value()),
                limits.registrationPerIdentifier(), limits.window());
        RegistrationResponse accepted = RegistrationResponse.accepted(identifier.type());
        try {
            transaction.executeWithoutResult(status -> {
                if (lookup.findLoginAccount(identifier).isPresent()) return;
                UserAccount account = accounts.saveAndFlush(new UserAccount(validated.name(),
                        identifier.type() == AccountIdentifierType.EMAIL ? identifier.value() : null,
                        identifier.type() == AccountIdentifierType.PHONE ? identifier.value() : null,
                        passwords.encode(request.password()), properties.agreementVersion(), properties.privacyVersion()));
                verification.issue(account, identifier, validated.locale());
            });
        } catch (DataIntegrityViolationException exception) {
            // A concurrent registration won the unique constraint; keep the public response identical.
        }
        return accepted;
    }

    public RegistrationResponse resend(ResendVerificationRequest request, String clientAddress) {
        requireEnabled();
        limiter.consume("resend-ip", AuthHash.sha256(clientAddress), limits.resendPerIp(), limits.window());
        NormalizedIdentifier identifier = normalize(request == null ? null : request.identifier());
        limiter.consume("resend-identifier", AuthHash.sha256(identifier.value()),
                limits.resendPerIdentifier(), limits.window());
        transaction.executeWithoutResult(status -> lookup.findLoginAccount(identifier).ifPresent(account -> {
            accounts.findLockedById(account.getId()).ifPresent(locked -> {
                if (locked.getStatus() == UserAccountStatus.PENDING_VERIFICATION) {
                    verification.issue(locked, identifier, locale(request.locale()));
                }
            });
        }));
        return RegistrationResponse.accepted(identifier.type());
    }

    private ValidatedRegistration validate(RegisterRequest request) {
        if (request == null || !request.agreementAccepted() || !request.privacyAccepted()
                || request.fullName() == null || request.fullName().isBlank()
                || request.fullName().trim().length() > 100 || request.password() == null
                || request.password().length() < 12 || request.password().length() > 128
                || (request.email() == null || request.email().isBlank())
                    == (request.phone() == null || request.phone().isBlank())) {
            throw invalid();
        }
        return new ValidatedRegistration(request.fullName().trim(),
                normalize(request.email() == null || request.email().isBlank() ? request.phone() : request.email()),
                locale(request.locale()));
    }

    private NormalizedIdentifier normalize(String value) {
        try { return normalizer.normalizeLogin(value); }
        catch (AuthValidationException exception) { throw invalid(); }
    }

    private Locale locale(String value) {
        return "zh".equalsIgnoreCase(value) ? Locale.CHINESE : Locale.ENGLISH;
    }

    private void requireEnabled() {
        if (!properties.registrationEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "REGISTRATION_UNAVAILABLE",
                    "Registration is unavailable");
        }
    }

    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed");
    }

    private record ValidatedRegistration(String name, NormalizedIdentifier identifier, Locale locale) {}
}
