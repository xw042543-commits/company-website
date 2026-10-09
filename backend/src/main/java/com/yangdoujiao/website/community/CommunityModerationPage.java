package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.List;

public record CommunityModerationPage(List<Item> items, String nextCursor) {
    public record Item(CommunityTargetType targetType, String targetId, CommunityContentStatus status,
            String bodyPreview, long version, long openReportCount, OffsetDateTime createdAt) {}
}
