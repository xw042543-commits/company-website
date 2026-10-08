package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityPostSummary(String id, String authorName, String authorAvatarUrl,
        String bodyPreview, int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe) {}
