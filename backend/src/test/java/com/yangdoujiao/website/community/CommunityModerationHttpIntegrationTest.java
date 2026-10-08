package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.test.util.ReflectionTestUtils;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.jayway.jsonpath.JsonPath;

abstract class CommunityModerationIntegrationFixture extends CommunityReactionIntegrationFixture {
    UserAccount adviser;
    @BeforeEach void moderationSetup() {
        adviser = adviser();
        var keys = redis.keys("community:limit:*"); if (!keys.isEmpty()) redis.delete(keys);
    }
    @AfterEach void moderationCleanup() {
        for (long id : accountIds) {
            jdbc.update("DELETE FROM community_moderation_actions WHERE actor_account_id=?", id);
            jdbc.update("DELETE FROM community_reports WHERE reporter_account_id=? OR handled_by_account_id=?", id, id);
            jdbc.update("DELETE FROM community_idempotency_records WHERE account_id=?", id);
        }
    }
    String path(String type, long id) { return "/api/v1/adviser/community/moderation/" + type + "/" + id; }
    UserAccount adviser() {
        var result=account();ReflectionTestUtils.setField(result,"role",UserAccountRole.ADVISER);
        jdbc.update("UPDATE user_accounts SET role='ADVISER' WHERE id=?",result.getId());return result;
    }
    org.springframework.test.web.servlet.ResultActions action(String type, long id, String command, String reason, long version, String ends) throws Exception {
        return actionAs(adviser,type,id,command,reason,version,ends);
    }
    org.springframework.test.web.servlet.ResultActions actionAs(UserAccount decisionMaker,String type, long id, String command, String reason, long version, String ends) throws Exception {
        String json = "{\"command\":\""+command+"\",\"reasonCode\":\""+reason+"\",\"version\":"+version+
                (ends == null ? "" : ",\"restrictionEndsAt\":\""+ends+"\"")+"}";
        return mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path(type,id)+"/actions").with(user(UserPrincipal.from(decisionMaker))).with(csrf())
                .contentType("application/json").content(json));
    }
    org.springframework.test.web.servlet.ResultActions report(long id, UserAccount reporter, String key, String reason, String note) throws Exception {
        var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(user(UserPrincipal.from(reporter))).with(csrf())
                .contentType("application/json").content("{\"targetType\":\"POST\",\"targetId\":\""+id+"\",\"reasonCode\":\""+reason+"\",\"note\":"+
                        new tools.jackson.databind.ObjectMapper().writeValueAsString(note)+"}");
        if (key != null) request.header("Idempotency-Key", key);
        return mvc.perform(request);
    }
    long version(String type, long id) { return jdbc.queryForObject("SELECT version FROM community_"+(type.equals("POST")?"posts":"comments")+" WHERE id=?", Long.class,id); }
}

class CommunityModerationHttpIntegrationTest extends CommunityModerationIntegrationFixture {

