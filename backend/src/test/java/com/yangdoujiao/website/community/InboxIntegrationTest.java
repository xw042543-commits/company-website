package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.yangdoujiao.website.auth.account.UserAccount;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import com.yangdoujiao.website.notification.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.junit.jupiter.api.AfterEach;
import java.util.Map;
import tools.jackson.databind.ObjectMapper;

@TestPropertySource(properties={"app.community.review-terms=inbox-review", "app.community.reject-terms=inbox-reject"})
class InboxIntegrationTest extends CommunityReactionIntegrationFixture {
    @Autowired NotificationService inbox;
    String path = "/api/v1/miniapp/me/messages";
    @Autowired CommunityWriteService writes;
    @Autowired CommunityModerationService moderation;
    @Autowired ObjectMapper json;

    // Isolate rate-limit counters from other tests sharing the Redis container.
    private String fixtureAddress() { return "2001:db8::" + Long.toHexString(actor.getId()); }

    @AfterEach void inboxCleanup() {
        for(Long id:accountIds) jdbc.update("DELETE FROM community_idempotency_records WHERE account_id=?",id);
        for(Long id:accountIds) jdbc.update("DELETE FROM community_moderation_actions WHERE actor_account_id=?",id);
        // Remove all fixture replies first, across authors, before their parent roots.
        for(Long id:accountIds) jdbc.update("DELETE FROM community_comments WHERE author_account_id=? AND parent_comment_id IS NOT NULL",id);
    }

    @Test void recipientScopeReadStateValidationAndAuthentication() throws Exception {
        var other = account();
        inbox.publishSystem(actor.getId(), "system:test:" + actor.getId(), "通知", "正文");
        inbox.publishApplication(other.getId(), "application:test:" + other.getId(), "申请", "进度");
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
        mvc.perform(get(path + "/unread-count")).andExpect(status().isUnauthorized());
        mvc.perform(put(path + "/1/read")).andExpect(status().isUnauthorized());
        mvc.perform(get(path).with(bearer(actor)))
            .andExpect(jsonPath("$.totalItems").value(1)).andExpect(jsonPath("$.unreadCount").value(1))
            .andExpect(jsonPath("$.items[0].targetType").value("NONE"));
        String id = jdbc.queryForObject("SELECT id::text FROM inbox_notifications WHERE recipient_account_id=?", String.class, actor.getId());
        mvc.perform(put(path + "/" + id + "/read").with(bearer(other)))
            .andExpect(status().isNotFound());
        for (int i = 0; i < 2; i++) mvc.perform(put(path + "/" + id + "/read").with(bearer(actor)))
            .andExpect(status().isNoContent());
        mvc.perform(get(path + "/unread-count").with(bearer(actor)))
            .andExpect(jsonPath("$.unreadCount").value(0));
        for (String category : new String[]{"invalid", "community", ""}) mvc.perform(get(path).param("category", category)
            .with(bearer(actor))).andExpect(status().isBadRequest());
        for (String[] query : new String[][]{{"page", "0"}, {"size", "49"}, {"size", "0"}})
            mvc.perform(get(path).param(query[0], query[1]).with(bearer(actor)))
                .andExpect(status().isBadRequest());
    }

    @Test void publicationIsDeduplicatedAndOrderedAcrossCategories() throws Exception {
        String event = "test:" + actor.getId();
        inbox.publishSystem(actor.getId(), event, "第一次", "原文");
        inbox.publishSystem(actor.getId(), event, "重试", "不可覆盖");
        inbox.publishApplication(actor.getId(), event + ":application", "最新", "申请进度");
        mvc.perform(get(path).param("size", "1").with(bearer(actor)))
            .andExpect(jsonPath("$.totalItems").value(2)).andExpect(jsonPath("$.totalPages").value(2))
            .andExpect(jsonPath("$.items[0].title").value("最新"));
        mvc.perform(get(path).param("category", "SYSTEM").with(bearer(actor)))
            .andExpect(jsonPath("$.items[0].title").value("第一次"));
    }

