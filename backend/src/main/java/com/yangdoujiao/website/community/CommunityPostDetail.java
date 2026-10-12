package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

public record CommunityPostDetail(String id, String authorName, String authorAvatarUrl,
        String body, int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe,
        boolean ownedByMe, String title, CommunityCategory category, String universityId, String universityName) {
    public CommunityPostDetail { title = CommunityText.readableTitle(title); }
    public CommunityPostDetail(String id, String authorName, String authorAvatarUrl, String body,
            int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe, boolean ownedByMe) {
        this(id, authorName, authorAvatarUrl, body, commentCount, likeCount, publishedAt, likedByMe, ownedByMe,
                null, CommunityCategory.GENERAL, null, null);
    }
}
