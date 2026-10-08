package com.yangdoujiao.website.community;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.common.exception.ApiException;

@Service @Transactional(readOnly=true)
public class CommunityPersonalService {
    private final CommunityPostRepository posts;
    private final CommunityCommentRepository comments;
    private final CommunityCursorCodec cursors;
    public CommunityPersonalService(CommunityPostRepository posts, CommunityCommentRepository comments, CommunityCursorCodec cursors) {
        this.posts=posts; this.comments=comments; this.cursors=cursors;
    }
    public CommunityCursorPage<CommunityMyPost> posts(long actorId, String cursor, int requestedSize) {
        int size = size(requestedSize);
        String scope = cursors.personalScope("posts", actorId);
        var position = cursor == null ? null : cursors.decode(cursor, scope);
        var page = PageRequest.of(0, size+1);
        var found = position == null ? posts.findByAuthorAccountIdOrderByCreatedAtDescIdDesc(actorId, page)
                : posts.findOwnAfter(actorId, position.timestamp(), position.id(), page);
        var rows = found.subList(0, Math.min(size, found.size()));
        String next = found.size() > size ? cursors.encode(rows.getLast().getCreatedAt(), rows.getLast().getId(), scope) : null;
        return new CommunityCursorPage<>(rows.stream().map(p -> new CommunityMyPost(p.getId().toString(), p.getBody(),
                p.getStatus(), message(p.getStatus()), p.getCreatedAt(), p.getPublishedAt(), p.getCommentCount(), p.getLikeCount())).toList(), next);
    }
    public CommunityCursorPage<CommunityMyComment> comments(long actorId, String cursor, int requestedSize) {
        int size = size(requestedSize);
        String scope = cursors.personalScope("comments", actorId);
        var position = cursor == null ? null : cursors.decode(cursor, scope);
        var page = PageRequest.of(0, size+1);
        // Retained own replies remain visible independently of the post/root's public status.
        var found = position == null ? comments.findByAuthorAccountIdOrderByCreatedAtDescIdDesc(actorId, page)
                : comments.findOwnAfter(actorId, position.timestamp(), position.id(), page);
        var rows = found.subList(0, Math.min(size, found.size()));
        String next = found.size() > size ? cursors.encode(rows.getLast().getCreatedAt(), rows.getLast().getId(), scope) : null;
        return new CommunityCursorPage<>(rows.stream().map(c -> new CommunityMyComment(c.getId().toString(), c.getPostId().toString(),
                c.getParentCommentId() == null ? null : c.getParentCommentId().toString(), c.getBody(), c.getStatus(), message(c.getStatus()),
                c.getCreatedAt(), c.getLikeCount())).toList(), next);
    }
    private static int size(int size) {
        if (size < 1) throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_PAGE_SIZE", "Community page size must be positive");
        return Math.min(size, 50);
    }
    private static String message(CommunityContentStatus status) {
        return switch (status) {
            case PUBLISHED -> "已发布";
            case PENDING_REVIEW -> "审核中";
            case HIDDEN -> "内容暂不可公开展示";
            case DELETED -> "已删除";
            case REJECTED -> "内容未通过审核";
        };
    }
}
