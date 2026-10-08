package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.List;

public record CommunityCommentView(String id, String authorName, String authorAvatarUrl,
        String body, OffsetDateTime createdAt, int likeCount, boolean likedByMe,
        List<CommunityCommentView> replies, String repliesNextCursor) {}
