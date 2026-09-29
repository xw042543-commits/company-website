package com.yangdoujiao.website.auth.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from UserAccount account where account.id = :id")
    Optional<UserAccount> findLockedById(@Param("id") Long id);
    Optional<UserAccount> findByNormalizedEmailAndStatusNot(String email, UserAccountStatus excluded);

    Optional<UserAccount> findByNormalizedPhoneAndStatusNot(String phone, UserAccountStatus excluded);
}
