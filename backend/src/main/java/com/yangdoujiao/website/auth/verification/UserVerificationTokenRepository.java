package com.yangdoujiao.website.auth.verification;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yangdoujiao.website.auth.account.AccountIdentifierType;

import jakarta.persistence.LockModeType;

public interface UserVerificationTokenRepository extends JpaRepository<UserVerificationToken, Long> {
    boolean existsByTokenHash(String tokenHash);

    Optional<UserVerificationToken> findByTokenHashAndTokenType(String tokenHash, AccountIdentifierType tokenType);

    Optional<UserVerificationToken> findTopByUserIdAndTokenTypeOrderByIdDesc(Long userId, AccountIdentifierType type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from UserVerificationToken token where token.id = :id")
    Optional<UserVerificationToken> findLockedById(@Param("id") Long id);

    @Modifying
    @Query("update UserVerificationToken token set token.usedAt = :now where token.userId = :userId "
            + "and token.tokenType = :type and token.usedAt is null")
    void invalidateActive(@Param("userId") Long userId, @Param("type") AccountIdentifierType type,
            @Param("now") OffsetDateTime now);
}
