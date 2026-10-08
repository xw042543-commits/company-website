package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.external.*;
import com.yangdoujiao.website.auth.miniapp.MiniappTokenService;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@SpringBootTest(properties = {"app.miniapp.auth.enabled=true",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes",
        "app.miniapp.auth.local-provider-enabled=true", "app.miniapp.auth.local-test-code=community-test",
        "app.miniapp.auth.local-test-subject=community-test-subject"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, CommunityReadHttpIntegrationTest.WriteProbe.class})
@Transactional
class CommunityReadHttpIntegrationTest {
    private static final OffsetDateTime TIME = OffsetDateTime.parse("2026-10-08T00:00:00Z");
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private CommunityPostRepository posts;
    @Autowired private CommunityCommentRepository comments;
    @Autowired private CommunityReactionRepository reactions;
    @Autowired private UserAccountRepository accounts;
    @Autowired private UserExternalIdentityRepository identities;
    @Autowired private MiniappTokenService tokens;
    @Autowired private org.springframework.data.redis.core.StringRedisTemplate redis;
    @Autowired private jakarta.persistence.EntityManagerFactory entityFactory;
    @Autowired private CommunityCursorCodec cursors;
    @Autowired private CommunityHotSnapshotCache snapshots;
    @Autowired private tools.jackson.databind.ObjectMapper json;
    @Autowired private java.time.Clock clock;
    private UserAccount author;

    @BeforeEach
    void createAuthor() {
        var keys = redis.keys("community:hot:v1:*");
        if (!keys.isEmpty()) redis.delete(keys);
        author = accounts.saveAndFlush(UserAccount.external("Private real full name", "terms", "privacy"));
    }

    @Test
    void anonymousLatestUsesStableDescendingIdCursorAndExcludesEveryNonpublicStatus() throws Exception {
        var first = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var second = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var third = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        for (var status : CommunityContentStatus.values()) if (status != CommunityContentStatus.PUBLISHED) seedPost(status, TIME.plusHours(1));
        String body = mvc.perform(get("/api/v1/community/posts").param("size", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(third.getId().toString()))
                .andExpect(jsonPath("$.items[1].id").value(second.getId().toString()))
                .andExpect(jsonPath("$.items[0].authorName").value("微信用户"))
                .andExpect(jsonPath("$.items[0].authorAccountId").doesNotExist())
                .andExpect(jsonPath("$.items[0].status").doesNotExist()).andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        // Deleting the boundary row must not invalidate the next page.
        second.changeStatus(CommunityContentStatus.DELETED, TIME.plusHours(2)); posts.saveAndFlush(second);
        mvc.perform(get("/api/v1/community/posts").param("size", "2").param("cursor", cursor))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(first.getId().toString()))
                .andExpect(jsonPath("$.nextCursor").isEmpty());
        mvc.perform(head("/api/v1/community/posts")).andExpect(status().isOk());
    }

