package com.yangdoujiao.website.community;
import java.time.OffsetDateTime;
/** Author-only write receipt; public reads continue to use their separate privacy-limited DTOs. */
public record CommunityCreationResponse(String id, String postId, String parentCommentId, String body,
        CommunityContentStatus status, OffsetDateTime createdAt, OffsetDateTime publishedAt) {}
