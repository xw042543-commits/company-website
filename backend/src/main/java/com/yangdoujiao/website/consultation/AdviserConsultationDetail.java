package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdviserConsultationDetail(
        UUID referenceCode,
        String name,
        String contact,
        String intendedSchool,
        String intendedCourse,
        String qualification,
        ConsultationStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime statusUpdatedAt,
        long version,
        String notes,
        String locale,
        String privacyNoticeVersion,
        Long statusUpdatedByUserId
) {
    static AdviserConsultationDetail from(ConsultationEnquiry enquiry) {
        return new AdviserConsultationDetail(enquiry.getReferenceCode(), enquiry.getName(), enquiry.getContact(),
                enquiry.getIntendedSchool(), enquiry.getIntendedCourse(), enquiry.getQualification(),
                enquiry.getStatus(), enquiry.getCreatedAt(), enquiry.getStatusUpdatedAt(), enquiry.getVersion(),
                enquiry.getNotes(), enquiry.getLocale(), enquiry.getPrivacyNoticeVersion(),
                enquiry.getStatusUpdatedByUserId());
    }
}
