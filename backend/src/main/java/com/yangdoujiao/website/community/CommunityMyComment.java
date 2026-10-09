package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityMyComment(String id, String postId, String parentCommentId, String body,
        CommunityContentStatus status, String statusMessage, OffsetDateTime createdAt, int likeCount) {}
