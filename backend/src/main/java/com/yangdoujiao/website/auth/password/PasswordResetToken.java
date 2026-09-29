package com.yangdoujiao.website.auth.password;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "password_reset_tokens")
@Getter
public class PasswordResetToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
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

    protected PasswordResetToken() {}

    public PasswordResetToken(Long userId, String tokenHash, OffsetDateTime expiresAt, OffsetDateTime createdAt) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public boolean usableAt(OffsetDateTime now) {
        return usedAt == null && expiresAt.isAfter(now) && attempts == 0;
    }

    public void consume(OffsetDateTime now) { usedAt = now; }
}
