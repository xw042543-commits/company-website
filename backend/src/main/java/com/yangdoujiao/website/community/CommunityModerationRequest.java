package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import jakarta.validation.constraints.*;

public record CommunityModerationRequest(@NotNull CommunityModerationCommand command,
        @NotNull CommunityModerationReason reasonCode, @NotNull @PositiveOrZero Long version,
        OffsetDateTime restrictionEndsAt) {}
