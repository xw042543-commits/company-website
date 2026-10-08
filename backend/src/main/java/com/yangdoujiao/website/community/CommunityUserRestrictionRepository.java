package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityUserRestrictionRepository extends JpaRepository<CommunityUserRestriction, Long> {
    @org.springframework.data.jpa.repository.Query("""
            select r from CommunityUserRestriction r where r.accountId=:accountId
              and r.releasedAt is null and r.startsAt <= :now and (r.endsAt is null or r.endsAt > :now)
            order by case when r.restrictionType=com.yangdoujiao.website.community.CommunityRestrictionType.BANNED then 0 else 1 end,
              case when r.endsAt is null then 0 else 1 end, r.endsAt desc, r.id desc
            """)
    java.util.List<CommunityUserRestriction> findActiveForDisplay(Long accountId, java.time.OffsetDateTime now,
            org.springframework.data.domain.Pageable page);
    @org.springframework.data.jpa.repository.Query("""
            select count(r) > 0 from CommunityUserRestriction r where r.accountId = :accountId
              and r.releasedAt is null and r.startsAt <= :now and (r.endsAt is null or r.endsAt > :now)
            """)
    boolean existsActive(Long accountId, java.time.OffsetDateTime now);
}
