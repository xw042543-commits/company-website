package com.yangdoujiao.website.consultation;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ConsultationStatus {
    NEW,
    IN_PROGRESS,
    COMPLETED;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static ConsultationStatus fromJson(Object value) {
        if (value instanceof String text) {
            for (ConsultationStatus status : values()) {
                if (status.name().equals(text)) return status;
            }
        }
        throw new IllegalArgumentException("Unsupported consultation status");
    }
}
