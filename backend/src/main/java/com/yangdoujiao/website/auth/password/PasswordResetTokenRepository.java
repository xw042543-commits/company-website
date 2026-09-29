package com.yangdoujiao.website.auth.password;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from PasswordResetToken token where token.id = :id")
    Optional<PasswordResetToken> findLockedById(@Param("id") Long id);

    @Modifying
    @Query("update PasswordResetToken token set token.usedAt = :now where token.userId = :userId "
            + "and token.usedAt is null")
    void invalidateActive(@Param("userId") Long userId, @Param("now") OffsetDateTime now);

    @Modifying
    @Query("update PasswordResetToken token set token.usedAt = :now where token.userId = :userId "
            + "and token.id <> :usedId and token.usedAt is null")
    void invalidateOtherTokens(@Param("userId") Long userId, @Param("usedId") Long usedId,
            @Param("now") OffsetDateTime now);
}
