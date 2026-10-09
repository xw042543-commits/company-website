package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.auth.miniapp.MiniappTokenService;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {"app.community.enabled=true", "app.community.post-per-minute=100",
        "app.community.post-per-day=300", "app.community.comment-per-minute=100", "app.community.comment-per-day=1000",
        "app.community.review-terms=fixture-review", "app.community.reject-terms=fixture-reject",
        "app.miniapp.auth.enabled=true", "app.miniapp.auth.local-provider-enabled=true",
        "app.miniapp.auth.local-test-code=write-fixture", "app.miniapp.auth.local-test-subject=write-fixture-subject",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class CommunityWriteHttpIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityCommentRepository comments;
    @Autowired CommunityUserRestrictionRepository restrictions;
    @Autowired CommunityIdempotencyRecordRepository idempotency;
    @Autowired MiniappTokenService tokens;
    @Autowired CommunityRateLimiter limiter;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @MockitoSpyBean StringRedisTemplate redis;
    UserAccount author;

    @BeforeEach void setup() {
        var keys = redis.keys("community:limit:v1:*");
        if (!keys.isEmpty()) redis.delete(keys);
        author = accounts.saveAndFlush(UserAccount.external("Private name", "terms", "privacy"));
    }

    @Test void repeatReturnsExactOriginalPersistedResultAfterDeletionAndRedisFailure() throws Exception {
        String key = UUID.randomUUID().toString();
        String original = write("/api/v1/community/posts", key, Map.of("body", "  内容\r\n😀  "))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.body").value("  内容\n😀  "))
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(original, "$.id");
        mvc.perform(delete("/api/v1/community/posts/" + id).with(user(UserPrincipal.from(author))).with(csrf()))
                .andExpect(status().isNoContent());
        failRedis();
        write("/api/v1/community/posts", key, Map.of("body", "  内容\n😀  "))
                .andExpect(status().isOk()).andExpect(content().json(original));
        assertThat(posts.count()).isEqualTo(1);
        assertThat(idempotency.count()).isEqualTo(1);
        assertThat(posts.findById(Long.valueOf(id)).orElseThrow().getStatus()).isEqualTo(CommunityContentStatus.DELETED);
    }

    @Test void changedBodyOnSameKeyConflictsWithoutCreatingAnotherRow() throws Exception {
        write("/api/v1/community/posts", "same-key", Map.of("body", "first")).andExpect(status().isCreated());
        write("/api/v1/community/posts", "same-key", Map.of("body", "first "))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"));
        assertThat(posts.count()).isEqualTo(1);
    }

    @Test void unicodeLimitsCountCodePointsAndNormalizeOnlyLineEndings() throws Exception {
        write("/api/v1/community/posts", "emoji-boundary", Map.of("body", "😀".repeat(2000)))
                .andExpect(status().isCreated());
        write("/api/v1/community/posts", "emoji-too-long", Map.of("body", "😀".repeat(2001)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_BODY"));
        write("/api/v1/community/posts", "line-boundary", Map.of("body", "a".repeat(1999) + "\r\n"))
                .andExpect(status().isCreated());
        for (String text : new String[]{"", " \t\r\n", "\u00a0\u2007\u202f", "\u0000"}) {
            write("/api/v1/community/posts", UUID.randomUUID().toString(), Map.of("body", text))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(author))).with(csrf())
                        .header("Idempotency-Key", "invalid-surrogate").contentType("application/json")
                        .content("{\"body\":\"\\ud800\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test void missingAndInvalidKeysAreStableValidationErrors() throws Exception {
        write("/api/v1/community/posts", null, Map.of("body", "body"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_IDEMPOTENCY_KEY"));
        for (String key : new String[]{" ", "x".repeat(65), "has space"}) {
            write("/api/v1/community/posts", key, Map.of("body", "body")).andExpect(status().isBadRequest());
        }
        assertThat(posts.count()).isZero();
    }

    @Test void unavailableRedisFailsClosedWithoutBusinessOrSuccessRows() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        failRedis();
        write("/api/v1/community/posts", "outage-post", Map.of("body", "body"))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("COMMUNITY_WRITE_UNAVAILABLE"));
        write("/api/v1/community/posts/" + post.getId() + "/comments", "outage-comment", Map.of("body", "body"))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("COMMUNITY_WRITE_UNAVAILABLE"));
        assertThat(posts.count()).isEqualTo(1);
        assertThat(comments.count()).isZero();
        assertThat(idempotency.count()).isZero();
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> limiter.checkReport(author.getId(), "192.0.2.19"))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        failure -> assertThat(failure.getCode()).isEqualTo("COMMUNITY_WRITE_UNAVAILABLE"));
        mvc.perform(get("/api/v1/community/posts")).andExpect(status().isOk());
    }

    @Test void riskReviewIsPrivateAndRejectStoresNoContentOrSuccess() throws Exception {
        String response = write("/api/v1/community/posts", "review", Map.of("body", "fixture-review"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andReturn().getResponse().getContentAsString();
        mvc.perform(get("/api/v1/community/posts/" + JsonPath.read(response, "$.id"))).andExpect(status().isNotFound());
        write("/api/v1/community/posts", "reject", Map.of("body", "fixture-reject"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMUNITY_CONTENT_REJECTED"));
        assertThat(posts.count()).isEqualTo(1);
        assertThat(idempotency.count()).isEqualTo(1);
    }

    @Test void activeMuteAndBanRejectAndExpiredReleasedFutureRestrictionsAllow() throws Exception {
        var now = OffsetDateTime.now();
        for (var kind : CommunityRestrictionType.values()) {
            var restriction = restrictions.saveAndFlush(CommunityUserRestriction.create(author.getId(), kind,
                    "POLICY", now.minusMinutes(1), null, author.getId()));
            write("/api/v1/community/posts", UUID.randomUUID().toString(), Map.of("body", "body"))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMUNITY_USER_RESTRICTED"));
            restriction.release(author.getId(), now); restrictions.saveAndFlush(restriction);
        }
        restrictions.saveAndFlush(CommunityUserRestriction.create(author.getId(), CommunityRestrictionType.MUTED,
                "POLICY", now.minusHours(2), now.minusHours(1), author.getId()));
        restrictions.saveAndFlush(CommunityUserRestriction.create(author.getId(), CommunityRestrictionType.BANNED,
                "POLICY", now.plusHours(1), null, author.getId()));
        write("/api/v1/community/posts", "allowed", Map.of("body", "body")).andExpect(status().isCreated());
    }

    @Test void onlyOwnerDeletesAndEvidenceIsRetained() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        var comment = comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), null, null,
                "evidence", CommunityContentStatus.PUBLISHED, OffsetDateTime.now()));
        post.adjustCommentCount(1, OffsetDateTime.now()); posts.saveAndFlush(post);
        var other = accounts.saveAndFlush(UserAccount.external("Other", "terms", "privacy"));
        for (String path : new String[]{"/api/v1/community/posts/" + post.getId(), "/api/v1/community/comments/" + comment.getId()}) {
            mvc.perform(delete(path).with(user(UserPrincipal.from(other))).with(csrf()))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMUNITY_NOT_OWNER"));
        }
        mvc.perform(delete("/api/v1/community/comments/" + comment.getId()).with(user(UserPrincipal.from(author))).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/community/comments/" + comment.getId()).with(user(UserPrincipal.from(author))).with(csrf()))
                .andExpect(status().isNoContent());
        assertThat(comment.getStatus()).isEqualTo(CommunityContentStatus.DELETED);
        assertThat(comment.getBody()).isEqualTo("evidence");
        assertThat(post.getCommentCount()).isZero();
    }

    @Test void commentRepliesRequireDecimalStringPublishedRootOnSamePublishedPost() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        String path = "/api/v1/community/posts/" + post.getId() + "/comments";
        String rootBody = write(path, "root", Map.of("body", "😀".repeat(1000))).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String rootId = JsonPath.read(rootBody, "$.id");
        String replyBody = write(path, "reply", Map.of("body", "reply", "parentCommentId", rootId))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.parentCommentId").value(rootId))
                .andReturn().getResponse().getContentAsString();
        write(path, "reply", Map.of("body", "reply", "parentCommentId", rootId))
                .andExpect(status().isOk()).andExpect(content().json(replyBody));
        write(path, "numeric-parent", Map.of("body", "reply", "parentCommentId", Long.valueOf(rootId)))
                .andExpect(status().isBadRequest());
        write(path, "nested", Map.of("body", "reply", "parentCommentId", JsonPath.read(replyBody, "$.id")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_PARENT"));
        var otherPost = seedPost(CommunityContentStatus.PUBLISHED);
        write("/api/v1/community/posts/" + otherPost.getId() + "/comments", "cross", Map.of("body", "reply", "parentCommentId", rootId))
                .andExpect(status().isBadRequest());
        write(path, "too-long", Map.of("body", "😀".repeat(1001))).andExpect(status().isBadRequest());
        assertThat(post.getCommentCount()).isEqualTo(2);
    }

    @Test void deletingPublishedRootRemovesVisibleReplyCountWithoutChangingOtherAuthorsEvidence() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        var root = comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), null, null,
                "root evidence", CommunityContentStatus.PUBLISHED, OffsetDateTime.now()));
        var other = accounts.saveAndFlush(UserAccount.external("Other", "terms", "privacy"));
        var reply = comments.saveAndFlush(CommunityComment.create(post.getId(), other.getId(), root.getId(), author.getId(),
                "reply evidence", CommunityContentStatus.PUBLISHED, OffsetDateTime.now()));
        comments.saveAndFlush(CommunityComment.create(post.getId(), other.getId(), root.getId(), author.getId(),
                "pending reply evidence", CommunityContentStatus.PENDING_REVIEW, OffsetDateTime.now()));
        post.adjustCommentCount(2, OffsetDateTime.now()); posts.saveAndFlush(post);
        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(delete("/api/v1/community/comments/" + root.getId()).with(user(UserPrincipal.from(author))).with(csrf()))
                    .andExpect(status().isNoContent());
            assertThat(post.getCommentCount()).isZero();
        }
        assertThat(reply.getStatus()).isEqualTo(CommunityContentStatus.PUBLISHED);
        assertThat(reply.getBody()).isEqualTo("reply evidence");
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
        mvc.perform(delete("/api/v1/community/comments/" + reply.getId()).with(user(UserPrincipal.from(other))).with(csrf()))
                .andExpect(status().isNoContent());
        assertThat(post.getCommentCount()).isZero();
    }

    @Test void hiddenPostAndNonpublishedParentCannotReceiveNewComments() throws Exception {
        var hidden = seedPost(CommunityContentStatus.HIDDEN);
        write("/api/v1/community/posts/" + hidden.getId() + "/comments", "hidden", Map.of("body", "comment"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMUNITY_TARGET_UNAVAILABLE"));
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        var parent = comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), null, null,
                "hidden", CommunityContentStatus.HIDDEN, OffsetDateTime.now()));
        write("/api/v1/community/posts/" + post.getId() + "/comments", "parent", Map.of("body", "reply", "parentCommentId", parent.getId().toString()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_PARENT"));
    }

    @Test void postAndParentIdsBeyondJavascriptPrecisionRemainExactDecimalStringsOnWrites() throws Exception {
        long postId = 9007199254740993L, parentId = 9007199254740995L;
        jdbc.update("INSERT INTO community_posts(id,author_account_id,body,status,published_at,comment_count) VALUES (?,?,'post','PUBLISHED',now(),1)", postId, author.getId());
        jdbc.update("INSERT INTO community_comments(id,post_id,author_account_id,body,status) VALUES (?,?,?,'root','PUBLISHED')", parentId, postId, author.getId());
        write("/api/v1/community/posts/9007199254740993/comments", "exact-parent", Map.of("body", "reply", "parentCommentId", "9007199254740995"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isString())
                .andExpect(jsonPath("$.postId").value("9007199254740993"))
                .andExpect(jsonPath("$.parentCommentId").value("9007199254740995"));
        assertThat(posts.findById(postId).orElseThrow().getCommentCount()).isEqualTo(2);
    }

    @Test void commentRiskReviewDoesNotIncrementPublicCountAndRejectStoresNothing() throws Exception {
        var post = seedPost(CommunityContentStatus.PUBLISHED);
        String path = "/api/v1/community/posts/" + post.getId() + "/comments";
        write(path, "review-comment", Map.of("body", "fixture-review"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PENDING_REVIEW"));
        write(path, "reject-comment", Map.of("body", "fixture-reject"))
                .andExpect(status().isBadRequest());
        assertThat(comments.count()).isEqualTo(1);
        assertThat(post.getCommentCount()).isZero();
        mvc.perform(get(path)).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test void writesRequirePrincipalAndCookieCsrfAndAcceptRealBearer() throws Exception {
        mvc.perform(post("/api/v1/community/posts").with(csrf()).contentType("application/json").content("{\"body\":\"body\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(author))).contentType("application/json")
                        .header("Idempotency-Key", "cookie").content("{\"body\":\"body\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
        String token = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(author), "accessToken");
        mvc.perform(post("/api/v1/community/posts").header("Authorization", "Bearer " + token)
                        .header("Idempotency-Key", "bearer").contentType("application/json").content("{\"body\":\"body\"}"))
                .andExpect(status().isCreated());
    }

    @Test void invalidBearerNeverFallsBackToCookieAuthentication() throws Exception {
        mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(author)))
                        .header("Authorization", "Bearer invalid")
                        .contentType("application/json").content("{\"body\":\"body\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/community/posts").with(user(UserPrincipal.from(author)))
                        .header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/miniapp/universities/1/programmes/1")
                        .header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/context/api/v1/community/posts").contextPath("/context")
                        .header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        assertThat(posts.count()).isZero();
    }

    private ResultActions write(String path, String key, Map<String, ?> body) throws Exception {
        var request = post(path).with(user(UserPrincipal.from(author))).with(csrf()).contentType("application/json")
                .content(json.writeValueAsString(body));
        if (key != null) request.header("Idempotency-Key", key);
        return mvc.perform(request);
    }
    private CommunityPost seedPost(CommunityContentStatus status) {
        return posts.saveAndFlush(CommunityPost.create(author.getId(), "post", status, null, OffsetDateTime.now()));
    }
    @SuppressWarnings("unchecked") private void failRedis() {
        doThrow(new org.springframework.data.redis.RedisConnectionFailureException("fixture outage"))
                .when(redis).execute(any(RedisScript.class), anyList(), any(Object[].class));
    }
}
