package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.List;

public record CommunityModerationDetail(CommunityTargetType targetType, String targetId,
        CommunityContentStatus status, String body, String postId, String parentCommentId,
        long version, long openReportCount, List<ReportSummary> reports, List<Action> actions,
        String actionsNextCursor, String title, CommunityCategory category, String universityId, String universityName) {
    public record ReportSummary(String reasonCode, CommunityReportStatus status, long count) {}
    public record Action(String id, String command, String reasonCode, CommunityContentStatus previousStatus,
            CommunityContentStatus nextStatus, OffsetDateTime createdAt) {}
}
