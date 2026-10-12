package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface MiniappAuthTokenRepository extends JpaRepository<MiniappAuthToken, Long> {

    @Query("""
            select token from MiniappAuthToken token
            join fetch token.userAccount
            where token.tokenHash = :tokenHash
              and token.tokenKind = :kind
              and token.revokedAt is null
              and token.expiresAt > :now
            """)
    Optional<MiniappAuthToken> findActiveByHash(
            @Param("tokenHash") String tokenHash,
            @Param("kind") MiniappAuthTokenKind kind,
            @Param("now") OffsetDateTime now);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select token from MiniappAuthToken token
            join fetch token.userAccount
            where token.tokenHash = :tokenHash
              and token.tokenKind = :kind
            """)
    Optional<MiniappAuthToken> findForUpdateByHash(
            @Param("tokenHash") String tokenHash,
            @Param("kind") MiniappAuthTokenKind kind);

    @Modifying
    @Query("""
            update MiniappAuthToken token
               set token.revokedAt = :now
             where token.familyId = :familyId
               and token.revokedAt is null
            """)
    int revokeFamily(@Param("familyId") UUID familyId, @Param("now") OffsetDateTime now);
}
