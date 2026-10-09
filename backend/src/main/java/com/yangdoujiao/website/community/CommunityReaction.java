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
@Table(name = "community_reactions")
@Getter
@Immutable
public class CommunityReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false, updatable = false)
    private Long accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 10)
    private CommunityTargetType targetType;

    @Column(name = "target_id", nullable = false, updatable = false)
    private Long targetId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected CommunityReaction() {
    }

    static CommunityReaction create(Long accountId, CommunityTargetType targetType, Long targetId,
            OffsetDateTime now) {
        CommunityReaction reaction = new CommunityReaction();
        reaction.accountId = accountId;
        reaction.targetType = targetType;
        reaction.targetId = targetId;
        reaction.createdAt = now;
        return reaction;
    }
}
