package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityPostSummary(String id, String authorName, String authorAvatarUrl,
        String bodyPreview, int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe,
        String title, CommunityCategory category, String universityId, String universityName) {
    public CommunityPostSummary { title = CommunityText.readableTitle(title); }
    public CommunityPostSummary(String id, String authorName, String authorAvatarUrl, String bodyPreview,
            int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe) {
        this(id, authorName, authorAvatarUrl, bodyPreview, commentCount, likeCount, publishedAt, likedByMe,
                null, CommunityCategory.GENERAL, null, null);
    }
}
