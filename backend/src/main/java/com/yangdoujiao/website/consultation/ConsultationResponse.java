package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ConsultationResponse(UUID referenceCode, OffsetDateTime submittedAt) {
    static ConsultationResponse from(ConsultationEnquiry enquiry) {
        return new ConsultationResponse(enquiry.getReferenceCode(), enquiry.getCreatedAt());
    }
}
