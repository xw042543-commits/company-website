package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;

@Entity
@Table(name = "consultation_enquiries")
@Getter
public class ConsultationEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_code", nullable = false, unique = true)
    private UUID referenceCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String contact;

    @Column(name = "intended_school", length = 200)
    private String intendedSchool;

    @Column(name = "intended_course", length = 200)
    private String intendedCourse;

    @Column(length = 20)
    private String qualification;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false, length = 2)
    private String locale;

    @Column(name = "privacy_consent", nullable = false)
    private boolean privacyConsent;

    @Column(name = "privacy_notice_version", nullable = false, length = 50)
    private String privacyNoticeVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultationStatus status;

    @Column(name = "status_updated_at", nullable = false)
    private OffsetDateTime statusUpdatedAt;

    @Column(name = "status_updated_by_user_id")
    private Long statusUpdatedByUserId;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected ConsultationEnquiry() {
    }

    ConsultationEnquiry(
            UUID referenceCode,
            String name,
            String contact,
            String intendedSchool,
            String intendedCourse,
            String qualification,
            String notes,
            String locale,
            String privacyNoticeVersion,
            OffsetDateTime createdAt
    ) {
        this.referenceCode = referenceCode;
        this.name = name;
        this.contact = contact;
        this.intendedSchool = intendedSchool;
        this.intendedCourse = intendedCourse;
        this.qualification = qualification;
        this.notes = notes;
        this.locale = locale;
        this.privacyConsent = true;
        this.privacyNoticeVersion = privacyNoticeVersion;
        this.status = ConsultationStatus.NEW;
        this.createdAt = createdAt;
        this.statusUpdatedAt = createdAt;
    }
}
