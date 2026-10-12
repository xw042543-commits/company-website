package com.yangdoujiao.website.community;

/** Validated filters shared by PostgreSQL queries, signed cursors and Redis namespaces. */
public record CommunityFeedScope(CommunityCategory category, Long universityId) {
    static final CommunityFeedScope ALL = new CommunityFeedScope(null, null);
    String key() { return (category == null ? "ALL" : category.name()) + ":" + (universityId == null ? "ALL" : universityId); }
    boolean unfiltered() { return category == null && universityId == null; }
    boolean matches(CommunityPost post) {
        return (category == null || category == post.getCategory())
                && (universityId == null || universityId.equals(post.getUniversityId()));
    }
}
