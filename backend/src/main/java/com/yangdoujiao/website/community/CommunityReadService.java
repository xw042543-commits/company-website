package com.yangdoujiao.website.community;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
@Transactional(readOnly = true)
public class CommunityReadService {
    private static final CommunityContentStatus PUBLIC = CommunityContentStatus.PUBLISHED;
    private final CommunityPostRepository posts;
    private final CommunityCommentRepository comments;
    private final CommunityReactionRepository reactions;
    private final UserExternalIdentityRepository identities;
    private final CommunityCursorCodec cursors;
    private final Clock clock;

    public CommunityReadService(CommunityPostRepository posts, CommunityCommentRepository comments,
            CommunityReactionRepository reactions, UserExternalIdentityRepository identities,
            CommunityCursorCodec cursors, Clock clock) {
        this.posts = posts;
        this.comments = comments;
        this.reactions = reactions;
        this.identities = identities;
        this.cursors = cursors;
        this.clock = clock;
    }

    public CommunityCursorPage<CommunityPostSummary> list(String sort, String cursor, int requestedSize, UserPrincipal viewer) {
        if (!"latest".equals(sort) && !"hot".equals(sort)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_SORT", "Community sort is invalid");
        }
        int size = pageSize(requestedSize);
        CommunityCursorCodec.Position position = cursor == null ? null : cursors.decode(cursor, sort);
        PageRequest page = PageRequest.of(0, size + 1);
        List<CommunityPost> rows;
        String nextCursor = null;
        if ("hot".equals(sort)) {
            OffsetDateTime snapshot = position == null ? OffsetDateTime.now(clock) : position.snapshotAt();
            var ranked = posts.findHotAfter(snapshot, position == null ? null : position.score(),
                    position == null ? snapshot : position.timestamp(), position == null ? Long.MAX_VALUE : position.id(), page);
            var selected = ranked.subList(0, Math.min(size, ranked.size()));
            Map<Long, CommunityPost> byId = posts.findAllById(selected.stream().map(CommunityPostRepository.HotPosition::getId).toList())
                    .stream().filter(post -> post.getStatus() == PUBLIC).collect(Collectors.toMap(CommunityPost::getId, Function.identity()));
            rows = selected.stream().map(row -> byId.get(row.getId())).filter(java.util.Objects::nonNull).toList();
            if (ranked.size() > size) {
                var boundary = selected.getLast();
                // Keep the ranking boundary even if its content was hidden between queries.
                nextCursor = cursors.encode(boundary.getPublishedAt().atOffset(java.time.ZoneOffset.UTC), boundary.getId(), sort, snapshot, boundary.getScore());
            }
        } else {
            var found = position == null ? posts.findByStatusOrderByPublishedAtDescIdDesc(PUBLIC, page)
                    : posts.findLatestAfter(PUBLIC, position.timestamp(), position.id(), page);
            rows = found.subList(0, Math.min(size, found.size()));
            if (found.size() > size) {
                CommunityPost last = rows.getLast();
                nextCursor = cursors.encode(last.getPublishedAt(), last.getId(), sort);
            }
        }
        Map<Long, Profile> profiles = profiles(rows.stream().map(CommunityPost::getAuthorAccountId).toList());
        Set<Long> likes = likes(viewer, CommunityTargetType.POST, rows.stream().map(CommunityPost::getId).toList());
        return new CommunityCursorPage<>(rows.stream().map(post -> {
            Profile profile = profiles.getOrDefault(post.getAuthorAccountId(), Profile.DEFAULT);
            return new CommunityPostSummary(post.getId().toString(), profile.name(), profile.avatarUrl(),
                    preview(post.getBody()), post.getCommentCount(), post.getLikeCount(), post.getPublishedAt(), likes.contains(post.getId()));
        }).toList(), nextCursor);
    }

    public CommunityPostDetail detail(Long id, UserPrincipal viewer) {
        CommunityPost post = publishedPost(id);
        Profile profile = profiles(List.of(post.getAuthorAccountId())).getOrDefault(post.getAuthorAccountId(), Profile.DEFAULT);
        return new CommunityPostDetail(post.getId().toString(), profile.name(), profile.avatarUrl(), post.getBody(),
                post.getCommentCount(), post.getLikeCount(), post.getPublishedAt(),
                likes(viewer, CommunityTargetType.POST, List.of(id)).contains(id));
    }

