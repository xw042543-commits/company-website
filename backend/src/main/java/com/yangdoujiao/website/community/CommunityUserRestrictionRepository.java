package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityUserRestrictionRepository extends JpaRepository<CommunityUserRestriction, Long> {
    @org.springframework.data.jpa.repository.Query("""
            select count(r) > 0 from CommunityUserRestriction r where r.accountId = :accountId
              and r.releasedAt is null and r.startsAt <= :now and (r.endsAt is null or r.endsAt > :now)
            """)
    boolean existsActive(Long accountId, java.time.OffsetDateTime now);
}
