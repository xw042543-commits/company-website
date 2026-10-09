package com.yangdoujiao.website.community;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.function.Supplier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional
public class CommunityWriteService {
    private final CommunityProperties properties;
    private final CommunityPostRepository posts;
    private final CommunityCommentRepository comments;
    private final CommunityIdempotencyRecordRepository idempotency;
    private final CommunityUserRestrictionRepository restrictions;
    private final UserAccountRepository accounts;
    private final CommunityRateLimiter limiter;
    private final CommunityRiskPolicy risk;
    private final ObjectMapper json;
    private final Clock clock;
    private final StringRedisTemplate redis;
    private final CommunityMetrics metrics;

    public CommunityWriteService(CommunityProperties properties, CommunityPostRepository posts,
            CommunityCommentRepository comments, CommunityIdempotencyRecordRepository idempotency,
            CommunityUserRestrictionRepository restrictions, UserAccountRepository accounts,
            CommunityRateLimiter limiter, CommunityRiskPolicy risk, ObjectMapper json, Clock clock, StringRedisTemplate redis,
            CommunityMetrics metrics) {
        this.properties = properties; this.posts = posts; this.comments = comments; this.idempotency = idempotency;
        this.restrictions = restrictions; this.accounts = accounts; this.limiter = limiter; this.risk = risk;
        this.json = json; this.clock = clock; this.redis = redis; this.metrics = metrics;
    }

    public CreationResult createPost(long actorId, String address, String key, CommunityPostRequest request) {
        String body = normalize(request == null ? null : request.body(), 2000);
        return execute(actorId, "CREATE_POST", key, hash(List.of(body)), () -> {
            requireAllowed(actorId);
            limiter.checkPost(actorId, address);
            var status = classify(body);
            var post = posts.saveAndFlush(CommunityPost.create(actorId, body, status,
                    status == CommunityContentStatus.PENDING_REVIEW ? "RISK_REVIEW" : null, now()));
            return new CommunityCreationResponse(post.getId().toString(), null, null, post.getBody(), post.getStatus(),
                    post.getCreatedAt(), post.getPublishedAt());
        });
    }

    public CreationResult createComment(long actorId, long postId, String address, String key, CommunityCommentRequest request) {
        String body = normalize(request == null ? null : request.body(), 1000);
        Long parentId = parentId(request == null ? null : request.parentCommentId());
        return execute(actorId, "CREATE_COMMENT", key, hash(java.util.Arrays.asList(Long.toString(postId), parentId == null ? null : parentId.toString(), body)), () -> {
            requireAllowed(actorId);
            var post = lockedPost(postId);
            if (post.getStatus() != CommunityContentStatus.PUBLISHED) throw targetUnavailable();
            CommunityComment parent = parentId == null ? null : comments.findByIdAndPostIdAndStatusAndParentCommentIdIsNull(
                    parentId, postId, CommunityContentStatus.PUBLISHED).orElseThrow(() -> new ApiException(
                            HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_PARENT", "Reply parent must be a published top-level comment on this post"));
            limiter.checkComment(actorId, address);
            var status = classify(body);
            var comment = comments.saveAndFlush(CommunityComment.create(postId, actorId, parentId,
                    parent == null ? null : parent.getAuthorAccountId(), body, status, now()));
            if (status == CommunityContentStatus.PUBLISHED) post.adjustCommentCount(1, now());
            return new CommunityCreationResponse(comment.getId().toString(), Long.toString(postId),
                    parentId == null ? null : parentId.toString(), comment.getBody(), comment.getStatus(), comment.getCreatedAt(), null);
        });
    }

    public void deletePost(long actorId, long postId) {
        requireEnabled(); lockAccount(actorId);
        var post = lockedPost(postId);
        requireOwner(actorId, post.getAuthorAccountId());
        if (post.getStatus() != CommunityContentStatus.DELETED) {
            post.changeStatus(CommunityContentStatus.DELETED, now());
            invalidateHotAfterCommit();
        }
    }

    public void deleteComment(long actorId, long commentId) {
        requireEnabled(); lockAccount(actorId);
        var postId = comments.findPostIdById(commentId).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "COMMUNITY_COMMENT_NOT_FOUND", "Community comment does not exist"));
        var post = lockedPost(postId);
        // Global lock order is account -> post -> comment, also used by creation.
        var comment = comments.findLockedById(commentId).orElseThrow();
        requireOwner(actorId, comment.getAuthorAccountId());
        if (comment.getStatus() != CommunityContentStatus.DELETED) {
            if (post.getStatus() == CommunityContentStatus.PUBLISHED && comment.getStatus() == CommunityContentStatus.PUBLISHED) {
                if (comment.getParentCommentId() == null) {
                    long visibleReplies = comments.countByPostIdAndParentCommentIdAndStatus(post.getId(), commentId,
                            CommunityContentStatus.PUBLISHED);
                    post.adjustCommentCount(-Math.toIntExact(1 + visibleReplies), now());
                } else if (comments.findByIdAndPostIdAndStatusAndParentCommentIdIsNull(comment.getParentCommentId(),
                        post.getId(), CommunityContentStatus.PUBLISHED).isPresent()) {
                    post.adjustCommentCount(-1, now());
                }
            }
            comment.changeStatus(CommunityContentStatus.DELETED, now());
            invalidateHotAfterCommit();
        }
    }

