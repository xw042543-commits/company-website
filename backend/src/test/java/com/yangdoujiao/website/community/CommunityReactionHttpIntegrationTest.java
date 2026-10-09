package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.auth.miniapp.MiniappTokenService;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest(properties = {"app.community.enabled=true", "app.miniapp.auth.enabled=true",
        "app.miniapp.auth.local-provider-enabled=true", "app.miniapp.auth.local-test-code=reaction-fixture",
        "app.miniapp.auth.local-test-subject=reaction-fixture-subject",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
abstract class CommunityReactionIntegrationFixture {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityCommentRepository comments;
    @Autowired MiniappTokenService tokens;
    @Autowired org.springframework.data.redis.core.StringRedisTemplate redis;
    final List<Long> accountIds = new ArrayList<>();
    UserAccount actor;

    @BeforeEach void setup() { actor = account(); }
    @AfterEach void cleanup() {
        for (Long id : accountIds) jdbc.update("DELETE FROM community_reactions WHERE account_id=?", id);
        for (Long id : accountIds) jdbc.update("DELETE FROM community_user_restrictions WHERE account_id=?", id);
        for (Long id : accountIds) jdbc.update("DELETE FROM miniapp_auth_tokens WHERE user_account_id=?", id);
        for (Long id : accountIds) jdbc.update("DELETE FROM community_comments WHERE author_account_id=? AND parent_comment_id IS NOT NULL", id);
        for (Long id : accountIds) jdbc.update("DELETE FROM community_comments WHERE author_account_id=?", id);
        for (Long id : accountIds) jdbc.update("DELETE FROM community_posts WHERE author_account_id=?", id);
        for (Long id : accountIds) accounts.deleteById(id);
        var keys = redis.keys("community:hot:*"); if (!keys.isEmpty()) redis.delete(keys);
    }

    org.springframework.test.web.servlet.ResultActions react(MockHttpServletRequestBuilder request, UserAccount account) throws Exception {
        return mvc.perform(request.with(user(UserPrincipal.from(account))).with(csrf()));
    }
    UserAccount account() { var user = accounts.saveAndFlush(UserAccount.external("Fixture", "terms", "privacy")); accountIds.add(user.getId()); return user; }
    long post(CommunityContentStatus status) { return posts.saveAndFlush(CommunityPost.create(actor.getId(), "post", status, null, OffsetDateTime.now())).getId(); }
    long comment(long postId, Long root, CommunityContentStatus status) { return comments.saveAndFlush(CommunityComment.create(postId, actor.getId(), root, root == null ? null : actor.getId(), "comment", status, OffsetDateTime.now())).getId(); }
    String postPath(long id) { return "/api/v1/community/posts/" + id + "/like"; }
    String commentPath(long id) { return "/api/v1/community/comments/" + id + "/like"; }
    long count(String type, long id) { return jdbc.queryForObject("SELECT count(*) FROM community_reactions WHERE target_type=? AND target_id=?", Long.class, type, id); }
    void assertCounts(String type, long id, long expected) {
        assertThat(count(type, id)).isEqualTo(expected);
        assertThat(jdbc.queryForObject("SELECT like_count FROM " + (type.equals("POST") ? "community_posts" : "community_comments") + " WHERE id=?", Integer.class, id)).isEqualTo((int) expected);
    }
}

class CommunityReactionHttpIntegrationTest extends CommunityReactionIntegrationFixture {

    @Test void repeatedLikesAndUnlikesAffectOnlyTheAuthenticatedUsersRelation() throws Exception {
        long id = post(CommunityContentStatus.PUBLISHED); var other = account();
        for (int i = 0; i < 2; i++) react(put(postPath(id)), actor).andExpect(status().isNoContent()).andExpect(content().string(""));
        react(put(postPath(id)), other).andExpect(status().isNoContent());
        assertCounts("POST", id, 2);
        for (int i = 0; i < 3; i++) react(delete(postPath(id)), actor).andExpect(status().isNoContent());
        assertCounts("POST", id, 1);
        mvc.perform(get("/api/v1/community/posts/" + id).with(user(UserPrincipal.from(actor))))
                .andExpect(jsonPath("$.likedByMe").value(false)).andExpect(jsonPath("$.likeCount").value(1));
        mvc.perform(get("/api/v1/community/posts/" + id).with(user(UserPrincipal.from(other))))
                .andExpect(jsonPath("$.likedByMe").value(true));
    }

    @Test void publishedCommentsAndRepliesHaveIndependentLikes() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        long root = comment(post, null, CommunityContentStatus.PUBLISHED);
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        for (long id : new long[]{root, reply}) {
            react(put(commentPath(id)), actor).andExpect(status().isNoContent());
            react(put(commentPath(id)), actor).andExpect(status().isNoContent());
            assertCounts("COMMENT", id, 1);
        }
        mvc.perform(get("/api/v1/community/posts/" + post + "/comments").with(user(UserPrincipal.from(actor))))
                .andExpect(jsonPath("$.items[0].likedByMe").value(true))
                .andExpect(jsonPath("$.items[0].replies[0].likedByMe").value(true));
        react(delete(commentPath(reply)), actor).andExpect(status().isNoContent()); assertCounts("COMMENT", reply, 0);
    }

    @Test void rejectsBothMutationsForNonpublicPostsCommentsAndOrphanHiddenReplies() throws Exception {
        long visiblePost = post(CommunityContentStatus.PUBLISHED);
        for (var state : CommunityContentStatus.values()) {
            if (state == CommunityContentStatus.PUBLISHED) continue;
            long hiddenPost = post(state);
            long hiddenComment = comment(visiblePost, null, state);
            long child = comment(visiblePost, hiddenComment, CommunityContentStatus.PUBLISHED);
            long onHiddenPost = comment(hiddenPost, null, CommunityContentStatus.PUBLISHED);
            for (String path : new String[]{postPath(hiddenPost), commentPath(hiddenComment), commentPath(child), commentPath(onHiddenPost)}) {
                react(put(path), actor).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMUNITY_TARGET_UNAVAILABLE"));
                react(delete(path), actor).andExpect(status().isConflict());
            }
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reactions WHERE account_id=?", Long.class, actor.getId())).isZero();
    }

    @Test void missingTargetsAndNoncanonicalDecimalIdsReturnStableErrors() throws Exception {
        for (String resource : new String[]{"posts", "comments"}) {
            react(put("/api/v1/community/" + resource + "/9223372036854775807/like"), actor).andExpect(status().isNotFound());
            for (String id : new String[]{"0", "-1", "01", "+1", "1.0", "9223372036854775808"}) {
                react(put("/api/v1/community/" + resource + "/" + id + "/like"), actor)
                        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_ID"));
            }
        }
    }

    @Test void largePostAndCommentIdsRemainDecimalStringsAndReachExactTargets() throws Exception {
        long post = 9007199254740993L, root = 9007199254740995L;
        jdbc.update("INSERT INTO community_posts(id,author_account_id,body,status,published_at) VALUES (?,?,'large','PUBLISHED',now())", post, actor.getId());
        jdbc.update("INSERT INTO community_comments(id,post_id,author_account_id,body,status) VALUES (?,?,?,'large','PUBLISHED')", root, post, actor.getId());
        react(put(postPath(post)), actor).andExpect(status().isNoContent());
        react(put(commentPath(root)), actor).andExpect(status().isNoContent());
        assertCounts("POST", post, 1); assertCounts("COMMENT", root, 1);
        mvc.perform(get("/api/v1/community/posts/" + post)).andExpect(jsonPath("$.id").value("9007199254740993"));
        mvc.perform(get("/api/v1/community/posts/" + post + "/comments"))
                .andExpect(jsonPath("$.items[0].id").value("9007199254740995"));
    }

    @Test void cookieWritesRequireCsrfBearerWritesAuthenticateAndAnonymousWritesAreRejected() throws Exception {
        long id = post(CommunityContentStatus.PUBLISHED);
        mvc.perform(put(postPath(id)).with(user(UserPrincipal.from(actor)))).andExpect(status().isForbidden());
        mvc.perform(delete(postPath(id)).with(user(UserPrincipal.from(actor)))).andExpect(status().isForbidden());
        mvc.perform(put(postPath(id)).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(delete(postPath(id)).with(csrf())).andExpect(status().isUnauthorized());
        String bearer = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(actor), "accessToken");
        mvc.perform(put(postPath(id)).header("Authorization", "Bearer " + bearer)).andExpect(status().isNoContent());
        mvc.perform(delete(postPath(id)).header("Authorization", "Bearer " + bearer)).andExpect(status().isNoContent());
        mvc.perform(put(postPath(id)).header("Authorization", "Bearer invalid")).andExpect(status().isUnauthorized());
        assertCounts("POST", id, 0);
    }

    @Test void concurrentDuplicatesRepeatedDeletesAndMixedMutationsKeepExactCounts() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        long root = comment(post, null, CommunityContentStatus.PUBLISHED);
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        for (String type : new String[]{"POST", "COMMENT"}) {
            long id = type.equals("POST") ? post : reply; String path = type.equals("POST") ? postPath(id) : commentPath(id);
            concurrent(path, 12, false, false); assertCounts(type, id, 1);
            concurrent(path, 12, true, false); assertCounts(type, id, 0);
            concurrent(path, 24, false, true);
            long relations = count(type, id);
            assertThat(relations).isBetween(0L, 1L); assertCounts(type, id, relations);
            react(delete(path), actor).andExpect(status().isNoContent()); assertCounts(type, id, 0);
        }
    }

    @Test void restrictedActiveUsersCanUnlikeButCannotAddLikesAndInactiveUsersCannotMutate() throws Exception {
        long id = post(CommunityContentStatus.PUBLISHED);
        for (var restriction : CommunityRestrictionType.values()) {
            react(put(postPath(id)), actor).andExpect(status().isNoContent());
            var now = OffsetDateTime.now();
            var row = jdbc.queryForObject("INSERT INTO community_user_restrictions(account_id,restriction_type,reason_code,starts_at,created_by_account_id) VALUES (?,?,'POLICY',?,?) RETURNING id",
                    Long.class, actor.getId(), restriction.name(), now.minusMinutes(1), actor.getId());
            react(put(postPath(id)), actor).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMUNITY_USER_RESTRICTED"));
            react(delete(postPath(id)), actor).andExpect(status().isNoContent()); assertCounts("POST", id, 0);
            jdbc.update("UPDATE community_user_restrictions SET ends_at=? WHERE id=?", now.minusSeconds(1), row);
        }
        react(put(postPath(id)), actor).andExpect(status().isNoContent());
        jdbc.update("UPDATE user_accounts SET status='DELETED',deleted_at=now() WHERE id=?", actor.getId());
        react(put(postPath(id)), actor).andExpect(status().isForbidden());
        react(delete(postPath(id)), actor).andExpect(status().isForbidden()); assertCounts("POST", id, 1);
    }

    @Test void independentActorsSerializeOnTheSameTargetAndKeepTheirOwnRelations() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        long root = comment(post, null, CommunityContentStatus.PUBLISHED);
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        List<UserAccount> actors = new ArrayList<>(); for (int i = 0; i < 8; i++) actors.add(account());
        for (String type : new String[]{"POST", "COMMENT"}) {
            long id = type.equals("POST") ? post : reply; String path = type.equals("POST") ? postPath(id) : commentPath(id);
            try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
                var go = new CountDownLatch(1); List<Future<Integer>> pending = new ArrayList<>();
                for (var user : actors) pending.add(pool.submit(() -> { go.await(); return react(put(path), user).andReturn().getResponse().getStatus(); }));
                go.countDown(); for (var result : pending) assertThat(result.get(15, TimeUnit.SECONDS)).isEqualTo(204);
            }
            assertCounts(type, id, 8);
            for (var user : actors) { react(delete(path), user).andExpect(status().isNoContent()); react(delete(path), user).andExpect(status().isNoContent()); }
            assertCounts(type, id, 0);
        }
    }

    @Test void likesUpdateLiveCountersWithoutReplacingIssuedHotRanking() throws Exception {
        long first = post(CommunityContentStatus.PUBLISHED), second = post(CommunityContentStatus.PUBLISHED);
        var keys = redis.keys("community:hot:*"); if (!keys.isEmpty()) redis.delete(keys);
        String initial = mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat((String) JsonPath.read(initial, "$.items[0].id")).isEqualTo(Long.toString(second));
        String cursor = JsonPath.read(initial, "$.nextCursor");
        String version = redis.opsForValue().get("community:hot:v1:current");
        react(put(postPath(first)), actor).andExpect(status().isNoContent());
        assertThat(redis.opsForValue().get("community:hot:v1:current")).isEqualTo(version);
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot").param("size", "1").param("cursor", cursor))
                .andExpect(jsonPath("$.items[0].id").value(Long.toString(first))).andExpect(jsonPath("$.items[0].likeCount").value(1));
    }

    private void concurrent(String path, int n, boolean deletes, boolean mixed) throws Exception {
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            var ready = new CountDownLatch(n); var go = new CountDownLatch(1); List<Future<Integer>> pending = new ArrayList<>();
            for (int i = 0; i < n; i++) { boolean remove = deletes || (mixed && i % 2 == 0);
                pending.add(pool.submit(() -> { ready.countDown(); go.await(); return react(remove ? delete(path) : put(path), actor)
                        .andReturn().getResponse().getStatus(); })); }
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue(); go.countDown();
            for (var result : pending) assertThat(result.get(15, TimeUnit.SECONDS)).isEqualTo(204);
        }
    }
}