    @Test void publishedLikesSuppressSelfAndRelikesNeverSpam() {
        long id = post(CommunityContentStatus.PUBLISHED); var other = account();
        reactions().like(actor.getId(), CommunityTargetType.POST, id);
        assertThat(inbox.unreadCount(actor.getId())).isZero();
        reactions().like(other.getId(), CommunityTargetType.POST, id);
        reactions().unlike(other.getId(), CommunityTargetType.POST, id);
        reactions().like(other.getId(), CommunityTargetType.POST, id);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        reactions().like(other.getId(),CommunityTargetType.COMMENT,
            comment(id,null,CommunityContentStatus.PUBLISHED));
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(2);
        long pending=comment(id,null,CommunityContentStatus.PENDING_REVIEW);
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> reactions().like(other.getId(),CommunityTargetType.COMMENT,pending))
            .isInstanceOf(com.yangdoujiao.website.common.exception.ApiException.class);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(2);
    }

    @Test void commentsRouteToDirectRecipientWithoutExcerptsAndIdempotentReplay() {
        long postId=post(CommunityContentStatus.PUBLISHED);var other=account();var third=account();
        var request=json.readValue(json.writeValueAsString(Map.of("body","PRIVATE unique text")),CommunityCommentRequest.class);
        var root=writes.createComment(other.getId(),postId,fixtureAddress(),"root",request);
        writes.createComment(other.getId(),postId,fixtureAddress(),"root",request);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        var reply=json.readValue(json.writeValueAsString(Map.of("body","reply","parentCommentId",root.response().id())),CommunityCommentRequest.class);
        writes.createComment(third.getId(),postId,fixtureAddress(),"reply",reply);
        assertThat(inbox.unreadCount(other.getId())).isEqualTo(1);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        writes.createComment(actor.getId(),postId,fixtureAddress(),"self",request);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        assertThat(inbox.list(actor.getId(),"ALL",1,20).items().getFirst().body()).doesNotContain("PRIVATE");
    }

    @Test void pendingContentProducesNothingUntilApprovalAndRestoreDoesNotDuplicate() {
        long postId=post(CommunityContentStatus.PUBLISHED);var other=account();
        var request=json.readValue("{\"body\":\"inbox-review private text\"}",CommunityCommentRequest.class);
        var created=writes.createComment(other.getId(),postId,fixtureAddress(),"review",request);
        assertThat(inbox.unreadCount(actor.getId())).isZero();
        long commentId=Long.parseLong(created.response().id());
        moderation.decide(actor.getId(),CommunityTargetType.COMMENT,commentId,new CommunityModerationRequest(
            CommunityModerationCommand.RESTORE,CommunityModerationReason.REVIEW_APPROVED,0L,null));
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        assertThat(inbox.list(actor.getId(),"ALL",1,20).items().getFirst().body()).doesNotContain("private text");
        long version=comments.findById(commentId).orElseThrow().getVersion();
        moderation.decide(actor.getId(),CommunityTargetType.COMMENT,commentId,new CommunityModerationRequest(
            CommunityModerationCommand.HIDE,CommunityModerationReason.POLICY_VIOLATION,version,null));
        version=comments.findById(commentId).orElseThrow().getVersion();
        moderation.decide(actor.getId(),CommunityTargetType.COMMENT,commentId,new CommunityModerationRequest(
            CommunityModerationCommand.RESTORE,CommunityModerationReason.APPEAL_ACCEPTED,version,null));
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
        var rejected=json.readValue("{\"body\":\"inbox-reject\"}",CommunityCommentRequest.class);
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> writes.createComment(other.getId(),postId,
            fixtureAddress(),"reject",rejected)).isInstanceOf(com.yangdoujiao.website.common.exception.ApiException.class);
        assertThat(inbox.unreadCount(actor.getId())).isEqualTo(1);
    }

    @Test void bigintIdsRemainExactStringsAndInvalidIdsAreRejected() throws Exception {
        long large=9007199254740993L;
        jdbc.update("INSERT INTO inbox_notifications(id,recipient_account_id,event_key,category,title,body,target_type,target_id,created_at) VALUES (?,?,'bigint','COMMUNITY','标题','正文','COMMUNITY_POST',?,now())",large,actor.getId(),large);
        mvc.perform(get(path).with(bearer(actor)))
            .andExpect(jsonPath("$.items[0].id").value("9007199254740993"))
            .andExpect(jsonPath("$.items[0].targetId").value("9007199254740993"));
        mvc.perform(put(path+"/9007199254740993/read").with(bearer(actor)))
            .andExpect(status().isNoContent());
        for(String id:new String[]{"0","01","+1","-1","9223372036854775808"})
            mvc.perform(put(path+"/"+id+"/read").with(bearer(actor)))
                .andExpect(status().isBadRequest());
        mvc.perform(put(path+"/9223372036854775807/read").with(bearer(actor)))
            .andExpect(status().isNotFound());
    }
    private RequestPostProcessor bearer(UserAccount account) {
        String token = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(account), "accessToken");
        return request -> { request.addHeader("Authorization", "Bearer " + token); return request; };
    }
    @Autowired CommunityReactionService reactionService;
    private CommunityReactionService reactions() { return reactionService; }
}
