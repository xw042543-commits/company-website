package com.yangdoujiao.website.community;

import java.time.Clock;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
@Transactional
public class CommunityReactionService {
    private final CommunityProperties properties;
    private final UserAccountRepository accounts;
    private final CommunityUserRestrictionRepository restrictions;
    private final CommunityPostRepository posts;
    private final CommunityCommentRepository comments;
    private final CommunityReactionRepository reactions;
    private final Clock clock;
    private final CommunityNotificationPublisher notifications;

    public CommunityReactionService(CommunityProperties properties, UserAccountRepository accounts,
            CommunityUserRestrictionRepository restrictions, CommunityPostRepository posts,
            CommunityCommentRepository comments, CommunityReactionRepository reactions, Clock clock,
            CommunityNotificationPublisher notifications) {
        this.properties = properties; this.accounts = accounts; this.restrictions = restrictions;
        this.posts = posts; this.comments = comments; this.reactions = reactions; this.clock = clock;
        this.notifications = notifications;
    }

    public void like(long actorId, CommunityTargetType type, long targetId) {
        requireActor(actorId, true);
        var target = lockedTarget(type, targetId);
        requirePublic(target);
        if (reactions.insertIfAbsent(actorId, type.name(), targetId) == 1) {
            target.adjustLikes(1, now());
            notifications.like(actorId, type, targetId, target.post(), target.comment());
        }
    }

    public void unlike(long actorId, CommunityTargetType type, long targetId) {
        // An active muted/banned account can remove its own reaction, but cannot create one.
        requireActor(actorId, false);
        var target = lockedTarget(type, targetId);
        requirePublic(target);
        if (reactions.deleteOwned(actorId, type, targetId) == 1) target.adjustLikes(-1, now());
    }

    /** Maintenance uses PostgreSQL only, works with writes disabled, and never changes content visibility. */
    public void reconcilePost(long postId) {
        var post = lockedPost(postId);
        int likes = Math.toIntExact(reactions.countByTargetTypeAndTargetId(CommunityTargetType.POST, postId));
        int publicComments = post.getStatus() == CommunityContentStatus.PUBLISHED
                ? Math.toIntExact(comments.countPublicComments(postId)) : 0;
        post.reconcileCounts(likes, publicComments, now());
    }

    public void reconcileComment(long commentId) {
        var target = lockedTarget(CommunityTargetType.COMMENT, commentId);
        // Reactions remain evidence belonging to this exact target even when its post/root is nonpublic.
        target.comment().reconcileLikeCount(Math.toIntExact(
                reactions.countByTargetTypeAndTargetId(CommunityTargetType.COMMENT, commentId)), now());
    }

    private void requireActor(long actorId, boolean adding) {
        if (!properties.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "COMMUNITY_DISABLED", "Community writes are disabled");
        var actor = accounts.findLockedById(actorId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                "AUTHENTICATION_REQUIRED", "Authentication is required"));
        if (actor.getStatus() != UserAccountStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "COMMUNITY_USER_RESTRICTED", "Community account is restricted");
        }
        if (adding) CommunityRestrictionGuard.requireAllowed(restrictions,actorId,now());
    }

    private Target lockedTarget(CommunityTargetType type, long targetId) {
        // Global order: account (HTTP writes) -> post -> top-level root -> target comment.
        // Maintenance uses the same suffix. Immutable coordinates are read without loading stale entities.
        if (type == CommunityTargetType.POST) return new Target(lockedPost(targetId), null, null);
        var location = comments.findLocationById(targetId).orElseThrow(CommunityReactionService::commentMissing);
        var post = lockedPost(location.getPostId());
        var root = location.getParentId() == null ? null : comments.findLockedById(location.getParentId())
                .orElseThrow(CommunityReactionService::commentMissing);
        var comment = comments.findLockedById(targetId).orElseThrow(CommunityReactionService::commentMissing);
        return new Target(post, root, comment);
    }

    private CommunityPost lockedPost(long id) {
        return posts.findLockedById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "COMMUNITY_POST_NOT_FOUND", "Community post does not exist"));
    }

    private static void requirePublic(Target target) {
        if (target.post().getStatus() != CommunityContentStatus.PUBLISHED
                || target.comment() != null && target.comment().getStatus() != CommunityContentStatus.PUBLISHED
                || target.root() != null && (target.root().getStatus() != CommunityContentStatus.PUBLISHED
                    || target.root().getParentCommentId() != null || !target.root().getPostId().equals(target.post().getId()))) {
            throw new ApiException(HttpStatus.CONFLICT, "COMMUNITY_TARGET_UNAVAILABLE", "Community target is not published");
        }
    }

    private static ApiException commentMissing() {
        return new ApiException(HttpStatus.NOT_FOUND, "COMMUNITY_COMMENT_NOT_FOUND", "Community comment does not exist");
    }
    private OffsetDateTime now() { return OffsetDateTime.now(clock); }
    private record Target(CommunityPost post, CommunityComment root, CommunityComment comment) {
        void adjustLikes(int delta, OffsetDateTime now) {
            if (comment == null) post.adjustLikeCount(delta, now); else comment.adjustLikeCount(delta, now);
        }
    }
}
