package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.OffsetDateTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.auth.miniapp.MiniappTokenService;

@SpringBootTest(properties = {"app.miniapp.auth.enabled=true",
        "app.miniapp.auth.local-provider-enabled=true", "app.miniapp.auth.local-test-code=personal-test",
        "app.miniapp.auth.local-test-subject=personal-test-subject",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class CommunityPersonalHttpIntegrationTest {
    private static final OffsetDateTime TIME = OffsetDateTime.parse("2026-10-08T00:00:00Z");
    @Autowired MockMvc mvc;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityCommentRepository comments;
    @Autowired UserAccountRepository accounts;
    @Autowired MiniappTokenService tokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired tools.jackson.databind.ObjectMapper json;
    @Autowired CommunityCursorCodec cursors;
    UserAccount author, other;
    @BeforeEach void setup() {
        author = accounts.saveAndFlush(UserAccount.external("private-name", "terms", "privacy"));
        other = accounts.saveAndFlush(UserAccount.external("other-private", "terms", "privacy"));
    }
    @Test void authenticatesBothRoutesAndAcceptsSharedBearerIdentity() throws Exception {
        for (String path : new String[]{"posts", "comments"}) {
            mvc.perform(get("/api/v1/community/me/" + path)).andExpect(status().isUnauthorized());
            String token = org.springframework.test.util.ReflectionTestUtils.invokeMethod(tokens.issue(author), "accessToken");
            mvc.perform(get("/api/v1/community/me/" + path).header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
        }
    }
    @Test void showsOnlyAuthorPostsAllRetainedStatusesWithExactSafeDtoAndLargeIds() throws Exception {
        posts.saveAndFlush(CommunityPost.create(other.getId(), "other body", CommunityContentStatus.PUBLISHED, null, TIME.plusDays(1)));
        for (var state : CommunityContentStatus.values()) posts.saveAndFlush(CommunityPost.create(author.getId(), "own body", state, "INTERNAL_SECRET", TIME));
        jdbc.update("INSERT INTO community_posts(id,author_account_id,body,status,published_at,created_at) VALUES (?,?,?,?,?,?)",
                9007199254740993L, author.getId(), "exact", "PUBLISHED", TIME, TIME);
        String body = mine("posts", null, "50").andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(6))
                .andExpect(jsonPath("$.items[0].id").value("9007199254740993"))
                .andReturn().getResponse().getContentAsString();
        var items = json.readTree(body).path("items");
        for (var item : items) {
            assertThat(item.propertyNames()).containsExactlyInAnyOrderElementsOf(Set.of("id", "body", "status", "statusMessage", "createdAt", "publishedAt", "commentCount", "likeCount"));
            assertThat(item.path("statusMessage").asString()).isNotBlank();
        }
        assertThat(body).doesNotContain("INTERNAL_SECRET", "private-name", "authorAccountId", "openid", "handledBy", "riskReason");
    }
    @Test void personalCommentsRemainVisibleUnderHiddenDeletedAndNonpublicRoots() throws Exception {
        for (var state : CommunityContentStatus.values()) {
            var post = posts.saveAndFlush(CommunityPost.create(other.getId(), "post", state, null, TIME));
            var root = comments.saveAndFlush(CommunityComment.create(post.getId(), other.getId(), null, null, "other root", CommunityContentStatus.HIDDEN, TIME));
            comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), root.getId(), other.getId(), "own reply", state, TIME));
        }
        String body = mine("comments", null, "50").andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(5))
                .andReturn().getResponse().getContentAsString();
        for (var item : json.readTree(body).path("items")) {
            assertThat(item.propertyNames()).containsExactlyInAnyOrderElementsOf(Set.of("id", "postId", "parentCommentId", "body", "status", "statusMessage", "createdAt", "likeCount"));
            assertThat(item.path("postId").isString()).isTrue();
            assertThat(item.path("parentCommentId").isString()).isTrue();
        }
        assertThat(body).doesNotContain("other root", "replyToAccountId", "authorAccountId");
    }
    @Test void personalKeysetOrderAndScopesSurviveBoundaryDeletionAndRejectTampering() throws Exception {
        var first = posts.saveAndFlush(CommunityPost.create(author.getId(), "1", CommunityContentStatus.PUBLISHED, null, TIME));
        var boundary = posts.saveAndFlush(CommunityPost.create(author.getId(), "2", CommunityContentStatus.PUBLISHED, null, TIME));
        var newest = posts.saveAndFlush(CommunityPost.create(author.getId(), "3", CommunityContentStatus.PUBLISHED, null, TIME.plusSeconds(1)));
        String body = mine("posts", null, "2").andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(newest.getId().toString()))
                .andExpect(jsonPath("$.items[1].id").value(boundary.getId().toString())).andReturn().getResponse().getContentAsString();
        String cursor = JsonPath.read(body, "$.nextCursor");
        var payload=json.readTree(java.util.Base64.getUrlDecoder().decode(cursor.split("\\.")[0]));
        assertThat(payload.path("sort").asString()).matches("me:posts:[A-Za-z0-9_-]{43}");
        posts.delete(boundary); posts.flush();
        mine("posts", cursor, "2").andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(first.getId().toString()))
                .andExpect(jsonPath("$.nextCursor").isEmpty());
        for (String bad : new String[]{cursor + "x", "a".repeat(4097), "", cursors.encode(TIME, 1, "latest")})
            mine("posts", bad, "2").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_COMMUNITY_CURSOR"));
        mine("comments", cursor, "2").andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/community/me/posts").with(user(UserPrincipal.from(other))).param("cursor", cursor)).andExpect(status().isBadRequest());
    }
    @Test void personalPagesDefaultToTwentyAndCapFiftyAndCommentOrderIsDescending() throws Exception {
        var post = posts.saveAndFlush(CommunityPost.create(other.getId(), "post", CommunityContentStatus.DELETED, null, TIME));
        for (int i=0; i<52; i++) comments.saveAndFlush(CommunityComment.create(post.getId(), author.getId(), null, null, ""+i, CommunityContentStatus.PUBLISHED, TIME.plusSeconds(i)));
        mine("comments", null, null).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(20));
        String body = mine("comments", null, "999").andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(50))
                .andExpect(jsonPath("$.items[0].body").value("51")).andReturn().getResponse().getContentAsString();
        mine("comments", JsonPath.read(body, "$.nextCursor"), "2").andExpect(status().isOk()).andExpect(jsonPath("$.items[0].body").value("1"));
        mine("comments", null, "0").andExpect(status().isBadRequest());
    }
    private org.springframework.test.web.servlet.ResultActions mine(String type, String cursor, String size) throws Exception {
        var request = get("/api/v1/community/me/"+type).with(user(UserPrincipal.from(author)));
        if (cursor != null) request.param("cursor", cursor);
        if (size != null) request.param("size", size);
        return mvc.perform(request);
    }
}
