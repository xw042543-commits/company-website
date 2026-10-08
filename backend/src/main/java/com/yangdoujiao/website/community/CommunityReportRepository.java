package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {
    java.util.Optional<CommunityReport> findByReporterAccountIdAndTargetTypeAndTargetIdAndStatus(
            Long accountId, CommunityTargetType type, Long targetId, CommunityReportStatus status);
    long countByTargetTypeAndTargetIdAndStatus(CommunityTargetType type, Long targetId, CommunityReportStatus status);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("""
            update CommunityReport r set r.status=:status, r.handledByAccountId=:actor,
              r.handledAt=:now, r.resolutionReasonCode=:reason
            where r.targetType=:type and r.targetId=:target and r.status=com.yangdoujiao.website.community.CommunityReportStatus.OPEN
            """)
    int resolveOpen(CommunityTargetType type, Long target, CommunityReportStatus status, Long actor,
            String reason, java.time.OffsetDateTime now);
}
