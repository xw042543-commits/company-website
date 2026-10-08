package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.yangdoujiao.website.auth.account.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "miniapp_auth_tokens")
@Getter
public class MiniappAuthToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Column(name = "token_hash", nullable = false, length = 64, unique = true)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_kind", nullable = false, length = 10)
    private MiniappAuthTokenKind tokenKind;

    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @Column(name = "replaced_by_hash", length = 64)
    private String replacedByHash;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected MiniappAuthToken() {
    }

    private MiniappAuthToken(UserAccount userAccount, String tokenHash, MiniappAuthTokenKind tokenKind,
            UUID familyId, OffsetDateTime expiresAt, OffsetDateTime createdAt) {
        this.userAccount = userAccount;
        this.tokenHash = tokenHash;
        this.tokenKind = tokenKind;
        this.familyId = familyId;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public static MiniappAuthToken issue(UserAccount userAccount, String tokenHash,
            MiniappAuthTokenKind tokenKind, UUID familyId, OffsetDateTime expiresAt,
            OffsetDateTime createdAt) {
        return new MiniappAuthToken(userAccount, tokenHash, tokenKind, familyId, expiresAt, createdAt);
    }

    public void rotate(String replacementHash, OffsetDateTime now) {
        revokedAt = now;
        replacedByHash = replacementHash;
    }

    public boolean isActive(OffsetDateTime now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }
}
