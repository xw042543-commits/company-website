package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityPostDetail(String id, String authorName, String authorAvatarUrl,
        String body, int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe) {}
