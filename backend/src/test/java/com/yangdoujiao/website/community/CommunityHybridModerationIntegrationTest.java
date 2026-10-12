package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.notification.NotificationRepository;

@SpringBootTest(properties = {
        "app.community.enabled=true",
        "app.community.post-per-minute=100",
        "app.community.post-per-day=300",
        "app.community.comment-per-minute=100",
        "app.community.comment-per-day=1000",
        "app.community.reject-terms=hard-reject",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class CommunityHybridModerationIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityCommentRepository comments;
    @Autowired CommunityModerationService moderation;
    @Autowired NotificationRepository notifications;
    @MockitoBean CommunityContentSafetyGateway contentSafety;

    private UserAccount owner;
    private UserAccount commenter;
    private UserAccount moderator;

    @BeforeEach
    void setUp() {
        owner = accounts.saveAndFlush(UserAccount.external("Owner", "terms", "privacy"));
        commenter = accounts.saveAndFlush(UserAccount.external("Commenter", "terms", "privacy"));
        moderator = accounts.saveAndFlush(UserAccount.external("Moderator", "terms", "privacy"));
    }

    @Test
    void wechatReviewPostIsVisibleToAuthorButNotPublic() throws Exception {
        when(contentSafety.check(owner.getId(), "candidate text"))
                .thenReturn(CommunityContentSafetyGateway.Result.REVIEW);

        String response = mvc.perform(post("/api/v1/community/posts")
                        .with(user(UserPrincipal.from(owner))).with(csrf())
                        .header("Idempotency-Key", "hybrid-review-post")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"candidate text\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andReturn().getResponse().getContentAsString();
        String postId = JsonPath.read(response, "$.id");

        mvc.perform(get("/api/v1/community/posts/" + postId))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/community/me/posts")
                        .with(user(UserPrincipal.from(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(postId))
                .andExpect(jsonPath("$.items[0].status").value("PENDING_REVIEW"));
    }

    @Test
    void unavailableCommentStaysPrivateUntilApprovalThenCountsAndNotifies() throws Exception {
        CommunityPost post = posts.saveAndFlush(CommunityPost.create(owner.getId(), "public post",
                CommunityContentStatus.PUBLISHED, null, OffsetDateTime.now()));
        when(contentSafety.check(commenter.getId(), "candidate comment"))
                .thenReturn(CommunityContentSafetyGateway.Result.UNAVAILABLE);

        String response = mvc.perform(post("/api/v1/community/posts/" + post.getId() + "/comments")
                        .with(user(UserPrincipal.from(commenter))).with(csrf())
                        .header("Idempotency-Key", "hybrid-review-comment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"candidate comment\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andReturn().getResponse().getContentAsString();
        long commentId = Long.parseLong((String) JsonPath.read(response, "$.id"));

        assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isZero();
        assertThat(notifications.countByRecipientAccountIdAndReadAtIsNull(owner.getId())).isZero();
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));

        moderation.decide(moderator.getId(), CommunityTargetType.COMMENT, commentId,
                new CommunityModerationRequest(CommunityModerationCommand.RESTORE,
                        CommunityModerationReason.REVIEW_APPROVED, 0L, null));

        assertThat(comments.findById(commentId).orElseThrow().getStatus())
                .isEqualTo(CommunityContentStatus.PUBLISHED);
        assertThat(posts.findById(post.getId()).orElseThrow().getCommentCount()).isEqualTo(1);
        assertThat(notifications.countByRecipientAccountIdAndReadAtIsNull(owner.getId())).isEqualTo(1);
        mvc.perform(get("/api/v1/community/posts/" + post.getId() + "/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(Long.toString(commentId)));
    }
}
