package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class CommunityAuditLoggerTest extends CommunityModerationIntegrationFixture {
    @org.springframework.beans.factory.annotation.Autowired org.springframework.transaction.PlatformTransactionManager manager;
    @org.springframework.beans.factory.annotation.Autowired CommunityModerationService moderation;
    @Test void outerRollbackAfterRegisteringCallbacksEmitsNoSuccessAndKeepsOpenReportsAndCurrentSnapshot(CapturedOutput output) throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        report(id,actor,"outer-rollback","SPAM","").andExpect(status().isCreated());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/community/posts").param("sort","hot")).andExpect(status().isOk());
        String current=redis.opsForValue().get("community:hot:v1:current");
        long before=output.getAll().lines().filter(l->l.contains("community_decision")).count();
        new org.springframework.transaction.support.TransactionTemplate(manager).executeWithoutResult(tx->{
            moderation.decide(adviser.getId(),CommunityTargetType.POST,id,new CommunityModerationRequest(CommunityModerationCommand.HIDE,CommunityModerationReason.SPAM,0L,null));
            tx.setRollbackOnly();
        });
        assertThat(output.getAll().lines().filter(l->l.contains("community_decision")).count()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,id)).isEqualTo("PUBLISHED");
        assertThat(jdbc.queryForObject("SELECT status FROM community_reports WHERE target_id=?",String.class,id)).isEqualTo("OPEN");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_id=?",Long.class,id)).isZero();
        assertThat(redis.opsForValue().get("community:hot:v1:current")).isEqualTo(current);
    }
    @Test void successfulDecisionsLogOnlySafeMetadataAndDatabaseFailureEmitsNoSuccess(CapturedOutput output) throws Exception {
        long id=posts.saveAndFlush(CommunityPost.create(actor.getId(),"私密内容 😀 email@example.invalid phone openid",CommunityContentStatus.PUBLISHED,null,OffsetDateTime.now())).getId();
        report(id,actor,"audit-report","HARASSMENT","私密说明 🐼 confidential").andExpect(status().isCreated());
        action("POST",id,"HIDE","HARASSMENT",0,null).andExpect(status().isOk());
        String audit=output.getAll().lines().filter(l->l.contains("community_decision")).reduce("",(a,b)->a+b);
        assertThat(audit).contains("actor="+adviser.getId(),"target="+id,"command=HIDE","reason=HARASSMENT","outcome=COMMITTED")
                .doesNotContain("私密","😀","🐼","email@example","confidential","phone","openid");
        jdbc.execute("CREATE FUNCTION task5_fail_action() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$");
        jdbc.execute("CREATE TRIGGER task5_fail_action BEFORE INSERT ON community_moderation_actions FOR EACH ROW EXECUTE FUNCTION task5_fail_action()");
        int before=(int)output.getAll().lines().filter(l->l.contains("community_decision")).count();
        try {
            action("POST",id,"RESTORE","APPEAL_ACCEPTED",version("POST",id),null).andExpect(status().isInternalServerError());
            assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,id)).isEqualTo("HIDDEN");
            assertThat(output.getAll().lines().filter(l->l.contains("community_decision")).count()).isEqualTo(before);
        } finally {
            jdbc.execute("DROP TRIGGER task5_fail_action ON community_moderation_actions");
            jdbc.execute("DROP FUNCTION task5_fail_action()");
        }
    }
}
