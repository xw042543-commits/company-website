package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
