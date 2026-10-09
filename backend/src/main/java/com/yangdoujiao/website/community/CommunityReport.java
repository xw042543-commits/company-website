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
@Table(name = "community_reports")
@Getter
public class CommunityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_account_id", nullable = false, updatable = false)
    private Long reporterAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 10)
    private CommunityTargetType targetType;

    @Column(name = "target_id", nullable = false, updatable = false)
    private Long targetId;

    @Column(name = "reason_code", nullable = false, length = 50, updatable = false)
    private String reasonCode;

    @Column(name = "note", length = 500, updatable = false)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CommunityReportStatus status;

    @Column(name = "handled_by_account_id")
    private Long handledByAccountId;

    @Column(name = "handled_at")
    private OffsetDateTime handledAt;

    @Column(name = "resolution_reason_code", length = 50)
    private String resolutionReasonCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected CommunityReport() {
    }

    static CommunityReport create(Long reporterAccountId, CommunityTargetType targetType, Long targetId,
            String reasonCode, String note, OffsetDateTime now) {
        CommunityReport report = new CommunityReport();
        report.reporterAccountId = reporterAccountId;
        report.targetType = targetType;
        report.targetId = targetId;
        report.reasonCode = reasonCode;
        report.note = note;
        report.status = CommunityReportStatus.OPEN;
        report.createdAt = now;
        return report;
    }

    void resolve(CommunityReportStatus resolution, Long handledByAccountId, String resolutionReasonCode,
            OffsetDateTime now) {
        status = resolution;
        this.handledByAccountId = handledByAccountId;
        this.resolutionReasonCode = resolutionReasonCode;
        handledAt = now;
    }
}
