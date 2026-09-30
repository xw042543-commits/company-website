package com.yangdoujiao.website.auth.account;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class UserAccountLookup {
    private final UserAccountRepository repository;
    private final AccountIdentifierNormalizer normalizer;

    public UserAccountLookup(UserAccountRepository repository, AccountIdentifierNormalizer normalizer) {
        this.repository = repository;
        this.normalizer = normalizer;
    }

    public Optional<UserAccount> findLoginAccount(NormalizedIdentifier identifier) {
        if (identifier == null || identifier.type() == null || identifier.value() == null) {
            throw new AuthValidationException();
        }
        NormalizedIdentifier canonical = normalizer.normalizeLogin(identifier.value());
        if (!identifier.equals(canonical)) {
            throw new AuthValidationException();
        }
        return switch (identifier.type()) {
            case EMAIL -> repository.findByNormalizedEmailAndStatusNot(identifier.value(), UserAccountStatus.DELETED);
            case PHONE -> repository.findByNormalizedPhoneAndStatusNot(identifier.value(), UserAccountStatus.DELETED);
        };
    }
}
