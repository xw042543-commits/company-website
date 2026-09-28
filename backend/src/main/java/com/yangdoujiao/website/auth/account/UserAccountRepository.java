package com.yangdoujiao.website.auth.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByNormalizedEmailAndStatusNot(String email, UserAccountStatus excluded);

    Optional<UserAccount> findByNormalizedPhoneAndStatusNot(String phone, UserAccountStatus excluded);

    default Optional<UserAccount> findLoginAccount(NormalizedIdentifier identifier) {
        if (identifier == null || identifier.type() == null || identifier.value() == null
                || identifier.value().isBlank()) {
            throw new AuthValidationException();
        }
        return switch (identifier.type()) {
            case EMAIL -> findByNormalizedEmailAndStatusNot(identifier.value(), UserAccountStatus.DELETED);
            case PHONE -> findByNormalizedPhoneAndStatusNot(identifier.value(), UserAccountStatus.DELETED);
        };
    }
}
