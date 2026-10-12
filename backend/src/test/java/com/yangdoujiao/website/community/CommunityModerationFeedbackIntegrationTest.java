package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import com.yangdoujiao.website.auth.session.UserPrincipal;

/** Real committed PostgreSQL decisions and inbox rows, without a surrounding test transaction. */
class CommunityModerationFeedbackIntegrationTest extends CommunityModerationIntegrationFixture {
    @Autowired PlatformTransactionManager manager;
    @Autowired CommunityModerationService moderation;

    @Test void approvalsRejectionsAndHidesNotifyPostAndCommentAuthorsWithGenericSystemResults() throws Exception {
        for (String type : List.of("POST", "COMMENT")) {
            for (String command : List.of("RESTORE", "REJECT", "HIDE")) {
                long parent = post(CommunityContentStatus.PUBLISHED);
                var postOwner = account();
                if (type.equals("COMMENT")) jdbc.update("UPDATE community_posts SET author_account_id=? WHERE id=?", postOwner.getId(), parent);
                long id = type.equals("POST") ? post(CommunityContentStatus.PENDING_REVIEW)
                        : comment(parent, null, CommunityContentStatus.PENDING_REVIEW);
                String table = type.equals("POST") ? "community_posts" : "community_comments";
                jdbc.update("UPDATE " + table + " SET body='private-body-openid' WHERE id=?", id);
                if (type.equals("POST")) jdbc.update("UPDATE community_posts SET title='private-title' WHERE id=?", id);
                String next = command.equals("RESTORE") ? "PUBLISHED" : command.equals("REJECT") ? "REJECTED" : "HIDDEN";
                String reason = command.equals("RESTORE") ? "REVIEW_APPROVED" : "POLICY_VIOLATION";
                action(type, id, command, reason, 0, null).andExpect(status().isOk())
                        .andExpect(jsonPath("$.status").value(next)).andExpect(jsonPath("$.actions[0].command").value(command));
                var rows = jdbc.queryForList("SELECT category,title,body,target_type,target_id FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?",
                        actor.getId(), "community:moderation:" + type + ":" + id + ":%");
                assertThat(rows).hasSize(1);
                assertThat(rows.getFirst()).containsEntry("category", "SYSTEM").containsEntry("target_type", "NONE").containsEntry("target_id", null);
                assertThat(rows.getFirst().get("title").toString()).doesNotContain("private-body", "private-title", "openid", "Fixture");
                assertThat(rows.getFirst().get("body").toString()).contains(type.equals("POST") ? "帖子" : "评论")
                        .doesNotContain("private-body", "private-title", "openid", "Fixture");
                if (type.equals("COMMENT")) assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND category='SYSTEM'", Long.class, postOwner.getId())).isZero();
                // A stale retry cannot announce the same result again or append history.
                action(type, id, command, reason, 0, null).andExpect(status().isConflict());
                assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                        actor.getId(), "community:moderation:" + type + ":" + id + ":%")).isEqualTo(1);
                assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_type=? AND target_id=?", Long.class, type, id)).isEqualTo(1);
            }
        }
    }

    @Test void rejectOnlyPendingContentWithEnforcementReasonAndResolvesReports() throws Exception {
        for (String type : List.of("POST", "COMMENT")) {
            long parent = post(CommunityContentStatus.PUBLISHED);
            for (var state : CommunityContentStatus.values()) {
                long id = type.equals("POST") ? post(state) : comment(parent, null, state);
                if (state != CommunityContentStatus.PENDING_REVIEW) {
                    action(type, id, "REJECT", "SPAM", 0, null).andExpect(status().isConflict());
                    continue;
                }
                for (String reason : List.of("REVIEW_APPROVED", "APPEAL_ACCEPTED", "REPORT_UNFOUNDED"))
                    action(type, id, "REJECT", reason, 0, null).andExpect(status().isBadRequest());
                action(type, id, "REJECT", "SPAM", 0, java.time.OffsetDateTime.now().plusHours(1).toString()).andExpect(status().isBadRequest());
                jdbc.update("INSERT INTO community_reports(reporter_account_id,target_type,target_id,status,reason_code,note) VALUES (?,?,?,'OPEN','SPAM','private-note')", actor.getId(), type, id);
                action(type, id, "REJECT", "SPAM", 0, null).andExpect(status().isOk()).andExpect(jsonPath("$.openReportCount").value(0));
                assertThat(jdbc.queryForObject("SELECT status FROM community_reports WHERE target_type=? AND target_id=?", String.class, type, id)).isEqualTo("RESOLVED_ACTIONED");
                assertThat(version(type, id)).isGreaterThan(0);
                action(type, id, "RESTORE", "REVIEW_APPROVED", version(type, id), null).andExpect(status().isConflict());
            }
        }
    }

    @Test void rejectRequiresAdviserSessionAndCsrfWithoutStateOrInboxChanges() throws Exception {
        long id = post(CommunityContentStatus.PENDING_REVIEW);
        actionAs(actor, "POST", id, "REJECT", "SPAM", 0, null).andExpect(status().isForbidden());
        String body = "{\"command\":\"REJECT\",\"reasonCode\":\"SPAM\",\"version\":0}";
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST", id) + "/actions").with(csrf()).contentType("application/json").content(body)).andExpect(status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST", id) + "/actions").with(user(UserPrincipal.from(adviser))).contentType("application/json").content(body)).andExpect(status().isForbidden());
        String bearer = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(adviser), "accessToken");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST", id) + "/actions").with(csrf()).header("Authorization", "Bearer " + bearer).contentType("application/json").content(body)).andExpect(status().isUnauthorized());
        assertThat(version("POST", id)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=?", Long.class, actor.getId())).isZero();
    }

    @Test void rollbackRemovesDecisionHistoryReportResolutionAndNotificationForEveryResult() {
        for (String type : List.of("POST", "COMMENT")) {
            for (String command : List.of("RESTORE", "REJECT", "HIDE")) {
                long parent = post(CommunityContentStatus.PUBLISHED);
                long id = type.equals("POST") ? post(CommunityContentStatus.PENDING_REVIEW) : comment(parent, null, CommunityContentStatus.PENDING_REVIEW);
                jdbc.update("INSERT INTO community_reports(reporter_account_id,target_type,target_id,status,reason_code,note) VALUES (?,?,?,'OPEN','SPAM','')", actor.getId(), type, id);
                new TransactionTemplate(manager).executeWithoutResult(tx -> {
                    moderation.decide(adviser.getId(), CommunityTargetType.valueOf(type), id,
                            new CommunityModerationRequest(CommunityModerationCommand.valueOf(command), command.equals("RESTORE") ? CommunityModerationReason.REVIEW_APPROVED : CommunityModerationReason.SPAM, 0L, null));
                    assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                            actor.getId(), "community:moderation:" + type + ":" + id + ":%")).isEqualTo(1);
                    tx.setRollbackOnly();
                });
                assertThat(version(type, id)).isZero();
                assertThat(jdbc.queryForObject("SELECT status FROM community_reports WHERE target_type=? AND target_id=?", String.class, type, id)).isEqualTo("OPEN");
                assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_type=? AND target_id=?", Long.class, type, id)).isZero();
                assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                        actor.getId(), "community:moderation:" + type + ":" + id + ":%")).isZero();
            }
        }
    }

    @Test void newHideAfterRestoreNotifiesAgainButReportRejectionAndRestrictionsDoNot() throws Exception {
        long id = post(CommunityContentStatus.PUBLISHED);
        action("POST", id, "HIDE", "SPAM", 0, null).andExpect(status().isOk());
        action("POST", id, "RESTORE", "APPEAL_ACCEPTED", version("POST", id), null).andExpect(status().isOk());
        action("POST", id, "HIDE", "SPAM", version("POST", id), null).andExpect(status().isOk());
        action("POST", id, "BAN", "SPAM", version("POST", id), null).andExpect(status().isOk());
        jdbc.update("INSERT INTO community_reports(reporter_account_id,target_type,target_id,status,reason_code,note) VALUES (?,'POST',?,'OPEN','SPAM','')", actor.getId(), id);
        action("POST", id, "REJECT_REPORT", "REPORT_UNFOUNDED", version("POST", id), null).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=?", Long.class, actor.getId())).isEqualTo(3);
    }

    @Test void automaticHidingNotifiesOnceAndRollsBackWithReportReceipt() throws Exception {
        for (String type : List.of("POST", "COMMENT")) {
            long parent = post(CommunityContentStatus.PUBLISHED);
            long id = type.equals("POST") ? parent : comment(parent, null, CommunityContentStatus.PUBLISHED);
            for (int index = 0; index < 6; index++) {
                var reporter = account();
                var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(user(UserPrincipal.from(reporter))).with(csrf())
                        .header("Idempotency-Key", "auto-" + index).contentType("application/json")
                        .content("{\"targetType\":\"" + type + "\",\"targetId\":\"" + id + "\",\"reasonCode\":\"SPAM\"}");
                if (index == 4) {
                    new TransactionTemplate(manager).executeWithoutResult(tx -> {
                        try { mvc.perform(request).andExpect(status().isCreated()); }
                        catch (Exception failure) { throw new RuntimeException(failure); }
                        assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                                actor.getId(), "community:moderation:" + type + ":" + id + ":AUTO_HIDE:%")).isEqualTo(1);
                        tx.setRollbackOnly();
                    });
                    assertThat(version(type, id)).isZero();
                    assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                            actor.getId(), "community:moderation:" + type + ":" + id + ":AUTO_HIDE:%")).isZero();
                    assertThat(jdbc.queryForObject("SELECT count(*) FROM community_idempotency_records WHERE account_id=?", Long.class, reporter.getId())).isZero();
                }
                mvc.perform(request).andExpect(status().isCreated());
                mvc.perform(request).andExpect(status().isOk());
            }
            assertThat(jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=? AND event_key LIKE ?", Long.class,
                    actor.getId(), "community:moderation:" + type + ":" + id + ":AUTO_HIDE:%")).isEqualTo(1);
        }
    }
}
