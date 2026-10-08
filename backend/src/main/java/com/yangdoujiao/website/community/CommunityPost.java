package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;

@Entity
@Table(name = "community_posts")
@Getter
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_account_id", nullable = false, updatable = false)
    private Long authorAccountId;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CommunityContentStatus status;

    @Column(name = "comment_count", nullable = false)
    private int commentCount;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "risk_reason_code", length = 50)
    private String riskReasonCode;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected CommunityPost() {
    }

    static CommunityPost create(Long authorAccountId, String body, CommunityContentStatus status,
            String riskReasonCode, OffsetDateTime now) {
        CommunityPost post = new CommunityPost();
        post.authorAccountId = authorAccountId;
        post.body = body;
        post.status = status;
        post.riskReasonCode = riskReasonCode;
        post.publishedAt = status == CommunityContentStatus.PUBLISHED ? now : null;
        post.createdAt = now;
        post.updatedAt = now;
        return post;
    }

    void changeStatus(CommunityContentStatus nextStatus, OffsetDateTime now) {
        status = nextStatus;
        if (nextStatus == CommunityContentStatus.PUBLISHED && publishedAt == null) {
            publishedAt = now;
        }
        updatedAt = now;
    }

    void adjustCommentCount(int delta, OffsetDateTime now) {
        commentCount += delta;
        updatedAt = now;
    }

    void adjustLikeCount(int delta, OffsetDateTime now) {
        likeCount = Math.max(0, Math.addExact(likeCount, delta));
        updatedAt = now;
    }

    void reconcileCounts(int likes, int comments, OffsetDateTime now) {
        likeCount = likes;
        commentCount = comments;
        updatedAt = now;
    }
}
