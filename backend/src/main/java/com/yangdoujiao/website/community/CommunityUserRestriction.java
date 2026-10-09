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

@Entity
@Table(name = "community_user_restrictions")
@Getter
public class CommunityUserRestriction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false, updatable = false)
    private Long accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "restriction_type", nullable = false, length = 10)
    private CommunityRestrictionType restrictionType;

    @Column(name = "reason_code", nullable = false, length = 50, updatable = false)
    private String reasonCode;

    @Column(name = "starts_at", nullable = false, updatable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at", updatable = false)
    private OffsetDateTime endsAt;

    @Column(name = "created_by_account_id", nullable = false, updatable = false)
    private Long createdByAccountId;

    @Column(name = "released_at")
    private OffsetDateTime releasedAt;

    @Column(name = "released_by_account_id")
    private Long releasedByAccountId;

    protected CommunityUserRestriction() {
    }

    static CommunityUserRestriction create(Long accountId, CommunityRestrictionType restrictionType,
            String reasonCode, OffsetDateTime startsAt, OffsetDateTime endsAt, Long createdByAccountId) {
        CommunityUserRestriction restriction = new CommunityUserRestriction();
        restriction.accountId = accountId;
        restriction.restrictionType = restrictionType;
        restriction.reasonCode = reasonCode;
        restriction.startsAt = startsAt;
        restriction.endsAt = endsAt;
        restriction.createdByAccountId = createdByAccountId;
        return restriction;
    }

    void release(Long releasedByAccountId, OffsetDateTime now) {
        this.releasedByAccountId = releasedByAccountId;
        releasedAt = now;
    }
}
