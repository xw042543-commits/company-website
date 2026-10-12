package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/** Committed PostgreSQL state proves reconciliation and rollback; no test transaction masks either. */
class CommunityCounterPersistenceIntegrationTest extends CommunityReactionIntegrationFixture {
    @Autowired CommunityReactionService reactions;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;

    @Test void rebuildsExactTypedReactionsAndVisibleCommentCountFromPostgres() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        long root = 9007199254741001L;
        jdbc.update("INSERT INTO community_comments(id,post_id,author_account_id,body,status) VALUES (?,?,?,'root','PUBLISHED')", root, post, actor.getId());
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        long hidden = comment(post, null, CommunityContentStatus.HIDDEN);
        comment(post, hidden, CommunityContentStatus.PUBLISHED);
        comment(post, root, CommunityContentStatus.PENDING_REVIEW);
        var other = account();
        jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?),(?,'POST',?),(?,'COMMENT',?),(?,'COMMENT',?),(?,'POST',?)",
                actor.getId(), post, other.getId(), post, actor.getId(), root, actor.getId(), reply, actor.getId(), root);
        jdbc.update("UPDATE community_posts SET like_count=99,comment_count=99 WHERE id=?", post);
        jdbc.update("UPDATE community_comments SET like_count=99 WHERE post_id=?", post);
        reactions.reconcilePost(post); reactions.reconcileComment(root); reactions.reconcileComment(reply);
        assertCounts("POST", post, 2); assertCounts("COMMENT", root, 1); assertCounts("COMMENT", reply, 1);
        assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?", Integer.class, post)).isEqualTo(2);
    }

    @Test void hiddenAndDeletedTargetsRetainTheirOwnLikesWithoutBecomingPublic() throws Exception {
        for (var state : new CommunityContentStatus[]{CommunityContentStatus.HIDDEN, CommunityContentStatus.DELETED}) {
            long post = post(state), root = comment(post, null, state), reply = comment(post, root, CommunityContentStatus.PUBLISHED);
            for (long id : new long[]{root, reply}) jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'COMMENT',?)", actor.getId(), id);
            jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", actor.getId(), post);
            jdbc.update("UPDATE community_posts SET like_count=55,comment_count=55 WHERE id=?", post);
            jdbc.update("UPDATE community_comments SET like_count=55 WHERE post_id=?", post);
            reactions.reconcilePost(post); reactions.reconcileComment(root); reactions.reconcileComment(reply);
            assertCounts("POST", post, 1); assertCounts("COMMENT", root, 1); assertCounts("COMMENT", reply, 1);
            assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?", Integer.class, post)).isZero();
            assertThat(posts.findById(post).orElseThrow().getStatus()).isEqualTo(state);
            assertThat(comments.findById(root).orElseThrow().getStatus()).isEqualTo(state);
            mvc.perform(get("/api/v1/community/posts/" + post)).andExpect(status().isNotFound());
            react(put(commentPath(reply)), actor).andExpect(status().isConflict());
        }
    }

    @Test void reconciliationOfPublishedPostExcludesDeletedRootsRepliesButKeepsReplyReactionEvidence() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED), root = comment(post, null, CommunityContentStatus.DELETED);
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'COMMENT',?)", actor.getId(), reply);
        jdbc.update("UPDATE community_posts SET comment_count=20 WHERE id=?", post);
        reactions.reconcilePost(post); reactions.reconcileComment(reply);
        assertCounts("COMMENT", reply, 1);
        assertThat(posts.findById(post).orElseThrow().getCommentCount()).isZero();
        mvc.perform(get("/api/v1/community/posts/" + post + "/comments")).andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test void databaseCounterFailureRollsBackInsertedAndDeletedReactionRows() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        // Prove this route is healthy before injecting the failure, so a missing endpoint cannot satisfy 500.
        react(put(postPath(post)), actor).andExpect(status().isNoContent());
        react(delete(postPath(post)), actor).andExpect(status().isNoContent());
        assertCounts("POST", post, 0);
        jdbc.execute("""
                CREATE FUNCTION reaction_test_counter_failure() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN IF NEW.id = %s THEN RAISE EXCEPTION 'fixture counter failure'; END IF; RETURN NEW; END $$
                """.formatted(post));
        jdbc.execute("CREATE TRIGGER reaction_test_counter_failure BEFORE UPDATE OF like_count ON community_posts FOR EACH ROW EXECUTE FUNCTION reaction_test_counter_failure()");
        try {
            react(put(postPath(post)), actor).andExpect(status().isInternalServerError()); assertCounts("POST", post, 0);
            jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", actor.getId(), post);
            // Disable only this fixture's trigger while initializing the second rollback case.
            jdbc.execute("ALTER TABLE community_posts DISABLE TRIGGER reaction_test_counter_failure");
            jdbc.update("UPDATE community_posts SET like_count=1 WHERE id=?", post);
            jdbc.execute("ALTER TABLE community_posts ENABLE TRIGGER reaction_test_counter_failure");
            react(delete(postPath(post)), actor).andExpect(status().isInternalServerError()); assertCounts("POST", post, 1);
        } finally {
            jdbc.execute("DROP TRIGGER reaction_test_counter_failure ON community_posts");
            jdbc.execute("DROP FUNCTION reaction_test_counter_failure()");
        }
    }

    @Test void waitingLikeReadsFreshRootStatusAfterItsPostLockIsReleased() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED), root = comment(post, null, CommunityContentStatus.PUBLISHED);
        long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            var transaction = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
            var pending = transaction.execute(state -> {
                jdbc.queryForObject("SELECT id FROM community_posts WHERE id=? FOR UPDATE", Long.class, post);
                var future = pool.submit(() -> react(put(commentPath(reply)), actor).andReturn().getResponse().getStatus());
                awaitPostLockWait();
                jdbc.update("UPDATE community_comments SET status='DELETED',version=version+1 WHERE id=?", root);
                return future;
            });
            assertThat(pending.get(10, TimeUnit.SECONDS)).isEqualTo(409);
        }
        assertCounts("COMMENT", reply, 0);
    }

    @Test void concurrentReconciliationAndIndependentLikesShareThePostLock() throws Exception {
        long post = post(CommunityContentStatus.PUBLISHED);
        jdbc.update("UPDATE community_posts SET like_count=99,comment_count=99 WHERE id=?", post);
        List<com.yangdoujiao.website.auth.account.UserAccount> users = new ArrayList<>();
        for (int i = 0; i < 8; i++) users.add(account());
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            var transaction = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
            var pending = transaction.execute(state -> {
                jdbc.queryForObject("SELECT id FROM community_posts WHERE id=? FOR UPDATE", Long.class, post);
                List<Future<Integer>> futures = new ArrayList<>();
                futures.add(pool.submit(() -> { reactions.reconcilePost(post); return 204; }));
                for (var user : users) futures.add(pool.submit(() -> react(put(postPath(post)), user).andReturn().getResponse().getStatus()));
                awaitPostLockWait(); return futures;
            });
            for (var result : pending) assertThat(result.get(15, TimeUnit.SECONDS)).isEqualTo(204);
        }
        assertCounts("POST", post, 8);
        assertThat(posts.findById(post).orElseThrow().getCommentCount()).isZero();
    }

    @Test void ownerCanDeleteCommentsAfterReconciliationZerosANonpublicPostsVisibleCount() throws Exception {
        for (var state : new CommunityContentStatus[]{CommunityContentStatus.HIDDEN, CommunityContentStatus.DELETED}) {
            long post = post(state), root = comment(post, null, CommunityContentStatus.PUBLISHED);
            long reply = comment(post, root, CommunityContentStatus.PUBLISHED);
            jdbc.update("UPDATE community_posts SET comment_count=2 WHERE id=?", post);
            reactions.reconcilePost(post);
            react(delete("/api/v1/community/comments/" + root), actor).andExpect(status().isNoContent());
            react(delete("/api/v1/community/comments/" + reply), actor).andExpect(status().isNoContent());
            assertThat(posts.findById(post).orElseThrow().getCommentCount()).isZero();
        }
    }

    private void awaitPostLockWait() {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline) {
            jdbc.execute("SELECT pg_stat_clear_snapshot()");
            if (Boolean.TRUE.equals(jdbc.queryForObject("""
                    SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname=current_database()
                      AND pid <> pg_backend_pid() AND wait_event_type='Lock' AND query LIKE '%community_posts%')
                    """, Boolean.class))) return;
            try { Thread.sleep(10); } catch (InterruptedException failure) { Thread.currentThread().interrupt(); throw new IllegalStateException(failure); }
        }
        throw new AssertionError("reaction request reached actual PostgreSQL post row-lock wait");
    }

}
