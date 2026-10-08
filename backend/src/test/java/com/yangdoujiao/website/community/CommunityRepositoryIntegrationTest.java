package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.TestContainersConfiguration;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class CommunityRepositoryIntegrationTest {

    private static final OffsetDateTime CREATED = OffsetDateTime.parse("2026-10-08T00:00:00Z");
    private static final OffsetDateTime UPDATED = OffsetDateTime.parse("2026-10-08T01:00:00Z");

    @Autowired private JdbcTemplate jdbc;
    @Autowired private EntityManager entities;
    @Autowired private PlatformTransactionManager transactionManager;
    private TransactionTemplate transactions;
    @Autowired private CommunityPostRepository posts;
    @Autowired private CommunityCommentRepository comments;
    @Autowired private CommunityReactionRepository reactions;
    @Autowired private CommunityReportRepository reports;
    @Autowired private CommunityModerationActionRepository actions;
    @Autowired private CommunityUserRestrictionRepository restrictions;
    @Autowired private CommunityIdempotencyRecordRepository idempotency;

    @BeforeEach
    void setUpTransactions() {
        transactions = new TransactionTemplate(transactionManager);
    }

    @AfterEach
    void deleteFixtures() {
        for (String tableAndOwner : java.util.List.of(
                "community_idempotency_records:account_id", "community_user_restrictions:account_id",
                "community_moderation_actions:actor_account_id", "community_reports:reporter_account_id",
                "community_reactions:account_id", "community_comments:author_account_id",
                "community_posts:author_account_id")) {
            String[] parts = tableAndOwner.split(":");
            jdbc.update("DELETE FROM " + parts[0] + " WHERE " + parts[1]
                    + " IN (SELECT id FROM user_accounts WHERE full_name = 'Community Repository Test')");
        }
        jdbc.update("DELETE FROM user_accounts WHERE full_name = 'Community Repository Test'");
    }

    @Test
    void persistsAllCommunityRecordsWithLongAccountIdsEnumsAndTimestamps() {
        Long user = insertActiveUser();
        transactions.executeWithoutResult(ignored -> {
            CommunityPost post = posts.saveAndFlush(CommunityPost.create(user, "post 😀",
                    CommunityContentStatus.PUBLISHED, null, CREATED));
            CommunityComment parent = comments.saveAndFlush(CommunityComment.create(post.getId(), user,
                    null, null, "parent", CommunityContentStatus.PUBLISHED, CREATED));
            CommunityComment reply = comments.saveAndFlush(CommunityComment.create(post.getId(), user,
                    parent.getId(), user, "reply", CommunityContentStatus.PENDING_REVIEW, CREATED));
            CommunityReaction reaction = reactions.saveAndFlush(CommunityReaction.create(user,
                    CommunityTargetType.COMMENT, reply.getId(), CREATED));
            CommunityReport report = reports.saveAndFlush(CommunityReport.create(user,
                    CommunityTargetType.POST, post.getId(), "SPAM", "note", CREATED));
            CommunityModerationAction action = actions.saveAndFlush(CommunityModerationAction.create(user,
                    "POST", post.getId(), "HIDE", "SPAM", CommunityContentStatus.PUBLISHED,
                    CommunityContentStatus.HIDDEN, CREATED));
            CommunityUserRestriction restriction = restrictions.saveAndFlush(CommunityUserRestriction.create(user,
                    CommunityRestrictionType.MUTED, "SPAM", CREATED, UPDATED, user));
            CommunityIdempotencyRecord record = idempotency.saveAndFlush(CommunityIdempotencyRecord.create(user,
                    "POST_CREATE", "key", "a".repeat(64), post.getId(), CREATED));
            entities.clear();

            CommunityPost storedPost = posts.findById(post.getId()).orElseThrow();
            assertThat(storedPost.getAuthorAccountId()).isEqualTo(user);
            assertThat(storedPost.getBody()).isEqualTo("post 😀");
            assertThat(storedPost.getStatus()).isEqualTo(CommunityContentStatus.PUBLISHED);
            assertThat(storedPost.getPublishedAt()).isEqualTo(CREATED);
            assertThat(storedPost.getCreatedAt()).isEqualTo(CREATED);
            assertThat(storedPost.getUpdatedAt()).isEqualTo(CREATED);
            assertThat(storedPost.getVersion()).isZero();
            assertThat(storedPost.getCommentCount()).isZero();
            assertThat(storedPost.getLikeCount()).isZero();
            CommunityComment storedReply = comments.findById(reply.getId()).orElseThrow();
            assertThat(storedReply.getParentCommentId()).isEqualTo(parent.getId());
            assertThat(storedReply.getReplyToAccountId()).isEqualTo(user);
            assertThat(storedReply.getStatus()).isEqualTo(CommunityContentStatus.PENDING_REVIEW);
            assertThat(storedReply.getCreatedAt()).isEqualTo(CREATED);
            assertThat(storedReply.getVersion()).isZero();
            assertThat(reactions.findById(reaction.getId()).orElseThrow().getTargetType())
                    .isEqualTo(CommunityTargetType.COMMENT);
            assertThat(reports.findById(report.getId()).orElseThrow().getStatus())
                    .isEqualTo(CommunityReportStatus.OPEN);
            CommunityModerationAction storedAction = actions.findById(action.getId()).orElseThrow();
            assertThat(storedAction.getPreviousStatus()).isEqualTo(CommunityContentStatus.PUBLISHED);
            assertThat(storedAction.getNextStatus()).isEqualTo(CommunityContentStatus.HIDDEN);
            assertThat(storedAction.getCreatedAt()).isEqualTo(CREATED);
            assertThat(restrictions.findById(restriction.getId()).orElseThrow().getRestrictionType())
                    .isEqualTo(CommunityRestrictionType.MUTED);
            assertThat(idempotency.findById(record.getId()).orElseThrow().getResultTargetId())
                    .isEqualTo(post.getId());
        });
    }

    @Test
    void appliesContentTransitionsAndCountersWithoutChangingCreationOrFirstPublicationTime() {
        Long user = insertActiveUser();
        transactions.executeWithoutResult(ignored -> {
            CommunityPost post = posts.saveAndFlush(CommunityPost.create(user, "pending",
                    CommunityContentStatus.PENDING_REVIEW, "RISK", CREATED));
            CommunityComment comment = comments.saveAndFlush(CommunityComment.create(post.getId(), user,
                    null, null, "comment", CommunityContentStatus.PENDING_REVIEW, CREATED));
            assertThat(post.getPublishedAt()).isNull();
            post.changeStatus(CommunityContentStatus.PUBLISHED, UPDATED);
            post.adjustCommentCount(1, UPDATED);
            post.adjustLikeCount(1, UPDATED);
            comment.changeStatus(CommunityContentStatus.PUBLISHED, UPDATED);
            comment.adjustLikeCount(1, UPDATED);
            entities.flush();
            entities.clear();
            CommunityPost stored = posts.findById(post.getId()).orElseThrow();
            assertThat(stored.getCreatedAt()).isEqualTo(CREATED);
            assertThat(stored.getUpdatedAt()).isEqualTo(UPDATED);
            assertThat(stored.getPublishedAt()).isEqualTo(UPDATED);
            assertThat(stored.getRiskReasonCode()).isEqualTo("RISK");
            assertThat(stored.getCommentCount()).isEqualTo(1);
            assertThat(stored.getLikeCount()).isEqualTo(1);
            assertThat(stored.getVersion()).isEqualTo(1);
            CommunityComment storedComment = comments.findById(comment.getId()).orElseThrow();
            assertThat(storedComment.getStatus()).isEqualTo(CommunityContentStatus.PUBLISHED);
            assertThat(storedComment.getLikeCount()).isEqualTo(1);
            assertThat(storedComment.getUpdatedAt()).isEqualTo(UPDATED);
            assertThat(storedComment.getVersion()).isEqualTo(1);
            stored.changeStatus(CommunityContentStatus.HIDDEN, UPDATED.plusHours(1));
            stored.changeStatus(CommunityContentStatus.PUBLISHED, UPDATED.plusHours(2));
            stored.adjustLikeCount(-1, UPDATED.plusHours(2));
            stored.adjustCommentCount(-1, UPDATED.plusHours(2));
            storedComment.adjustLikeCount(-1, UPDATED.plusHours(2));
            entities.flush();
            entities.clear();
            assertThat(posts.findById(post.getId()).orElseThrow().getPublishedAt()).isEqualTo(UPDATED);
            assertThat(posts.findById(post.getId()).orElseThrow().getLikeCount()).isZero();
            assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isZero();
            assertThat(comments.findById(comment.getId()).orElseThrow().getLikeCount()).isZero();
        });
    }

    @Test
    void recordsReportResolutionAndRestrictionRelease() {
        Long user = insertActiveUser();
        transactions.executeWithoutResult(ignored -> {
            CommunityReport report = reports.saveAndFlush(CommunityReport.create(user,
                    CommunityTargetType.POST, 1L, "SPAM", null, CREATED));
            CommunityUserRestriction restriction = restrictions.saveAndFlush(CommunityUserRestriction.create(user,
                    CommunityRestrictionType.BANNED, "SPAM", CREATED, null, user));
            report.resolve(CommunityReportStatus.RESOLVED_ACTIONED, user, "HIDDEN", UPDATED);
            restriction.release(user, UPDATED);
            entities.flush();
            entities.clear();
            CommunityReport stored = reports.findById(report.getId()).orElseThrow();
            assertThat(stored.getStatus()).isEqualTo(CommunityReportStatus.RESOLVED_ACTIONED);
            assertThat(stored.getHandledByAccountId()).isEqualTo(user);
            assertThat(stored.getHandledAt()).isEqualTo(UPDATED);
            assertThat(stored.getResolutionReasonCode()).isEqualTo("HIDDEN");
            assertThat(stored.getCreatedAt()).isEqualTo(CREATED);
            CommunityUserRestriction released = restrictions.findById(restriction.getId()).orElseThrow();
            assertThat(released.getReleasedByAccountId()).isEqualTo(user);
            assertThat(released.getReleasedAt()).isEqualTo(UPDATED);
            assertThat(released.getStartsAt()).isEqualTo(CREATED);
            assertThat(released.getEndsAt()).isNull();
        });
    }

    @Test
    void preventsStalePostAndCommentVersionsFromOverwritingModeration() {
        Long user = insertActiveUser();
        CommunityPost post = posts.saveAndFlush(CommunityPost.create(user, "post",
                CommunityContentStatus.PUBLISHED, null, CREATED));
        CommunityComment comment = comments.saveAndFlush(CommunityComment.create(post.getId(), user,
                null, null, "comment", CommunityContentStatus.PUBLISHED, CREATED));
        CommunityPost stalePost = posts.findById(post.getId()).orElseThrow();
        CommunityPost freshPost = posts.findById(post.getId()).orElseThrow();
        freshPost.changeStatus(CommunityContentStatus.HIDDEN, UPDATED);
        posts.saveAndFlush(freshPost);
        stalePost.changeStatus(CommunityContentStatus.DELETED, UPDATED);
        assertThatThrownBy(() -> posts.saveAndFlush(stalePost))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
        assertThat(posts.findById(post.getId()).orElseThrow().getStatus()).isEqualTo(CommunityContentStatus.HIDDEN);

        CommunityComment staleComment = comments.findById(comment.getId()).orElseThrow();
        CommunityComment freshComment = comments.findById(comment.getId()).orElseThrow();
        freshComment.changeStatus(CommunityContentStatus.HIDDEN, UPDATED);
        comments.saveAndFlush(freshComment);
        staleComment.changeStatus(CommunityContentStatus.DELETED, UPDATED);
        assertThatThrownBy(() -> comments.saveAndFlush(staleComment))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
        assertThat(comments.findById(comment.getId()).orElseThrow().getStatus()).isEqualTo(CommunityContentStatus.HIDDEN);
    }

    private Long insertActiveUser() {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts(full_name,password_hash,status,agreement_version,privacy_version)
                VALUES ('Community Repository Test',NULL,'ACTIVE','terms-v1','privacy-v1') RETURNING id
                """, Long.class);
    }
}
