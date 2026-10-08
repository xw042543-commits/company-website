package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityReportResponse(String id, CommunityTargetType targetType, String targetId,
        CommunityReportStatus status, OffsetDateTime createdAt) {}
