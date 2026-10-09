package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import tools.jackson.databind.ObjectMapper;

/** Requests commit independent real PostgreSQL transactions; no surrounding test transaction hides races/rollback. */
@SpringBootTest(properties = {"app.community.enabled=true", "app.community.post-per-minute=100", "app.community.post-per-day=300",
        "app.community.comment-per-minute=100", "app.community.comment-per-day=1000",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class CommunityWriteTransactionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityWriteService writes;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityCommentRepository comments;
    @Autowired CommunityHotSnapshotCache snapshots;
    @Autowired CommunityCursorCodec cursors;
    @Autowired StringRedisTemplate redis;
    @Autowired JdbcTemplate jdbc;
    @Autowired Clock clock;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;
    @MockitoSpyBean CommunityIdempotencyRecordRepository idempotency;
    final List<Long> accountIds = new ArrayList<>();

    @BeforeEach void resetCache() {
        var keys = redis.keys("community:*"); if (!keys.isEmpty()) redis.delete(keys);
    }
    @AfterEach void removeOnlyThisTestsFixtures() {
        for (Long id : accountIds) {
            jdbc.update("DELETE FROM community_idempotency_records WHERE account_id=?", id);
            jdbc.update("DELETE FROM community_comments WHERE author_account_id=?", id);
        }
        for (Long id : accountIds) {
            jdbc.update("DELETE FROM community_posts WHERE author_account_id=?", id);
        }
        for (Long id : accountIds) {
            accounts.deleteById(id);
        }
    }
    @Test void concurrentIdenticalRequestsCommitOnePostAndReturnOne201AndEleven200() throws Exception {
        var author = account(); String key = UUID.randomUUID().toString();
        var executor = Executors.newVirtualThreadPerTaskExecutor();
        try {
            CountDownLatch ready = new CountDownLatch(12), go = new CountDownLatch(1);
            List<Future<Map.Entry<Integer, String>>> pending = new ArrayList<>();
            for (int i = 0; i < 12; i++) pending.add(executor.submit(() -> {
                ready.countDown(); go.await();
                var response = mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(author))).with(csrf())
                        .header("Idempotency-Key", key).contentType("application/json").content("{\"body\":\"concurrent\"}"))
                        .andReturn().getResponse();
                return Map.entry(response.getStatus(), response.getContentAsString());
            }));
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue(); go.countDown();
            List<Map.Entry<Integer, String>> results = new ArrayList<>();
            for (var future : pending) results.add(future.get(15, TimeUnit.SECONDS));
            assertThat(results.stream().filter(result -> result.getKey() == 201)).hasSize(1);
            assertThat(results.stream().filter(result -> result.getKey() == 200)).hasSize(11);
            assertThat(results.stream().map(Map.Entry::getValue).distinct()).hasSize(1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM community_posts WHERE author_account_id=?", Integer.class, author.getId())).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM community_idempotency_records WHERE account_id=?", Integer.class, author.getId())).isEqualTo(1);
        } finally { executor.shutdownNow(); }
    }
    @Test void idempotencyPersistenceFailureRollsBackBusinessContentAndCounters() throws Exception {
        var author = account();
        var post = posts.saveAndFlush(CommunityPost.create(author.getId(), "original", CommunityContentStatus.PUBLISHED, null, OffsetDateTime.now(clock)));
        doThrow(new org.springframework.dao.DataAccessResourceFailureException("fixture idempotency outage"))
                .when(idempotency).saveAndFlush(any(CommunityIdempotencyRecord.class));
        for (String path : new String[]{"/api/v1/community/posts", "/api/v1/community/posts/" + post.getId() + "/comments"}) {
            mvc.perform(post(path).with(user(UserPrincipal.from(author))).with(csrf()).header("Idempotency-Key", UUID.randomUUID().toString())
                            .contentType("application/json").content("{\"body\":\"rollback evidence\"}"))
                    .andExpect(status().isInternalServerError()).andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_posts WHERE author_account_id=?", Integer.class, author.getId())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_comments WHERE author_account_id=?", Integer.class, author.getId())).isZero();
        assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_idempotency_records WHERE account_id=?", Integer.class, author.getId())).isZero();
    }
    @Test void differentAuthorsConcurrentCommentsMaintainExactPublishedCounter() throws Exception {
        var owner = account(); var now = OffsetDateTime.now(clock);
        var post = posts.saveAndFlush(CommunityPost.create(owner.getId(), "post", CommunityContentStatus.PUBLISHED, null, now));
        List<UserAccount> authors = new ArrayList<>();
        for (int index = 0; index < 8; index++) authors.add(account());
        var executor = Executors.newVirtualThreadPerTaskExecutor();
        try {
            CountDownLatch ready = new CountDownLatch(8), go = new CountDownLatch(1);
            List<Future<Integer>> pending = new ArrayList<>();
            for (var author : authors) pending.add(executor.submit(() -> {
                ready.countDown(); go.await();
                return mvc.perform(post("/api/v1/community/posts/" + post.getId() + "/comments")
                                .with(user(UserPrincipal.from(author))).with(csrf()).header("Idempotency-Key", "independent-comment")
                                .contentType("application/json").content("{\"body\":\"concurrent comment\"}"))
                        .andReturn().getResponse().getStatus();
            }));
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue(); go.countDown();
            for (var result : pending) assertThat(result.get(15, TimeUnit.SECONDS)).isEqualTo(201);
            assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isEqualTo(8);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM community_comments WHERE post_id=? AND status='PUBLISHED'", Integer.class, post.getId())).isEqualTo(8);
        } finally { executor.shutdownNow(); }
    }
    @Test void deletingPostInvalidatesCurrentPointerButKeepsIssuedSnapshotAndAuditEvidence() throws Exception {
        var author = account(); var now = OffsetDateTime.now(clock).minusHours(1);
        var second = posts.saveAndFlush(CommunityPost.create(author.getId(), "second", CommunityContentStatus.PUBLISHED, null, now));
        var first = posts.saveAndFlush(CommunityPost.create(author.getId(), "first", CommunityContentStatus.PUBLISHED, null, now));
        var initial = snapshots.page(null, 1); String oldVersion = cursors.decodeHot(initial.nextCursor()).snapshotVersion();
        mvc.perform(delete("/api/v1/community/posts/" + first.getId()).with(user(UserPrincipal.from(author))).with(csrf()))
                .andExpect(status().isNoContent());
        assertThat(redis.hasKey("community:hot:v1:current")).isFalse();
        assertThat(redis.hasKey("community:hot:v1:" + oldVersion + ":ids")).isTrue();
        assertThat(snapshots.page(initial.nextCursor(), 1).ids()).containsExactly(second.getId());
        var fresh = snapshots.page(null, 20);
        assertThat(fresh.ids()).containsExactly(second.getId());
        assertThat(posts.findById(first.getId()).orElseThrow().getBody()).isEqualTo("first");
        assertThat(posts.findById(first.getId()).orElseThrow().getStatus()).isEqualTo(CommunityContentStatus.DELETED);
    }
    @Test void deletionReadsCurrentCommentStatusAfterWaitingForPostLock() throws Exception {
        var author = account(); var now = OffsetDateTime.now(clock);
        var post = posts.saveAndFlush(CommunityPost.create(author.getId(), "post", CommunityContentStatus.PUBLISHED, null, now));
        var comment = comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), null, null,
                "audit evidence", CommunityContentStatus.PUBLISHED, now));
        jdbc.update("UPDATE community_posts SET comment_count=1 WHERE id=?", post.getId());
        var executor = Executors.newVirtualThreadPerTaskExecutor();
        try {
            var transaction = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
            var future = transaction.execute(state -> {
                jdbc.queryForObject("SELECT id FROM community_posts WHERE id=? FOR UPDATE", Long.class, post.getId());
                var pending = executor.submit(() -> mvc.perform(delete("/api/v1/community/comments/" + comment.getId())
                                .with(user(UserPrincipal.from(author))).with(csrf())).andReturn().getResponse());
                long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
                boolean waiting = false;
                while (!waiting && System.nanoTime() < deadline) {
                    jdbc.execute("SELECT pg_stat_clear_snapshot()");
                    waiting = Boolean.TRUE.equals(jdbc.queryForObject("""
                            SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname=current_database()
                              AND pid <> pg_backend_pid() AND wait_event_type='Lock' AND query LIKE '%community_posts%')
                            """, Boolean.class));
                    if (!waiting) try { Thread.sleep(10); }
                    catch (InterruptedException failure) { throw new IllegalStateException(failure); }
                }
                assertThat(waiting).as("author request reached the real post row lock").isTrue();
                // A moderation transaction removes public visibility while the author waits on its post lock.
                jdbc.update("UPDATE community_comments SET status='HIDDEN',version=version+1 WHERE id=?", comment.getId());
                jdbc.update("UPDATE community_posts SET comment_count=0,version=version+1 WHERE id=?", post.getId());
                return pending;
            });
            var response = future.get(10, TimeUnit.SECONDS);
            assertThat(response.getStatus()).isEqualTo(204);
            assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isZero();
            assertThat(comments.findById(comment.getId()).orElseThrow().getStatus()).isEqualTo(CommunityContentStatus.DELETED);
        } finally { executor.shutdownNow(); }
    }
    private UserAccount account() {
        var account = accounts.saveAndFlush(UserAccount.external("Test fixture", "terms", "privacy"));
        accountIds.add(account.getId()); return account;
    }
}
