package com.yangdoujiao.website.miniapp;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "miniapp_programme_favorites")
@Getter
class MiniappProgrammeFavorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_account_id", nullable = false)
    private Long userAccountId;

    @Column(name = "programme_id", nullable = false)
    private Long programmeId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected MiniappProgrammeFavorite() {
    }

    MiniappProgrammeFavorite(long userAccountId, long programmeId) {
        this.userAccountId = userAccountId;
        this.programmeId = programmeId;
        this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
