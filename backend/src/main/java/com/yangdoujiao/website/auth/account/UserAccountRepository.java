package com.yangdoujiao.website.auth.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    @Query("select a from UserAccount a where a.status <> com.yangdoujiao.website.auth.account.UserAccountStatus.DELETED "
            + "and (a.normalizedEmail = :identifier or a.normalizedPhone = :identifier)")
    Optional<UserAccount> findLoginAccount(@Param("identifier") String normalizedIdentifier);
}