    @Test void adviserBoundaryRequiresCookieRoleAndCsrfAndMiniappCannotEscalate() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        mvc.perform(get(path("POST",id))).andExpect(status().isUnauthorized());
        mvc.perform(get(path("POST",id)).with(user(UserPrincipal.from(actor)))).andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST",id)+"/actions").with(user(UserPrincipal.from(adviser)))
                .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        String bearer = ReflectionTestUtils.invokeMethod(tokens.issue(adviser), "accessToken");
        mvc.perform(get(path("POST",id)).header("Authorization","Bearer "+bearer)).andExpect(status().isUnauthorized());
        mvc.perform(get(path("POST",id)).with(user(UserPrincipal.from(adviser)))).andExpect(status().isOk());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(user(UserPrincipal.from(actor))).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }
    @Test void reportUsesExactPersistedReceiptCanonicalIdsAllowlistAndUnicodeBoundary() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        report(id,actor,null,"SPAM","").andExpect(status().isBadRequest());
        report(id,actor,"invalid-reason","FREE_TEXT","").andExpect(status().isBadRequest());
        report(id,actor,"long","SPAM","😀".repeat(501)).andExpect(status().isBadRequest());
        var first=report(id,actor,"report-exact","SPAM","😀".repeat(499)+"\r\n").andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isString()).andReturn().getResponse().getContentAsString();
        action("POST",id,"REJECT_REPORT","REPORT_UNFOUNDED",version("POST",id),null).andExpect(status().isOk());
        assertThat(version("POST",id)).isEqualTo(1);
        action("POST",id,"HIDE","SPAM",0,null).andExpect(status().isConflict());
        assertThat(report(id,actor,"report-exact","SPAM","😀".repeat(499)+"\n").andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).isEqualTo(first);
        report(id,actor,"report-exact","HARASSMENT","").andExpect(status().isConflict());
        for (String bad : List.of("01","0","1.0","9223372036854775808"))
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(user(UserPrincipal.from(actor))).with(csrf())
                    .header("Idempotency-Key","bad-"+bad).contentType("application/json")
                    .content("{\"targetType\":\"POST\",\"targetId\":\""+bad+"\",\"reasonCode\":\"SPAM\"}"))
                    .andExpect(status().isBadRequest());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").with(user(UserPrincipal.from(actor))).with(csrf())
                .header("Idempotency-Key","number").contentType("application/json")
                .content("{\"targetType\":\"POST\",\"targetId\":"+id+",\"reasonCode\":\"SPAM\"}"))
                .andExpect(status().isBadRequest());
    }
    @Test void duplicateOpenReportsAndConcurrentAdvisersAreSerialized() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            var go=new CountDownLatch(1); List<Future<Integer>> results=new ArrayList<>();
            for(int i=0;i<8;i++){String key="duplicate-"+i;results.add(pool.submit(()->{go.await();return report(id,actor,key,"SPAM","").andReturn().getResponse().getStatus();}));}
            go.countDown();for(var r:results) assertThat(r.get(15,TimeUnit.SECONDS)).isIn(200,201);
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_id=? AND target_type='POST'",Long.class,id)).isEqualTo(1);
        long v=version("POST",id);
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            var go=new CountDownLatch(1); List<Future<Integer>> results=new ArrayList<>();
            var secondAdviser=adviser();
            for(var decisionMaker:List.of(adviser,secondAdviser))results.add(pool.submit(()->{go.await();return actionAs(decisionMaker,"POST",id,"HIDE","HARASSMENT",v,null).andReturn().getResponse().getStatus();}));
            go.countDown();List<Integer> statuses=new ArrayList<>();for(var r:results)statuses.add(r.get(15,TimeUnit.SECONDS));
            assertThat(statuses).containsExactlyInAnyOrder(200,409);
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_id=?",Long.class,id)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM community_reports WHERE target_id=?",String.class,id)).isEqualTo("RESOLVED_ACTIONED");
    }
    @Test void thresholdRaceHidesOnceAndKeepsReportsAndSnapshots() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        mvc.perform(get("/api/v1/community/posts").param("sort","hot")).andExpect(status().isOk());
        String snapshot=redis.opsForValue().get("community:hot:v1:current");
        var reporters=new ArrayList<UserAccount>();for(int i=0;i<5;i++)reporters.add(account());
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            var go=new CountDownLatch(1); List<Future<Integer>> results=new ArrayList<>();
            for(var a:reporters)results.add(pool.submit(()->{go.await();return report(id,a,"threshold","SPAM","").andReturn().getResponse().getStatus();}));
            go.countDown();for(var r:results)assertThat(r.get(15,TimeUnit.SECONDS)).isEqualTo(201);
        }
        assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,id)).isEqualTo("HIDDEN");
        assertThat(redis.opsForValue().get("community:hot:v1:current")).isNull();
        assertThat(redis.keys("community:hot:*"+snapshot+"*")).isNotEmpty();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_id=?",Long.class,id)).isEqualTo(5);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_type='POST' AND target_id=? AND action='AUTO_HIDE'",Long.class,id)).isEqualTo(1);
    }
    @Test void transitionsReasonVersionAndDurationsAreStrictAndRestoreReconcilesVisibleReplies() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED),root=comment(id,null,CommunityContentStatus.PUBLISHED),reply=comment(id,root,CommunityContentStatus.PUBLISHED);
        jdbc.update("UPDATE community_posts SET comment_count=2 WHERE id=?",id);
        action("COMMENT",root,"HIDE","",0,null).andExpect(status().isBadRequest());
        action("COMMENT",root,"HIDE","APPEAL_ACCEPTED",0,null).andExpect(status().isBadRequest());
        action("COMMENT",root,"HIDE","HARASSMENT",0,null).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?",Integer.class,id)).isZero();
        action("COMMENT",root,"RESTORE","APPEAL_ACCEPTED",0,null).andExpect(status().isConflict());
        action("COMMENT",root,"RESTORE","APPEAL_ACCEPTED",version("COMMENT",root),null).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?",Integer.class,id)).isEqualTo(2);
        action("POST",id,"HIDE","SPAM",version("POST",id),null).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?",Integer.class,id)).isZero();
        action("POST",id,"RESTORE","APPEAL_ACCEPTED",version("POST",id),null).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT comment_count FROM community_posts WHERE id=?",Integer.class,id)).isEqualTo(2);
        for(var state:List.of(CommunityContentStatus.DELETED,CommunityContentStatus.REJECTED)) {
            long target=post(state); action("POST",target,"RESTORE","APPEAL_ACCEPTED",0,null).andExpect(status().isConflict());
        }
        action("POST",id,"MUTE","HARASSMENT",version("POST",id),null).andExpect(status().isBadRequest());
        action("POST",id,"MUTE","HARASSMENT",version("POST",id),OffsetDateTime.now().minusMinutes(1).toString()).andExpect(status().isBadRequest());
        action("POST",id,"BAN","HARASSMENT",version("POST",id),OffsetDateTime.now().plusHours(1).toString()).andExpect(status().isBadRequest());
    }
    @Test void muteExpiryAndPermanentBanRestrictAuthorsWritesLikesAndReports() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        action("POST",id,"MUTE","HARASSMENT",0,OffsetDateTime.now().plusHours(1).toString()).andExpect(status().isOk());
        report(id,actor,"muted","SPAM","").andExpect(status().isForbidden());
        react(put(postPath(id)),actor).andExpect(status().isForbidden());
        jdbc.update("UPDATE community_user_restrictions SET starts_at=now()-interval '2 hours',ends_at=now()-interval '1 hour' WHERE account_id=?",actor.getId());
        react(put(postPath(id)),actor).andExpect(status().isNoContent());
        report(id,actor,"after-expiry","SPAM","").andExpect(status().isCreated());
        action("POST",id,"BAN","HARASSMENT",version("POST",id),null).andExpect(status().isOk());
        react(put(postPath(id)),actor).andExpect(status().isForbidden());
        report(id,actor,"banned","SPAM","").andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/posts").with(user(UserPrincipal.from(actor))).with(csrf())
                .header("Idempotency-Key","banned-post").contentType("application/json").content("{\"body\":\"blocked\"}"))
                .andExpect(status().isForbidden());
    }
    @Test void boundedQueueAndDetailExposeContentAndAggregatesWithoutReporterPrivateData() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        report(id,actor,"private","SPAM","私密 😀 note").andExpect(status().isCreated());
        String queue=mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("size","1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].targetId").isString()).andReturn().getResponse().getContentAsString();
        assertThat(queue).doesNotContain("reporterAccountId","note","fullName","email","phone","openid","Fixture");
        String detail=mvc.perform(get(path("POST",id)).with(user(UserPrincipal.from(adviser))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.openReportCount").value(1)).andReturn().getResponse().getContentAsString();
        assertThat(detail).doesNotContain("reporterAccountId","私密","fullName","email","phone","openid");
        mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("size","51")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("cursor","tampered")).andExpect(status().isBadRequest());
    }
    @Test void pendingApprovalAndCommentReportsDoNotResurrectTerminalOrOrphanTargets() throws Exception {
        long pending=post(CommunityContentStatus.PENDING_REVIEW);
        action("POST",pending,"RESTORE","REVIEW_APPROVED",0,null).andExpect(status().isOk());
        long root=comment(pending,null,CommunityContentStatus.PUBLISHED),reply=comment(pending,root,CommunityContentStatus.PUBLISHED);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports")
                .with(user(UserPrincipal.from(actor))).with(csrf()).header("Idempotency-Key","comment-report")
                .contentType("application/json").content("{\"targetType\":\"COMMENT\",\"targetId\":\""+reply+"\",\"reasonCode\":\"HARASSMENT\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.targetId").value(Long.toString(reply)));
        action("COMMENT",reply,"HIDE","HARASSMENT",0,null).andExpect(status().isOk());
        jdbc.update("UPDATE community_comments SET status='DELETED',version=version+1 WHERE id=?",root);
        action("COMMENT",reply,"RESTORE","APPEAL_ACCEPTED",version("COMMENT",reply),null).andExpect(status().isConflict());
        for(var state:List.of(CommunityContentStatus.DELETED,CommunityContentStatus.REJECTED)) {
            long id=post(state);
            for(String command:List.of("HIDE","MUTE","BAN"))
                action("POST",id,command,"POLICY_VIOLATION",0,command.equals("MUTE")?OffsetDateTime.now().plusHours(1).toString():null)
                        .andExpect(status().isConflict());
        }
        long large=9007199254740993L;
        jdbc.update("INSERT INTO community_posts(id,author_account_id,body,status,published_at) VALUES (?,?,'large','PUBLISHED',now())",large,actor.getId());
        report(large,actor,"large-report","SPAM","").andExpect(status().isCreated()).andExpect(jsonPath("$.targetId").value("9007199254740993"));
        action("POST",large,"HIDE","SPAM",0,null).andExpect(status().isOk()).andExpect(jsonPath("$.targetId").value("9007199254740993"));
    }
    @Test void mixedTargetQueueCursorHandlesEqualTimestampsAndFilterScope() throws Exception {
        long id=post(CommunityContentStatus.PENDING_REVIEW),root=comment(id,null,CommunityContentStatus.PENDING_REVIEW);
        jdbc.update("UPDATE community_posts SET created_at='2026-10-08T00:00:00Z' WHERE id=?",id);
        jdbc.update("UPDATE community_comments SET created_at='2026-10-08T00:00:00Z' WHERE id=?",root);
        String first=mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("size","1"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String cursor=JsonPath.read(first,"$.nextCursor");assertThat(cursor).isNotNull();
        String second=mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("size","1").param("cursor",cursor))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat((String)JsonPath.read(first,"$.items[0].targetType")).isNotEqualTo((String)JsonPath.read(second,"$.items[0].targetType"));
        assertThat((Object)JsonPath.read(second,"$.nextCursor")).isNull();
        mvc.perform(get("/api/v1/adviser/community/moderation").with(user(UserPrincipal.from(adviser))).param("status","HIDDEN").param("cursor",cursor))
                .andExpect(status().isBadRequest());
    }
    @Test void adviserLoadsCurrentCommentOnlyAfterWaitingForItsPostLock() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED),root=comment(id,null,CommunityContentStatus.PUBLISHED);
        // The test pool has two connections; observe via the holder instead of borrowing a third.
        // Close the holder before the executor on assertion failure so its blocked request can finish.
        try(var pool=Executors.newVirtualThreadPerTaskExecutor();var connection=jdbc.getDataSource().getConnection()) {
            connection.setAutoCommit(false);
            try(var lock=connection.prepareStatement("SELECT id FROM community_posts WHERE id=? FOR UPDATE")) {
                lock.setLong(1,id);lock.executeQuery().close();
            }
            var waiting=pool.submit(()->action("COMMENT",root,"HIDE","SPAM",0,null).andReturn().getResponse().getStatus());
            boolean observed=false;long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(5);
            while(System.nanoTime()<deadline) {
                try(var observation=connection.createStatement()) {
                    observation.execute("SELECT pg_stat_clear_snapshot()");
                    try(var result=observation.executeQuery("SELECT count(*) FROM pg_stat_activity WHERE pid<>pg_backend_pid() AND wait_event_type='Lock' AND query LIKE '%community_posts%'")) {
                        result.next();observed=result.getLong(1)>0;
                    }
                }
                if(observed)break;Thread.sleep(20);
            }
            assertThat(observed).as("moderation request waits on real PostgreSQL post lock").isTrue();
            try(var update=connection.prepareStatement("UPDATE community_comments SET status='HIDDEN',version=version+1 WHERE id=?")) {
                update.setLong(1,root);update.executeUpdate();
            }
            connection.commit();
            assertThat(waiting.get(15,TimeUnit.SECONDS)).isEqualTo(409);
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_type='COMMENT' AND target_id=?",Long.class,root)).isZero();
    }
}
