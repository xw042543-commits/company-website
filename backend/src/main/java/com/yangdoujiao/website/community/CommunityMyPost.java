package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

/** Author-only retained content; no internal moderation or identity fields. */
public record CommunityMyPost(String id, String body, CommunityContentStatus status, String statusMessage,
        OffsetDateTime createdAt, OffsetDateTime publishedAt, int commentCount, int likeCount,
        String title, CommunityCategory category, String universityId, String universityName) {
    public CommunityMyPost(String id, String body, CommunityContentStatus status, String statusMessage,
            OffsetDateTime createdAt, OffsetDateTime publishedAt, int commentCount, int likeCount) {
        this(id, body, status, statusMessage, createdAt, publishedAt, commentCount, likeCount,
                null, CommunityCategory.GENERAL, null, null);
    }
}