    private CreationResult execute(long actorId, String operation, String key, String fingerprint,
            Supplier<CommunityCreationResponse> action) {
        requireEnabled();
        if (key == null || !key.matches("[A-Za-z0-9._:-]{1,64}")) throw new ApiException(
                HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key is required");
        // PostgreSQL serializes the account's write transactions across replicas; Redis is not a dedupe authority.
        lockAccount(actorId);
        var existing = idempotency.findByAccountIdAndOperationTypeAndIdempotencyKey(actorId, operation, key);
        if (existing.isPresent()) {
            var record = existing.get();
            if (!record.getRequestHash().equals(fingerprint)) throw new ApiException(
                    HttpStatus.CONFLICT, "IDEMPOTENCY_CONFLICT", "Idempotency key was used for a different request");
            if (record.getResultResponse() == null) throw CommunityRateLimiter.unavailable();
            metrics.idempotencyHit("CREATE_POST".equals(operation) ? CommunityMetrics.Command.POST : CommunityMetrics.Command.COMMENT);
            return new CreationResult(json.readValue(record.getResultResponse(), CommunityCreationResponse.class), true);
        }
        var response = action.get();
        idempotency.saveAndFlush(CommunityIdempotencyRecord.create(actorId, operation, key, fingerprint,
                Long.valueOf(response.id()), json.writeValueAsString(response), now()));
        return new CreationResult(response, false);
    }

    private void lockAccount(long actorId) {
        var account = accounts.findLockedById(actorId).orElseThrow(() -> new ApiException(
                HttpStatus.UNAUTHORIZED, "AUTHENTICATION_REQUIRED", "Authentication is required"));
        if (account.getStatus() != UserAccountStatus.ACTIVE) throw new ApiException(
                HttpStatus.FORBIDDEN, "COMMUNITY_USER_RESTRICTED", "Account cannot write community content");
    }
    private void requireAllowed(long actorId) {
        CommunityRestrictionGuard.requireAllowed(restrictions,actorId,now());
    }
    private void requireEnabled() {
        if (!properties.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "COMMUNITY_DISABLED", "Community writes are disabled");
    }
    private CommunityPost lockedPost(long id) {
        return posts.findLockedById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "COMMUNITY_POST_NOT_FOUND", "Community post does not exist"));
    }
    private CommunityContentStatus classify(String body) {
        return switch (risk.classify(body)) {
            case PUBLISH -> CommunityContentStatus.PUBLISHED;
            case REVIEW -> CommunityContentStatus.PENDING_REVIEW;
            case REJECT -> throw new ApiException(HttpStatus.BAD_REQUEST, "COMMUNITY_CONTENT_REJECTED", "Content cannot be published");
        };
    }
    private static void requireOwner(long actorId, Long authorId) {
        if (!Objects.equals(actorId, authorId)) throw new ApiException(HttpStatus.FORBIDDEN,
                "COMMUNITY_NOT_OWNER", "Only the author can delete this content");
    }
    private static ApiException targetUnavailable() {
        return new ApiException(HttpStatus.CONFLICT, "COMMUNITY_TARGET_UNAVAILABLE", "Community target is not published");
    }
    private String hash(Object canonical) { return AuthHash.sha256(json.writeValueAsString(canonical)); }
    private OffsetDateTime now() { return OffsetDateTime.now(clock); }

    static long decimalId(String id) {
        if (id == null || !id.matches("[1-9][0-9]{0,18}")) throw invalidId();
        try { return Long.parseLong(id); } catch (NumberFormatException exception) { throw invalidId(); }
    }
    private static Long parentId(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (!node.isString()) throw invalidId();
        return decimalId(node.asString());
    }
    private static ApiException invalidId() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_ID", "Community ID must be a decimal string");
    }
    private static String normalize(JsonNode node, int maximum) {
        if (node == null || !node.isString()) throw invalidBody();
        String body = node.asString().replace("\r\n", "\n").replace('\r', '\n');
        if (body.codePoints().allMatch(point -> Character.isWhitespace(point) || Character.isSpaceChar(point))
                || body.codePointCount(0, body.length()) > maximum) throw invalidBody();
        for (int offset = 0; offset < body.length();) {
            int codePoint = body.codePointAt(offset);
            if ((Character.isISOControl(codePoint) && codePoint != '\n' && codePoint != '\t')
                    || codePoint >= 0xD800 && codePoint <= 0xDFFF) throw invalidBody();
            offset += Character.charCount(codePoint);
        }
        return body;
    }
    private static ApiException invalidBody() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_BODY", "Community text is blank, too long, or contains invalid characters");
    }
    private void invalidateHotAfterCommit() {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                try { redis.delete("community:hot:v1:current"); } catch (DataAccessException ignored) {
                    metrics.redisUnavailable(CommunityMetrics.Command.CACHE_INVALIDATION);
                    // A short-lived derived cache cannot override the committed PostgreSQL visibility decision.
                }
            }
        });
    }
    public record CreationResult(CommunityCreationResponse response, boolean replay) {}
}
