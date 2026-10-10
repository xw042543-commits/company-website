package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.yangdoujiao.website.common.exception.ApiException;

/** URL negotiation keeps installed exact-key readers working. Never cache viewer-specific reads. */
final class CommunityPostRepresentation {
    private CommunityPostRepresentation() {}

    static boolean campus(String representation) {
        if (representation == null) return false;
        if ("campus-v1".equals(representation)) return true;
        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_REPRESENTATION", "Community representation is invalid");
    }

    static ResponseEntity<?> feed(CommunityCursorPage<CommunityPostSummary> page, boolean campus) {
        return response(campus ? page : new CommunityCursorPage<>(page.items().stream().map(p ->
                new LegacySummary(p.id(), p.authorName(), p.authorAvatarUrl(), p.bodyPreview(), p.commentCount(),
                        p.likeCount(), p.publishedAt(), p.likedByMe())).toList(), page.nextCursor()));
    }

    static ResponseEntity<?> detail(CommunityPostDetail p, boolean campus) {
        return response(campus ? p : new LegacyDetail(p.id(), p.authorName(), p.authorAvatarUrl(), p.body(),
                p.commentCount(), p.likeCount(), p.publishedAt(), p.likedByMe(), p.ownedByMe()));
    }

    static ResponseEntity<?> personal(CommunityCursorPage<CommunityMyPost> page, boolean campus) {
        return response(campus ? page : new CommunityCursorPage<>(page.items().stream().map(p ->
                new LegacyPersonal(p.id(), p.body(), p.status(), p.statusMessage(), p.createdAt(),
                        p.publishedAt(), p.commentCount(), p.likeCount())).toList(), page.nextCursor()));
    }

    private static ResponseEntity<?> response(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
    }

    private record LegacySummary(String id, String authorName, String authorAvatarUrl, String bodyPreview,
            int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe) {}
    private record LegacyDetail(String id, String authorName, String authorAvatarUrl, String body,
            int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe, boolean ownedByMe) {}
    private record LegacyPersonal(String id, String body, CommunityContentStatus status, String statusMessage,
            OffsetDateTime createdAt, OffsetDateTime publishedAt, int commentCount, int likeCount) {}
}
