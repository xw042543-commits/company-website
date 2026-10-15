package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import java.time.Clock;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class CommunityImageAttachmentsIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager manager;
    @Autowired ObjectMapper json;
    CommunityImageAttachments media;
    long owner,post;
    String first="a".repeat(32),second="b".repeat(32);
    @BeforeEach void setup() {
        media=new CommunityImageAttachments(new CommunityImageAttachmentRepository(jdbc,Clock.systemUTC()),true,"");
        owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Image Binding Test','ACTIVE','v1','v1') RETURNING id",Long.class);
        post=jdbc.queryForObject("INSERT INTO community_posts(author_account_id,body,status) VALUES(?,'test','PENDING_REVIEW') RETURNING id",Long.class,owner);
        jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size) VALUES(?,?,?,10,10,1),(?,?,?,10,10,1)",first,owner,first,second,owner,second);
    }
    @AfterEach void cleanup() {
        jdbc.update("DELETE FROM community_images WHERE owner_account_id=?",owner);
        jdbc.update("DELETE FROM community_posts WHERE id=?",post);
        jdbc.update("DELETE FROM user_accounts WHERE id=?",owner);
    }
    void bind(List<String> ids,boolean textPass) {
        new TransactionTemplate(manager).executeWithoutResult(tx->media.bind(owner,post,ids,textPass));
    }
    @Test void preservesOrderAndRejectsRebinding() {
        bind(List.of(second,first),true);
        assertEquals(List.of(second,first),jdbc.queryForList("SELECT id FROM community_images WHERE post_id=? ORDER BY position",String.class,post));
        assertThrows(ApiException.class,()->bind(List.of(first),true));
    }
    @Test void refusesForeignOwnerWithoutPartialBinding() {
        assertThrows(ApiException.class,()->new TransactionTemplate(manager).executeWithoutResult(tx->media.bind(owner+1,post,List.of(first),true)));
        assertNull(jdbc.queryForObject("SELECT post_id FROM community_images WHERE id=?",Long.class,first));
    }
    @Test void passingEveryImageStillNeedsAdministratorApproval() {
        bind(List.of(first,second),true);
        media.recordResult(first,"PASS");
        assertEquals("PENDING_REVIEW",status());
        assertFalse(media.readyForManualApproval(post,true));
        media.recordResult(second,"PASS");
        assertEquals("PENDING_REVIEW",status());
        assertTrue(media.readyForManualApproval(post,true));
    }
    @Test void doesNotOverrideTextReviewOrManualState() {
        bind(List.of(first),false);
        media.recordResult(first,"PASS");
        assertEquals("PENDING_REVIEW",status());
        jdbc.update("UPDATE community_posts SET status='HIDDEN',version=version+1 WHERE id=?",post);
        media.recordResult(first,"PASS");
        assertEquals("HIDDEN",status());
    }
    @Test void rejectedOrUncheckedImageCannotBeApproved() {
        bind(List.of(first,second),true);
        assertFalse(media.readyForManualApproval(post,true));
        media.recordResult(first,"REJECTED");
        media.recordResult(second,"PASS");
        assertFalse(media.readyForManualApproval(post,true));
        assertFalse(media.readyForManualApproval(post,false));
        assertEquals("PENDING_REVIEW",status());
    }
    @Test void optionalScannerDoesNotBlockManualApproval() {
        bind(List.of(first),true);
        assertFalse(media.readyForManualApproval(post,true));
        assertTrue(media.readyForManualApproval(post,false));
        assertEquals("PENDING_REVIEW",status());
    }
    @Test void rejectsDuplicateAndTooManyIds() {
        assertThrows(ApiException.class,()->CommunityImageAttachments.parse(json.valueToTree(List.of(first,first))));
        assertThrows(ApiException.class,()->CommunityImageAttachments.parse(json.valueToTree(java.util.stream.IntStream.range(0,10).mapToObj(i->String.format("%032x",i)).toList())));
    }
    @Test void publicMetadataDisappearsWhenPostIsHidden() {
        bind(List.of(first),true);media.recordResult(first,"PASS");
        jdbc.update("UPDATE community_posts SET status='PUBLISHED' WHERE id=?",post);
        assertEquals(1,media.forPosts(List.of(post),null,false).get(Long.toString(post)).size());
        jdbc.update("UPDATE community_posts SET status='HIDDEN',version=version+1 WHERE id=?",post);
        assertTrue(media.forPosts(List.of(post),null,false).isEmpty());
        assertEquals(1,media.forPosts(List.of(post),owner,false).get(Long.toString(post)).size());
    }
    private String status(){return jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,post);}
}
