package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ConsultationStatusUpdateResponse(
        UUID referenceCode,
        ConsultationStatus status,
        OffsetDateTime statusUpdatedAt,
        long statusUpdatedByUserId,
        long version
) {
}
