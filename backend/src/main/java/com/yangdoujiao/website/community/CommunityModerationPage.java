package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.List;

public record CommunityModerationPage(List<Item> items, String nextCursor) {
    public enum SlaState { ON_TIME, WARNING, OVERDUE }
    public record Item(CommunityTargetType targetType, String targetId, CommunityContentStatus status,
            String bodyPreview, long version, long openReportCount, OffsetDateTime createdAt, SlaState slaState,
            String title, CommunityCategory category, String universityId, String universityName) {
        public Item { title = CommunityText.readableTitle(title); }
        Item withSlaState(SlaState state) {
            return new Item(targetType,targetId,status,bodyPreview,version,openReportCount,createdAt,state,
                    title,category,universityId,universityName);
        }
    }
}
