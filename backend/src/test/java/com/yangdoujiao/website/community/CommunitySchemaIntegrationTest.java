package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class CommunitySchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        for (String tableAndOwner : List.of(
                "community_idempotency_records:account_id", "community_user_restrictions:account_id",
                "community_moderation_actions:actor_account_id", "community_reports:reporter_account_id",
                "community_reactions:account_id", "community_comments:author_account_id",
                "community_posts:author_account_id")) {
            String[] parts = tableAndOwner.split(":");
            if (jdbc.queryForObject("SELECT to_regclass(?) IS NOT NULL", Boolean.class, parts[0])) {
                jdbc.update("DELETE FROM " + parts[0] + " WHERE " + parts[1]
                        + " IN (SELECT id FROM user_accounts WHERE full_name = 'Community Schema Test')");
            }
        }
        jdbc.update("DELETE FROM user_accounts WHERE full_name = 'Community Schema Test'");
    }

    @Test
    void enforcesCommunityOwnershipUniquenessAndStatusChecks() {
        long user = insertActiveUser();
        long post = insertPost(user, "hello", "PUBLISHED");
        jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", user, post);
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", user, post))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_posts SET status='UNKNOWN' WHERE id=?", post))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertPost(Long.MAX_VALUE, "hello", "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'USER',?)", user, post))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void countsUnicodeCodePointsAndRejectsPostAndCommentBodiesOutsideTheirBounds() {
        long user = insertActiveUser();
        long post = insertPost(user, "😀".repeat(2000), "PUBLISHED");
        insertComment(user, post, null, "😀".repeat(1000), "PUBLISHED");
        for (String body : List.of("", "a".repeat(2001))) {
            assertThatThrownBy(() -> insertPost(user, body, "PUBLISHED"))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
        for (String body : List.of("", "a".repeat(1001))) {
            assertThatThrownBy(() -> insertComment(user, post, null, body, "PUBLISHED"))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Test
    void rejectsNegativeCountersAndUnknownCommentStatus() {
        long user = insertActiveUser();
        long post = insertPost(user, "hello", "PUBLISHED");
        long comment = insertComment(user, post, null, "reply", "PUBLISHED");
        assertThatThrownBy(() -> jdbc.update("UPDATE community_posts SET comment_count=-1 WHERE id=?", post))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_posts SET like_count=-1 WHERE id=?", post))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_comments SET like_count=-1 WHERE id=?", comment))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertComment(user, post, null, "reply", "UNKNOWN"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void preventsCrossPostRepliesOnInsertAndWhenMovingEitherComment() {
        long user = insertActiveUser();
        long firstPost = insertPost(user, "first", "PUBLISHED");
        long secondPost = insertPost(user, "second", "PUBLISHED");
        long parent = insertComment(user, firstPost, null, "parent", "PUBLISHED");
        long reply = insertComment(user, firstPost, parent, "reply", "PUBLISHED");
        assertThatThrownBy(() -> insertComment(user, secondPost, parent, "cross-post", "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_comments SET post_id=? WHERE id=?", secondPost, reply))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_comments SET post_id=? WHERE id=?", secondPost, parent))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void requiresExistingPostAuthorsParentsAndReplyAccounts() {
        long user = insertActiveUser();
        long post = insertPost(user, "hello", "PUBLISHED");
        assertThatThrownBy(() -> insertComment(user, Long.MAX_VALUE, null, "reply", "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertComment(Long.MAX_VALUE, post, null, "reply", "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertComment(user, post, Long.MAX_VALUE, "reply", "PUBLISHED"))
                .isInstanceOf(DataIntegrityViolationException.class);
        long comment = insertComment(user, post, null, "reply", "PUBLISHED");
        assertThatThrownBy(() -> jdbc.update("UPDATE community_comments SET reply_to_account_id=? WHERE id=?",
                Long.MAX_VALUE, comment)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void permitsOneOpenReportPerReporterTargetAndNewReportsAfterResolution() {
        long user = insertActiveUser();
        long other = insertActiveUser();
        long post = insertPost(user, "hello", "PUBLISHED");
        long report = insertReport(user, post, "OPEN", "😀".repeat(500));
        assertThatThrownBy(() -> insertReport(user, post, "OPEN", null))
                .isInstanceOf(DataIntegrityViolationException.class);
        insertReport(other, post, "OPEN", null);
        jdbc.update("UPDATE community_reports SET status='RESOLVED_REJECTED' WHERE id=?", report);
        insertReport(user, post, "OPEN", null);
        assertThatThrownBy(() -> insertReport(user, post, "UNKNOWN", null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertReport(user, post, "RESOLVED_ACTIONED", "a".repeat(501)))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_reports SET target_type='USER' WHERE id=?", report))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_reports SET handled_by_account_id=? WHERE id=?",
                Long.MAX_VALUE, report)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void scopesIdempotencyByAccountAndOperationAndRequiresExistingAccounts() {
        long user = insertActiveUser();
        long other = insertActiveUser();
        insertIdempotency(user, "POST_CREATE");
        assertThatThrownBy(() -> insertIdempotency(user, "POST_CREATE"))
                .isInstanceOf(DataIntegrityViolationException.class);
        insertIdempotency(user, "COMMENT_CREATE");
        insertIdempotency(other, "POST_CREATE");
        assertThatThrownBy(() -> insertIdempotency(Long.MAX_VALUE, "POST_CREATE"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void requiresAuditActorsReasonsAndValidRestrictionOwnershipAndTypes() {
        long user = insertActiveUser();
        jdbc.update("""
                INSERT INTO community_moderation_actions(actor_account_id,target_type,target_id,action,reason_code)
                VALUES (?,'POST',1,'HIDE','RULE')
                """, user);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO community_moderation_actions(actor_account_id,target_type,target_id,action,reason_code)
                VALUES (?,'POST',1,'HIDE','RULE')
                """, Long.MAX_VALUE)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO community_moderation_actions(actor_account_id,target_type,target_id,action,reason_code)
                VALUES (?,'POST',1,'HIDE',NULL)
                """, user)).isInstanceOf(DataIntegrityViolationException.class);
        for (String type : List.of("MUTED", "BANNED")) {
            jdbc.update("""
                    INSERT INTO community_user_restrictions(account_id,restriction_type,reason_code,starts_at,created_by_account_id)
                    VALUES (?,?,'RULE',NOW(),?)
                    """, user, type, user);
        }
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO community_user_restrictions(account_id,restriction_type,reason_code,starts_at,created_by_account_id)
                VALUES (?,'UNKNOWN','RULE',NOW(),?)
                """, user, user)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO community_user_restrictions(account_id,restriction_type,reason_code,starts_at,created_by_account_id)
                VALUES (?,'MUTED','RULE',NOW(),?)
                """, user, Long.MAX_VALUE)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE community_user_restrictions SET released_by_account_id=? WHERE account_id=?",
                Long.MAX_VALUE, user)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void createsStableCursorIndexesAndBigintAccountColumns() {
        List<String> indexes = jdbc.queryForList("""
                SELECT indexdef FROM pg_indexes WHERE tablename IN ('community_posts','community_comments')
                """, String.class);
        assertThat(indexes).anyMatch(index -> index.contains("(status, published_at DESC, id DESC)"))
                .anyMatch(index -> index.contains("(author_account_id, created_at DESC, id DESC)"))
                .anyMatch(index -> index.contains("(post_id, status, created_at, id)"))
                .anyMatch(index -> index.contains("(parent_comment_id, status, created_at, id)"));
        List<String> accountTypes = jdbc.queryForList("""
                SELECT data_type FROM information_schema.columns
                WHERE table_name LIKE 'community_%' AND column_name LIKE '%account_id'
                """, String.class);
        assertThat(accountTypes).hasSize(11).containsOnly("bigint");
    }

    private long insertActiveUser() {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts(full_name,password_hash,status,agreement_version,privacy_version)
                VALUES ('Community Schema Test',NULL,'ACTIVE','terms-v1','privacy-v1') RETURNING id
                """, Long.class);
    }

    private long insertPost(long user, String body, String status) {
        return jdbc.queryForObject("""
                INSERT INTO community_posts(author_account_id,body,status,published_at)
                VALUES (?,?,?,NOW()) RETURNING id
                """, Long.class, user, body, status);
    }

    private long insertComment(long user, long post, Long parent, String body, String status) {
        return jdbc.queryForObject("""
                INSERT INTO community_comments(author_account_id,post_id,parent_comment_id,body,status)
                VALUES (?,?,?,?,?) RETURNING id
                """, Long.class, user, post, parent, body, status);
    }

    private long insertReport(long user, long post, String status, String note) {
        return jdbc.queryForObject("""
                INSERT INTO community_reports(reporter_account_id,target_type,target_id,reason_code,note,status)
                VALUES (?,'POST',?,'SPAM',?,?) RETURNING id
                """, Long.class, user, post, note, status);
    }

    private void insertIdempotency(long user, String operation) {
        jdbc.update("""
                INSERT INTO community_idempotency_records(account_id,operation_type,idempotency_key,request_hash,result_target_id)
                VALUES (?,?,'same-key',?,1)
                """, user, operation, "a".repeat(64));
    }
}
