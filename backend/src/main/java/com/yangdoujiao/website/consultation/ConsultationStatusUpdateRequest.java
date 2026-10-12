package com.yangdoujiao.website.consultation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ConsultationStatusUpdateRequest(
        @NotNull ConsultationStatus status,
        @NotNull @PositiveOrZero Long version
) {
}
