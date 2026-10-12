package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "community_moderation_actions")
@Getter
@Immutable
public class CommunityModerationAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_account_id", nullable = false, updatable = false)
    private Long actorAccountId;

    @Column(name = "target_type", nullable = false, length = 10, updatable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false, updatable = false)
    private Long targetId;

    @Column(name = "action", nullable = false, length = 30, updatable = false)
    private String action;

    @Column(name = "reason_code", nullable = false, length = 50, updatable = false)
    private String reasonCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30, updatable = false)
    private CommunityContentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "next_status", length = 30, updatable = false)
    private CommunityContentStatus nextStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected CommunityModerationAction() {
    }

    static CommunityModerationAction create(Long actorAccountId, String targetType, Long targetId,
            String action, String reasonCode, CommunityContentStatus previousStatus,
            CommunityContentStatus nextStatus, OffsetDateTime now) {
        CommunityModerationAction record = new CommunityModerationAction();
        record.actorAccountId = actorAccountId;
        record.targetType = targetType;
        record.targetId = targetId;
        record.action = action;
        record.reasonCode = reasonCode;
        record.previousStatus = previousStatus;
        record.nextStatus = nextStatus;
        record.createdAt = now;
        return record;
    }
}
