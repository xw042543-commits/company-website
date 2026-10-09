package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import jakarta.validation.constraints.*;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.annotation.JsonDeserialize;

public record CommunityModerationRequest(@NotNull CommunityModerationCommand command,
        @NotNull CommunityModerationReason reasonCode,
        @NotNull @PositiveOrZero @JsonDeserialize(using = VersionDeserializer.class) Long version,
        OffsetDateTime restrictionEndsAt) {
    /** Scope strict integer syntax to this HTTP property, leaving unrelated Jackson consumers unchanged. */
    public static final class VersionDeserializer extends ValueDeserializer<Long> {
        @Override public Long deserialize(JsonParser parser, DeserializationContext context) {
            if (parser.currentToken() != JsonToken.VALUE_NUMBER_INT) {
                return context.reportInputMismatch(Long.class, "Moderation version must be a nonnegative JSON integer");
            }
            long value = parser.getLongValue();
            if (value < 0) return context.reportInputMismatch(Long.class, "Moderation version must be nonnegative");
            return value;
        }
    }
}
