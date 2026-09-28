package com.yangdoujiao.website.auth.verification;

import java.time.OffsetDateTime;

import com.yangdoujiao.website.auth.account.AccountIdentifierType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "user_verification_tokens")
@Getter
public class UserVerificationToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false, length = 10)
    private AccountIdentifierType tokenType;
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;
    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;
    @Column(name = "used_at")
    private OffsetDateTime usedAt;
    @Column(nullable = false)
    private int attempts;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected UserVerificationToken() {}

    public UserVerificationToken(Long userId, AccountIdentifierType tokenType, String tokenHash,
            OffsetDateTime expiresAt, OffsetDateTime createdAt) {
        this.userId = userId;
        this.tokenType = tokenType;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public boolean usableAt(OffsetDateTime now, int maximumAttempts) {
        return usedAt == null && expiresAt.isAfter(now) && attempts < maximumAttempts;
    }

    public void failedAttempt() { attempts++; }
    public void consume(OffsetDateTime now) { usedAt = now; }
}
