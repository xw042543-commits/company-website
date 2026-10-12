package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdviserConsultationSummary(
        UUID referenceCode,
        String name,
        String contact,
        String intendedSchool,
        String intendedCourse,
        String qualification,
        ConsultationStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime statusUpdatedAt,
        long version
) {
    static AdviserConsultationSummary from(ConsultationEnquiry enquiry) {
        return new AdviserConsultationSummary(enquiry.getReferenceCode(), enquiry.getName(), enquiry.getContact(),
                enquiry.getIntendedSchool(), enquiry.getIntendedCourse(), enquiry.getQualification(),
                enquiry.getStatus(), enquiry.getCreatedAt(), enquiry.getStatusUpdatedAt(), enquiry.getVersion());
    }
}
