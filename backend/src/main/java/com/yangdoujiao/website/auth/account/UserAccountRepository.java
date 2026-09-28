package com.yangdoujiao.website.auth.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByNormalizedEmailAndStatusNot(String email, UserAccountStatus excluded);

    Optional<UserAccount> findByNormalizedPhoneAndStatusNot(String phone, UserAccountStatus excluded);
}
