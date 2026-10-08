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
@Table(name = "community_comments")
@Getter
public class CommunityComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false, updatable = false)
    private Long postId;

    @Column(name = "author_account_id", nullable = false, updatable = false)
    private Long authorAccountId;

    @Column(name = "parent_comment_id", updatable = false)
    private Long parentCommentId;

    @Column(name = "reply_to_account_id", updatable = false)
    private Long replyToAccountId;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CommunityContentStatus status;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected CommunityComment() {
    }

    static CommunityComment create(Long postId, Long authorAccountId, Long parentCommentId,
            Long replyToAccountId, String body, CommunityContentStatus status, OffsetDateTime now) {
        CommunityComment comment = new CommunityComment();
        comment.postId = postId;
        comment.authorAccountId = authorAccountId;
        comment.parentCommentId = parentCommentId;
        comment.replyToAccountId = replyToAccountId;
        comment.body = body;
        comment.status = status;
        comment.createdAt = now;
        comment.updatedAt = now;
        return comment;
    }

    void changeStatus(CommunityContentStatus nextStatus, OffsetDateTime now) {
        status = nextStatus;
        updatedAt = now;
    }

    void adjustLikeCount(int delta, OffsetDateTime now) {
        likeCount += delta;
        updatedAt = now;
    }
}
