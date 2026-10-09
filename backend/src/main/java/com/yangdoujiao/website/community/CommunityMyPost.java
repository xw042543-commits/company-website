package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

/** Author-only retained content; no internal moderation or identity fields. */
public record CommunityMyPost(String id, String body, CommunityContentStatus status, String statusMessage,
        OffsetDateTime createdAt, OffsetDateTime publishedAt, int commentCount, int likeCount) {}
