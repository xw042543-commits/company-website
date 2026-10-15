package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"app.community.enabled=true","app.community.images.enabled=true",
    "app.community.images.max-bytes=100000000",
    "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class CommunityImagePostHttpIntegrationTest {
    @TempDir static Path imageRoot;
    @DynamicPropertySource
    static void imageStorage(DynamicPropertyRegistry properties) {
        properties.add("app.community.images.root", () -> imageRoot.toAbsolutePath().toString());
    }
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired UserAccountRepository accounts;
    @Autowired ObjectMapper json;
    @Autowired org.springframework.data.redis.core.StringRedisTemplate redis;
    UserAccount actor;
    String image;
    Long otherId;
    Long reviewerId;
    @BeforeEach void setup() {
        var limits=redis.keys("community:limit:v1:*");
        if(!limits.isEmpty())redis.delete(limits);
        actor=accounts.saveAndFlush(UserAccount.external("Image author","v1","v1"));
        image=UUID.randomUUID().toString().replace("-","");
        jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size) VALUES(?,?,?,10,10,1)",image,actor.getId(),image);
    }
    @Test void bindsImagesAtomicallyAndReplaysWithoutRebinding() throws Exception {
        String body=json.writeValueAsString(Map.of("body","Campus photo","imageIds",List.of(image)));
        String result=publish("photo-key",body).andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PUBLISHED")).andReturn().getResponse().getContentAsString();
        String postId=json.readTree(result).path("id").asText();
        assertThat(jdbc.queryForObject("SELECT post_id FROM community_images WHERE id=?",Long.class,image)).isEqualTo(Long.valueOf(postId));
        publish("photo-key",body).andExpect(status().isOk()).andExpect(content().json(result));
        publish("photo-key","{\"body\":\"Campus photo\"}").andExpect(status().isConflict());
        mvc.perform(get("/api/v1/community/images").param("postIds",postId))
            .andExpect(status().isOk()).andExpect(jsonPath("$['"+postId+"'][0].id").value(image));
        mvc.perform(get("/api/v1/community/images").param("postIds",postId).with(user(UserPrincipal.from(actor))))
            .andExpect(status().isOk()).andExpect(jsonPath("$['"+postId+"'][0].id").value(image));
    }
    @Test void ordinaryTextAndPhotoPublishImmediatelyWithoutScanner() throws Exception {
        publish("text-only","{\"body\":\"Campus update\"}")
            .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PUBLISHED"));
        String result=publish("photo-auto",json.writeValueAsString(Map.of("body","Campus photo","imageIds",List.of(image))))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PUBLISHED"))
            .andReturn().getResponse().getContentAsString();
        String postId=json.readTree(result).path("id").asText();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_image_review_jobs WHERE image_id=?",Long.class,image)).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,Long.valueOf(postId)))
            .isEqualTo("PUBLISHED");
    }
    @Test void foreignImagesCannotBeAttachedAndLeaveNoPost() throws Exception {
        var other=accounts.saveAndFlush(UserAccount.external("Other","v1","v1"));
        otherId=other.getId();
        jdbc.update("UPDATE community_images SET owner_account_id=? WHERE id=?",other.getId(),image);
        publish("foreign",json.writeValueAsString(Map.of("body","test","imageIds",List.of(image))))
            .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_posts WHERE author_account_id=?",Long.class,actor.getId())).isZero();
    }
    @Test void administratorCanSeePublishedPhotoMetadata() throws Exception {
        String result=publish("admin-review",json.writeValueAsString(Map.of("body","Review photo","imageIds",List.of(image))))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String postId=json.readTree(result).path("id").asText();
        var reviewer=accounts.saveAndFlush(UserAccount.external("Administrator","admin-review","admin-review"));
        reviewerId=reviewer.getId();
        ReflectionTestUtils.setField(reviewer,"role",UserAccountRole.ADMIN);
        jdbc.update("UPDATE user_accounts SET role='ADMIN' WHERE id=?",reviewerId);
        mvc.perform(get("/api/v1/community/images").param("postIds",postId).with(user(UserPrincipal.from(reviewer))))
            .andExpect(status().isOk()).andExpect(jsonPath("$['"+postId+"'][0].id").value(image));
    }
    @AfterEach void cleanup() {
        if(reviewerId!=null)jdbc.update("DELETE FROM community_moderation_actions WHERE actor_account_id=?",reviewerId);
        jdbc.update("DELETE FROM community_images WHERE id=?",image);
        jdbc.update("DELETE FROM community_idempotency_records WHERE account_id=?",actor.getId());
        jdbc.update("DELETE FROM community_posts WHERE author_account_id=?",actor.getId());
        accounts.deleteById(actor.getId());
        if(otherId!=null)accounts.deleteById(otherId);
        if(reviewerId!=null)accounts.deleteById(reviewerId);
    }
    private org.springframework.test.web.servlet.ResultActions publish(String key,String body)throws Exception {
        return mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(actor))).with(csrf())
            .header("Idempotency-Key",key).contentType("application/json").content(body));
    }
}
