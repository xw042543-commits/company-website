package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class CommunityImageReviewJobsIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager manager;
    CommunityImageReviewJobs jobs;
    CommunityImageAttachments images;
    long owner,post;
    String id;
    Instant now=Instant.now().plusSeconds(5);
    @BeforeEach void setup() {
        jobs=new CommunityImageReviewJobs(jdbc,new TransactionTemplate(manager));
        images=new CommunityImageAttachments(new CommunityImageAttachmentRepository(jdbc,Clock.fixed(now,ZoneOffset.UTC)),true,"");
        owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Review job','ACTIVE','v1','v1') RETURNING id",Long.class);
        post=jdbc.queryForObject("INSERT INTO community_posts(author_account_id,body,status) VALUES(?,'test','PENDING_REVIEW') RETURNING id",Long.class,owner);
        id=UUID.randomUUID().toString().replace("-","");
        jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size) VALUES(?,?,?,10,10,1)",id,owner,id);
        new TransactionTemplate(manager).executeWithoutResult(tx->images.bind(owner,post,List.of(id),true));
    }
    @AfterEach void clean() {
        jdbc.update("DELETE FROM community_image_callback_inbox WHERE trace_id LIKE 'fixture-%'");
        jdbc.update("DELETE FROM community_images WHERE id=?",id);
        jdbc.update("DELETE FROM community_posts WHERE id=?",post);
        jdbc.update("DELETE FROM user_accounts WHERE id=?",owner);
    }
    @Test void callbackBeforeAcknowledgementIsAppliedOnce() {
        var claim=jobs.claim(now).orElseThrow();
        assertTrue(jobs.claim(now).isEmpty());
        jobs.receive("fixture-early","PASS",now);
        jobs.acknowledge(claim,"fixture-early",now);
        jobs.receive("fixture-early","REJECTED",now);
        assertEquals("PASS",jdbc.queryForObject("SELECT status FROM community_images WHERE id=?",String.class,id));
        assertTrue(jobs.claim(now.plusSeconds(400)).isEmpty());
    }
    @Test void expiredLeaseCanRecoverButStaleAcknowledgementCannotWin() {
        var old=jobs.claim(now).orElseThrow();
        var fresh=jobs.claim(now.plusSeconds(121)).orElseThrow();
        jobs.acknowledge(old,"fixture-stale",now.plusSeconds(122));
        jobs.receive("fixture-stale","PASS",now.plusSeconds(122));
        assertEquals("PENDING",jdbc.queryForObject("SELECT status FROM community_images WHERE id=?",String.class,id));
        jobs.acknowledge(fresh,"fixture-current",now.plusSeconds(122));
        jobs.receive("fixture-current","REVIEW",now.plusSeconds(123));
        assertEquals("REVIEW",jdbc.queryForObject("SELECT status FROM community_images WHERE id=?",String.class,id));
    }
    @Test void capsAttemptsAndFallsBackOnMissingCallback() {
        for(int attempt=0;attempt<3;attempt++) {
            var claim=jobs.claim(now.plusSeconds(attempt*121L)).orElseThrow();
            jobs.failed(claim,now.plusSeconds(attempt*121L));
        }
        assertTrue(jobs.claim(now.plusSeconds(1000)).isEmpty());
        assertEquals("REVIEW",jdbc.queryForObject("SELECT status FROM community_images WHERE id=?",String.class,id));
    }
    @Test void callbackTimeoutRemainsManualEvenWithLatePass() {
        var claim=jobs.claim(now).orElseThrow();
        jobs.acknowledge(claim,"fixture-late",now);
        jobs.claim(now.plusSeconds(36*60));
        jobs.receive("fixture-late","PASS",now.plusSeconds(36*60+1));
        assertEquals("REVIEW",jdbc.queryForObject("SELECT status FROM community_images WHERE id=?",String.class,id));
    }
    @Test void workerWaitsForCallbackBeforePublishing() {
        var gateway=org.mockito.Mockito.mock(WechatImageReviewGateway.class);
        org.mockito.Mockito.when(gateway.submit(owner,id)).thenReturn(Optional.of("fixture-worker"));
        var worker=new CommunityImageReviewWorker(jobs,images,gateway,Clock.fixed(now,ZoneOffset.UTC));
        worker.tick();
        assertEquals("PENDING_REVIEW",jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,post));
        jobs.receive("fixture-worker","PASS",now.plusSeconds(1));
        worker.tick();
        assertEquals("PUBLISHED",jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,post));
        worker.tick();
        assertEquals(1L,jdbc.queryForObject("SELECT count(*) FROM inbox_notifications WHERE recipient_account_id=?",Long.class,owner));
    }
}
