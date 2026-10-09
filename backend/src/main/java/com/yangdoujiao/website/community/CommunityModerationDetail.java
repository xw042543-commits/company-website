package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.List;

public record CommunityModerationDetail(CommunityTargetType targetType, String targetId,
        CommunityContentStatus status, String body, String postId, String parentCommentId,
        long version, long openReportCount, List<ReportSummary> reports, List<Action> actions,
        String actionsNextCursor) {
    public record ReportSummary(String reasonCode, CommunityReportStatus status, long count) {}
    public record Action(String id, String command, String reasonCode, CommunityContentStatus previousStatus,
            CommunityContentStatus nextStatus, OffsetDateTime createdAt) {}
}