    public CommunityCursorPage<CommunityCommentView> comments(Long postId, String cursor, int requestedSize, UserPrincipal viewer) {
        publishedPost(postId);
        int size = pageSize(requestedSize);
        String scope = "comments:" + postId;
        var position = cursor == null ? null : cursors.decode(cursor, scope);
        PageRequest page = PageRequest.of(0, size + 1);
        var found = position == null ? comments.findByPostIdAndStatusAndParentCommentIdIsNullOrderByCreatedAtAscIdAsc(postId, PUBLIC, page)
                : comments.findTopLevelAfter(postId, PUBLIC, position.timestamp(), position.id(), page);
        var roots = found.subList(0, Math.min(size, found.size()));
        var replies = roots.isEmpty() ? List.<CommunityComment>of()
                : comments.findByPostIdAndStatusAndParentCommentIdInOrderByCreatedAtAscIdAsc(
                        postId, PUBLIC, roots.stream().map(CommunityComment::getId).toList());
        List<CommunityComment> all = new ArrayList<>(roots);
        all.addAll(replies);
        Map<Long, Profile> profiles = profiles(all.stream().map(CommunityComment::getAuthorAccountId).toList());
        Set<Long> likes = likes(viewer, CommunityTargetType.COMMENT, all.stream().map(CommunityComment::getId).toList());
        Map<Long, List<CommunityComment>> children = replies.stream().collect(Collectors.groupingBy(CommunityComment::getParentCommentId));
        String nextCursor = found.size() <= size ? null
                : cursors.encode(roots.getLast().getCreatedAt(), roots.getLast().getId(), scope);
        return new CommunityCursorPage<>(roots.stream().map(root -> commentView(root, profiles, likes,
                children.getOrDefault(root.getId(), List.of()).stream().map(reply -> commentView(reply, profiles, likes, List.of())).toList()))
                .toList(), nextCursor);
    }

    private CommunityCommentView commentView(CommunityComment comment, Map<Long, Profile> profiles,
            Set<Long> likes, List<CommunityCommentView> replies) {
        Profile profile = profiles.getOrDefault(comment.getAuthorAccountId(), Profile.DEFAULT);
        return new CommunityCommentView(comment.getId().toString(), profile.name(), profile.avatarUrl(), comment.getBody(),
                comment.getCreatedAt(), comment.getLikeCount(), likes.contains(comment.getId()), replies);
    }

    private CommunityPost publishedPost(Long id) {
        return posts.findByIdAndStatus(id, PUBLIC).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                "COMMUNITY_POST_NOT_FOUND", "Community post is unavailable"));
    }

    private Map<Long, Profile> profiles(List<Long> ids) {
        Map<Long, Profile> result = new HashMap<>();
        if (!ids.isEmpty()) identities.findProfilesByAccountIds(ids.stream().distinct().toList()).forEach(identity ->
                result.putIfAbsent(identity.getUserAccount().getId(), new Profile(
                        identity.getDisplayName() == null || identity.getDisplayName().isBlank() ? Profile.DEFAULT.name() : identity.getDisplayName(),
                        identity.getAvatarUrl() == null || identity.getAvatarUrl().isBlank() ? null : identity.getAvatarUrl())));
        return result;
    }

    private Set<Long> likes(UserPrincipal viewer, CommunityTargetType type, List<Long> ids) {
        return viewer == null || ids.isEmpty() ? Set.of()
                : new HashSet<>(reactions.findLikedTargetIds(viewer.userId(), type, ids));
    }

    private static int pageSize(int size) {
        if (size < 1) throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_PAGE_SIZE", "Community page size must be positive");
        return Math.min(size, 50);
    }

    private static String preview(String body) {
        return body.codePointCount(0, body.length()) <= 200 ? body : body.substring(0, body.offsetByCodePoints(0, 200));
    }

    // Null avatar means the existing client renders its brand avatar fallback; private account names are never exposed.
    private record Profile(String name, String avatarUrl) { private static final Profile DEFAULT = new Profile("微信用户", null); }
}