    @Test
    void defaultsToTwentyCapsPageAtFiftyAndOrdersByPublicationTime() throws Exception {
        for (int i = 0; i < 52; i++) seedPost(CommunityContentStatus.PUBLISHED, TIME.plusSeconds(i));
        mvc.perform(get("/api/v1/community/posts")).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(20));
        mvc.perform(get("/api/v1/community/posts").param("size", "500"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(50))
                .andExpect(jsonPath("$.items[0].publishedAt").value("2026-10-08T00:00:51Z"));
        mvc.perform(get("/api/v1/community/posts").param("size", "0"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_PAGE_SIZE"));
    }

    @Test
    void detailUsesSavedProfileAndStringIdBeyondJavascriptPrecision() throws Exception {
        identities.saveAndFlush(UserExternalIdentity.bind(author, ExternalIdentityProvider.WECHAT_MINI_PROGRAM,
                "community-test", "private-openid", "Public nickname", "https://example.test/avatar.png", TIME));
        long id = 9007199254740993L;
        jdbc.update("INSERT INTO community_posts(id,author_account_id,body,status,published_at) VALUES (?,?,'body','PUBLISHED',?)", id, author.getId(), TIME);
        String body = mvc.perform(get("/api/v1/community/posts/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("9007199254740993"))
                .andExpect(jsonPath("$.body").value("body"))
                .andExpect(jsonPath("$.authorName").value("Public nickname"))
                .andExpect(jsonPath("$.authorAvatarUrl").value("https://example.test/avatar.png"))
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("Private real full name", "private-openid", "authorAccountId", "riskReasonCode", "version");
        mvc.perform(head("/api/v1/community/posts/" + id)).andExpect(status().isOk());
    }

    @Test
    void missingAndNonpublicDetailsAndCommentThreadsAreNotFound() throws Exception {
        for (var state : CommunityContentStatus.values()) {
            if (state == CommunityContentStatus.PUBLISHED) continue;
            var hidden = seedPost(state, TIME);
            mvc.perform(get("/api/v1/community/posts/" + hidden.getId())).andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("COMMUNITY_POST_NOT_FOUND"));
            mvc.perform(get("/api/v1/community/posts/" + hidden.getId() + "/comments")).andExpect(status().isNotFound());
        }
        mvc.perform(get("/api/v1/community/posts/9223372036854775807")).andExpect(status().isNotFound());
    }

    @Test
    void invalidCursorAndSortReturnStableValidationErrors() throws Exception {
        mvc.perform(get("/api/v1/community/posts").param("cursor", "broken"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
        mvc.perform(get("/api/v1/community/posts").param("sort", "unknown"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_SORT"));
    }

    @Test
    void hotRanksByTimeDecayedEngagementWithStableSignedSnapshotAndTieBreaks() throws Exception {
        OffsetDateTime recent = OffsetDateTime.now().minusHours(1).withNano(0);
        var older = seedPost(CommunityContentStatus.PUBLISHED, recent.minusDays(20));
        older.adjustLikeCount(10, TIME); posts.saveAndFlush(older);
        var one = seedPost(CommunityContentStatus.PUBLISHED, recent);
        var two = seedPost(CommunityContentStatus.PUBLISHED, recent);
        var best = seedPost(CommunityContentStatus.PUBLISHED, recent);
        best.adjustCommentCount(5, TIME); posts.saveAndFlush(best);
        var hidden = seedPost(CommunityContentStatus.HIDDEN, recent);
        hidden.adjustLikeCount(1000, TIME); posts.saveAndFlush(hidden);
        String body = mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(best.getId().toString()))
                .andExpect(jsonPath("$.items[1].id").value(two.getId().toString()))
                .andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        // A newly published post after the snapshot cannot shift the continuation.
        seedPost(CommunityContentStatus.PUBLISHED, recent.plusDays(1));
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("cursor", cursor))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].id").value(one.getId().toString()))
                .andExpect(jsonPath("$.items[1].id").value(older.getId().toString()));
        mvc.perform(get("/api/v1/community/posts").param("sort", "latest").param("cursor", cursor))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("cursor", cursor + "x"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
    }

    @Test
    void hotSnapshotNeverSkipsOrRepeatsWhenEngagementCountersIncreaseOrDecrease() throws Exception {
        var time = OffsetDateTime.now().minusHours(1).withNano(0);
        var last = seedPost(CommunityContentStatus.PUBLISHED, time);
        var middle = seedPost(CommunityContentStatus.PUBLISHED, time);
        var first = seedPost(CommunityContentStatus.PUBLISHED, time);
        first.adjustLikeCount(20, time); posts.saveAndFlush(first);
        middle.adjustCommentCount(5, time); posts.saveAndFlush(middle);
        String body = mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(first.getId().toString()))
                .andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        first.adjustLikeCount(-20, time); posts.saveAndFlush(first);
        middle.adjustCommentCount(-5, time); posts.saveAndFlush(middle);
        last.adjustLikeCount(100, time); posts.saveAndFlush(last);
        String next = mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1").param("cursor", cursor))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(middle.getId().toString()))
                .andReturn().getResponse().getContentAsString();
        String finalCursor = JsonPath.read(next, "$.nextCursor");
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1").param("cursor", finalCursor))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(last.getId().toString()))
                .andExpect(jsonPath("$.nextCursor").isEmpty());
    }

    @Test
    void missingHotSnapshotRequiresExplicitRestartInsteadOfRecomputingCursorRank() throws Exception {
        var time = OffsetDateTime.now().minusHours(1);
        seedPost(CommunityContentStatus.PUBLISHED, time);
        seedPost(CommunityContentStatus.PUBLISHED, time);
        String body = mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        var keys = redis.keys("community:hot:v1:*");
        if (!keys.isEmpty()) redis.delete(keys);
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("cursor", cursor))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMUNITY_HOT_SNAPSHOT_EXPIRED"));
    }

    @Test
    void hotContinuationIsSharedAcrossReplicaInstancesAndExpiresAfterFortyFiveSeconds() throws Exception {
        var time = OffsetDateTime.now().minusHours(1);
        var second = seedPost(CommunityContentStatus.PUBLISHED, time);
        seedPost(CommunityContentStatus.PUBLISHED, time);
        var initial = snapshots.page(null, 1);
        var replicaCodec = new CommunityCursorCodec(json, clock, "test-shared-community-cursor-key-32-bytes");
        var replica = new CommunityHotSnapshotCache(redis, posts, replicaCodec, json, clock);
        assertThat(replica.page(initial.nextCursor(), 1).ids()).containsExactly(second.getId());
        var position = cursors.decodeHot(initial.nextCursor());
        Long ttl = redis.getExpire("community:hot:v1:" + position.snapshotVersion() + ":manifest", java.util.concurrent.TimeUnit.MILLISECONDS);
        assertThat(ttl).isBetween(30000L, 45000L);
        var laterClock = java.time.Clock.offset(clock, java.time.Duration.ofSeconds(46));
        var laterCodec = new CommunityCursorCodec(json, laterClock, "test-shared-community-cursor-key-32-bytes");
        var laterReplica = new CommunityHotSnapshotCache(redis, posts, laterCodec, json, laterClock);
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> laterReplica.page(initial.nextCursor(), 1))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo("COMMUNITY_HOT_SNAPSHOT_EXPIRED"));
    }

    @Test
    void lostRankingReturnsRestartErrorAndFreshRequestRebuildsFromPostgresql() throws Exception {
        var time = OffsetDateTime.now().minusHours(1);
        seedPost(CommunityContentStatus.PUBLISHED, time);
        seedPost(CommunityContentStatus.PUBLISHED, time);
        var initial = snapshots.page(null, 1);
        var position = cursors.decodeHot(initial.nextCursor());
        redis.delete("community:hot:v1:" + position.snapshotVersion() + ":ids");
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("cursor", initial.nextCursor()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMUNITY_HOT_SNAPSHOT_EXPIRED"));
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void replyContinuationIsBoundToPostAndPublishedRootAndShowsViewerLikes() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var root = comment(post, null, CommunityContentStatus.PUBLISHED);
        for (int i = 0; i < 4; i++) comment(post, root.getId(), CommunityContentStatus.PUBLISHED);
        var liked = comment(post, root.getId(), CommunityContentStatus.PUBLISHED);
        comment(post, root.getId(), CommunityContentStatus.HIDDEN);
        reactions.saveAndFlush(CommunityReaction.create(author.getId(), CommunityTargetType.COMMENT, liked.getId(), TIME));
        String body = mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments").param("size", "1"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.items[0].repliesNextCursor");
        String route = "/api/v1/community/posts/" + post.getId() + "/comments/" + root.getId() + "/replies";
        mvc.perform(get(route).param("cursor", cursor).with(user(UserPrincipal.from(author))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[1].id").value(liked.getId().toString()))
                .andExpect(jsonPath("$.items[1].likedByMe").value(true))
                .andExpect(jsonPath("$.items[0].repliesNextCursor").isEmpty());
        mvc.perform(get(route).param("size", "0")).andExpect(status().isBadRequest());
        var otherRoot = comment(post, null, CommunityContentStatus.PUBLISHED);
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments/" + otherRoot.getId() + "/replies").param("cursor", cursor))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
        var otherPost = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        mvc.perform(get("/api/v1/community/posts/" + otherPost.getId() + "/comments/" + root.getId() + "/replies"))
                .andExpect(status().isNotFound());
        root.changeStatus(CommunityContentStatus.HIDDEN, TIME); comments.saveAndFlush(root);
        mvc.perform(get(route)).andExpect(status().isNotFound());
    }

    @Test
    void singleCommentPageBoundsLoadedRepliesAndOffersCompleteReplyContinuation() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var root = comment(post, null, CommunityContentStatus.PUBLISHED);
        jdbc.update("""
                INSERT INTO community_comments(post_id,author_account_id,parent_comment_id,body,status,created_at)
                SELECT ?, ?, ?, 'reply ' || n, 'PUBLISHED', ? FROM generate_series(1,2000) n
                """, post.getId(), author.getId(), root.getId(), TIME);
        var statistics = entityFactory.unwrap(org.hibernate.SessionFactory.class).getStatistics();
        statistics.setStatisticsEnabled(true);
        long loadedBefore = statistics.getEntityLoadCount();
        String body = mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].replies.length()").value(3))
                .andExpect(jsonPath("$.items[0].repliesNextCursor").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        assertThat(statistics.getEntityLoadCount() - loadedBefore).isLessThanOrEqualTo(5L);
        java.util.Set<String> seen = new java.util.HashSet<>(JsonPath.<java.util.List<String>>read(body, "$.items[0].replies[*].id"));
        String cursor = JsonPath.read(body, "$.items[0].repliesNextCursor");
        String route = "/api/v1/community/posts/" + post.getId() + "/comments/" + root.getId() + "/replies";
        while (cursor != null) {
            String page = mvc.perform(get(route).param("cursor", cursor).param("size", "500"))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            java.util.List<String> ids = JsonPath.read(page, "$.items[*].id");
            assertThat(ids.size()).isLessThanOrEqualTo(50);
            for (String id : ids) assertThat(seen.add(id)).isTrue();
            cursor = JsonPath.read(page, "$.nextCursor");
        }
        assertThat(seen).hasSize(2000);
        mvc.perform(head(route)).andExpect(status().isOk());
    }

    @Test
    void commentsPageTopLevelChronologicallyWithVisibleRepliesOnlyAndScopeBoundCursor() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var one = comment(post, null, CommunityContentStatus.PUBLISHED);
        var two = comment(post, null, CommunityContentStatus.PUBLISHED);
        var three = comment(post, null, CommunityContentStatus.PUBLISHED);
        var reply = comment(post, one.getId(), CommunityContentStatus.PUBLISHED);
        comment(post, one.getId(), CommunityContentStatus.HIDDEN);
        var hiddenRoot = comment(post, null, CommunityContentStatus.DELETED);
        comment(post, hiddenRoot.getId(), CommunityContentStatus.PUBLISHED);
        String body = mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments").param("size", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(one.getId().toString()))
                .andExpect(jsonPath("$.items[1].id").value(two.getId().toString()))
                .andExpect(jsonPath("$.items[0].replies.length()").value(1))
                .andExpect(jsonPath("$.items[0].replies[0].id").value(reply.getId().toString()))
                .andExpect(jsonPath("$.items[0].replies[0].replies.length()").value(0))
                .andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments").param("cursor", cursor))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(three.getId().toString()));
        var other = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        mvc.perform(get("/api/v1/community/posts/" + other.getId() + "/comments").param("cursor", cursor))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
    }

    @Test
    void bearerAndCookieReadersSeeTheirLikesButAnonymousAndInvalidBearerDoNot() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED, TIME);
        var comment = comment(post, null, CommunityContentStatus.PUBLISHED);
        reactions.saveAndFlush(CommunityReaction.create(author.getId(), CommunityTargetType.POST, post.getId(), TIME));
        reactions.saveAndFlush(CommunityReaction.create(author.getId(), CommunityTargetType.COMMENT, comment.getId(), TIME));
        String token = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(author), "accessToken");
        mvc.perform(get("/api/v1/community/posts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].likedByMe").value(true));
        mvc.perform(get("/api/v1/community/posts/" + post.getId()).with(user(UserPrincipal.from(author))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.likedByMe").value(true));
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].likedByMe").value(true));
        mvc.perform(get("/api/v1/community/posts/" + post.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.likedByMe").value(false));
        mvc.perform(get("/api/v1/community/posts/" + post.getId()).with(user(UserPrincipal.from(author)))
                        .header("Authorization", "Bearer invalid"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.likedByMe").value(false));
    }

    @Test
    void futureWritesRequireAuthenticationAndCookieCsrfWhileBearerWritesSkipCsrf() throws Exception {
        String token = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(author), "accessToken");
        mvc.perform(post("/api/v1/community/security-test/write").with(csrf()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/community/security-test/write").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/community/security-test/write").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/v1/community/security-test/write").with(user(UserPrincipal.from(author))))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
        mvc.perform(post("/api/v1/community/security-test/write").with(user(UserPrincipal.from(author))).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/community/me/posts")).andExpect(status().isUnauthorized());
    }

    private CommunityPost seedPost(CommunityContentStatus status, OffsetDateTime time) {
        return posts.saveAndFlush(CommunityPost.create(author.getId(), "body 😀", status, null, time));
    }
    private CommunityComment comment(CommunityPost post, Long parent, CommunityContentStatus status) {
        return comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), parent, null, "comment", status, TIME));
    }
    @RestController
    static class WriteProbe {
        @PostMapping("/api/v1/community/security-test/write")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void write(@AuthenticationPrincipal UserPrincipal viewer) { assertThat(viewer).isNotNull(); }
    }
}
