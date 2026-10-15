package com.yangdoujiao.website.planningagent.plan;

import static org.assertj.core.api.Assertions.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationRequest;
import com.yangdoujiao.website.planningagent.session.PlanningCleanup;
import com.yangdoujiao.website.planningagent.security.PlanningLimits;

@SpringBootTest(properties={"app.planning-agent.scheduling-enabled=false","app.consultation.submission-enabled=true","app.miniapp.auth.enabled=true",
        "app.consultation.privacy-notice-version=v1","app.miniapp.auth.local-provider-enabled=true",
        "app.miniapp.auth.local-test-code=planning-test-code","app.miniapp.auth.local-test-subject=planning-test-subject"})
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class PlanningOwnershipIntegrationTest {
    @Autowired PlanningPlanService plans;
    @Autowired PlanningCleanup cleanup;
    @Autowired PlanningLimits limits;
    @Autowired JdbcTemplate jdbc;
    @Autowired com.yangdoujiao.website.auth.api.AccountService accounts;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder passwords;
    @Autowired tools.jackson.databind.ObjectMapper json;
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    @Autowired com.yangdoujiao.website.planningagent.agent.ToolDispatcher dispatcher;
    @Autowired com.yangdoujiao.website.planningagent.agent.PlanValidator validator;
    @Autowired com.yangdoujiao.website.planningagent.session.PlanningSessionRepository sessionRepository;
    long owner,other; UUID session,run;
    @BeforeEach void fixture() {
        owner=user();other=user(); session=UUID.randomUUID();run=UUID.randomUUID();
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,profile_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',1,CURRENT_TIMESTAMP-INTERVAL '31 days')",session,owner);
        jdbc.update("INSERT INTO planning_profiles(session_id,version,facts,confirmed_at) VALUES(?,1,'{\"targetLevel\":\"MASTER\",\"intake\":\"2027\"}',CURRENT_TIMESTAMP)",session);
        jdbc.update("INSERT INTO planning_runs(id,session_id,request_key,request_hash,intent,profile_version,status,created_at,deadline,result) VALUES(?,?,'r',?,'GENERATE',1,'SUCCEEDED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP+INTERVAL '60 seconds',?)",
                run,session,"a".repeat(64),"{\"type\":\"PLAN\",\"questions\":[],\"plan\":{\"profileVersion\":1,\"programmes\":[],\"generalNextSteps\":[\"PREPARE_DOCUMENTS\"]}}");
    }
    long user() { return jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Tester','ACTIVE','v1','v1') RETURNING id",Long.class); }
    @AfterEach void remove() {
        jdbc.update("DELETE FROM consultation_enquiries WHERE user_account_id IN (?,?)",owner,other);
        jdbc.update("DELETE FROM miniapp_auth_tokens WHERE user_account_id IN (?,?)",owner,other);
        jdbc.update("DELETE FROM user_accounts WHERE id IN (?,?)",owner,other);
    }
    PlanningPlanService.SaveRequest request(String key) { return new PlanningPlanService.SaveRequest(run,true,key); }
    void code(String code,Runnable action) { assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,e->assertThat(e.getCode()).isEqualTo(code)); }
    @Test void savesMatchingRunSnapshotAndRejectsUnconfirmedOrForeignAccess() {
        assertThatThrownBy(()->plans.save(owner,session,new PlanningPlanService.SaveRequest(run,false,"x"))).hasMessage("CONFIRMATION_REQUIRED");
        code("NOT_FOUND",()->plans.save(other,session,request("x")));
        var saved=plans.save(owner,session,request("x"));
        assertThat(plans.save(owner,session,request("x"))).isEqualTo(saved);
        code("NOT_FOUND",()->plans.get(other,saved.planId()));
        code("NOT_FOUND",()->plans.delete(other,saved.planId()));
        assertThat(plans.get(owner,saved.planId()).snapshot().profile().facts()).containsEntry("intake","2027");
    }
    @Test void cleanupPreservesSavedPlansAndAccountPurgeRemovesAllPlanningData() {
        var id=plans.save(owner,session,request("save")).planId();
        jdbc.update("UPDATE planning_sessions SET last_activity_at=CURRENT_TIMESTAMP-INTERVAL '31 days' WHERE id=?",session);
        cleanup.clean();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_sessions WHERE id=?",Integer.class,session)).isZero();
        assertThat(plans.get(owner,id).snapshot().plan().generalNextSteps()).containsExactly("PREPARE_DOCUMENTS");
        cleanup.purgeOwner(owner);
        assertThat(plans.list(owner)).isEmpty();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_saved_plan_programmes WHERE plan_id=?",Integer.class,id)).isZero();
    }
    @Test void concurrentSaveRetriesProduceOneImmutablePlan() throws Exception {
        var gate=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            Callable<PlanningPlanService.Saved> call=()->{gate.await();return plans.save(owner,session,request("parallel"));};
            var a=executor.submit(call);var b=executor.submit(call);gate.countDown();
            assertThat(a.get(10,TimeUnit.SECONDS)).isEqualTo(b.get(10,TimeUnit.SECONDS));
        }
        assertThat(plans.list(owner)).hasSize(1);
    }
    @Test void consultationRequiresConfirmationAndConcurrentRetriesCreateOnlyOneWithPayloadConflicts() throws Exception {
        var id=plans.save(owner,session,request("save")).planId();
        var contact=new ConsultationRequest("Alice","13800138000",null,null,null,"Confirmed summary","zh",true);
        assertThatThrownBy(()->plans.consult(owner,id,new PlanningPlanService.ShareRequest(false,"share",contact))).hasMessage("CONFIRMATION_REQUIRED");
        var gate=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            Callable<com.yangdoujiao.website.consultation.ConsultationResponse> call=()->{gate.await();return plans.consult(owner,id,new PlanningPlanService.ShareRequest(true,"share",contact));};
            var a=executor.submit(call);var b=executor.submit(call);gate.countDown();
            assertThat(a.get(15,TimeUnit.SECONDS).referenceCode()).isEqualTo(b.get(15,TimeUnit.SECONDS).referenceCode());
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isEqualTo(1);
        code("IDEMPOTENCY_CONFLICT",()->plans.consult(owner,id,new PlanningPlanService.ShareRequest(true,"share",
                new ConsultationRequest("Bob","13900139000",null,null,null,"different","zh",true))));
    }
    @Test void accountSoftDeletionPurgesPlanningHistoryWithoutDependingOnAccountForeignKeyCascade() {
        var id=plans.save(owner,session,request("save")).planId();
        plans.consult(owner,id,new PlanningPlanService.ShareRequest(true,"shared-before-delete",
                new ConsultationRequest("Alice","13800138000",null,null,null,"Confirmed summary","zh",true)));
        jdbc.update("INSERT INTO planning_usage(owner_id,bucket,used) VALUES(?,'day:2042-01-01',1)",owner);
        jdbc.update("INSERT INTO planning_daily_budget(day,tokens,cost) VALUES('2042-01-01',1,1)");
        jdbc.update("INSERT INTO planning_reservations(run_id,owner_id,day,tokens,cost,calls) VALUES(?,?,'2042-01-01',1,1,1)",run,owner);
        jdbc.update("UPDATE user_accounts SET normalized_email=?,password_hash=? WHERE id=?","delete-"+UUID.randomUUID()+"@example.com",passwords.encode("Delete-password-123!"),owner);
        accounts.delete(owner,new com.yangdoujiao.website.auth.api.DeleteAccountRequest("Delete-password-123!","DELETE"));
        assertThat(jdbc.queryForObject("SELECT status FROM user_accounts WHERE id=?",String.class,owner)).isEqualTo("DELETED");
        assertThat(plans.list(owner)).isEmpty();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_sessions WHERE id=?",Integer.class,session)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_plan_consultations WHERE plan_id=?",Integer.class,id)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_usage WHERE owner_id=?",Integer.class,owner)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_reservations WHERE owner_id=?",Integer.class,owner)).isZero();
        assertThat(jdbc.queryForObject("SELECT cost FROM planning_daily_budget WHERE day='2042-01-01'",java.math.BigDecimal.class)).isEqualByComparingTo("1");
        jdbc.update("DELETE FROM planning_daily_budget WHERE day='2042-01-01'");
    }
    @Test void savesOnlyCurrentSuccessfulGenerateRunAndConflictingSavePayloadIsRejected() {
        plans.save(owner,session,request("same-key"));
        code("IDEMPOTENCY_CONFLICT",()->plans.save(owner,session,new PlanningPlanService.SaveRequest(UUID.randomUUID(),true,"same-key")));
        jdbc.update("UPDATE planning_runs SET intent='CHAT' WHERE id=?",run);
        code("SUCCESSFUL_PLAN_REQUIRED",()->plans.save(owner,session,request("invalid")));
    }
    record SourceRun(long programme,long source,long condition,long fee,long university,long category,long level) {}
    SourceRun sourceRun() {
        long category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?,'Source test') RETURNING id",Long.class,"S_"+UUID.randomUUID().toString().replace("-","").toUpperCase());
        jdbc.update("INSERT INTO study_levels(code,name_en,status) VALUES('MASTER','Master','PUBLISHED') ON CONFLICT(code) DO NOTHING");
        long level=jdbc.queryForObject("SELECT id FROM study_levels WHERE code='MASTER'",Long.class);
        jdbc.update("INSERT INTO countries(code,name_en,continent_code) VALUES('MY','Malaysia','ASIA') ON CONFLICT(code) DO NOTHING");
        long country=jdbc.queryForObject("SELECT id FROM countries WHERE code='MY'",Long.class);
        long university=jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES('Source university',?,'Malaysia',?,'PUBLISHED') RETURNING id",Long.class,"source-"+UUID.randomUUID(),country);
        long programme=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,slug,name_en,status) VALUES(?,?,?,?,?,'Original course','PUBLISHED') RETURNING id",
                Long.class,"S_"+UUID.randomUUID().toString().replace("-","").toUpperCase(),university,category,level,"source-"+UUID.randomUUID());
        long source=jdbc.queryForObject("INSERT INTO planning_evidence(programme_id,fact_type,source_url,source_type,student_scope,intake,checked_at,expires_at,review_status,reviewer_id,excerpt) VALUES(?,'ADMISSIONS','https://example.edu/admission','OFFICIAL','CN_MAINLAND','2027',CURRENT_TIMESTAMP-INTERVAL '1 day',CURRENT_TIMESTAMP+INTERVAL '30 days','VERIFIED',1,'Original source') RETURNING id",Long.class,programme);
        long feesSource=jdbc.queryForObject("INSERT INTO planning_evidence(programme_id,fact_type,source_url,source_type,student_scope,intake,checked_at,expires_at,review_status,reviewer_id,excerpt) VALUES(?,'FEES','https://example.edu/fees','OFFICIAL','CN_MAINLAND','2027',CURRENT_TIMESTAMP-INTERVAL '1 day',CURRENT_TIMESTAMP+INTERVAL '30 days','VERIFIED',1,'Original fees') RETURNING id",Long.class,programme);
        long rule=jdbc.queryForObject("INSERT INTO planning_rule_sets(programme_id,version,complete,active) VALUES(?,1,true,true) RETURNING id",Long.class,programme);
        long condition=jdbc.queryForObject("INSERT INTO planning_rule_conditions(rule_set_id,branch_no,field,operator,expected,scale,evidence_id) VALUES(?,0,'grade','GTE','70','100',?) RETURNING id",Long.class,rule,source);
        long fee=jdbc.queryForObject("INSERT INTO planning_fees(programme_id,evidence_id,category,amount,currency,period,units,coverage_complete) VALUES(?,?,'TUITION',100,'MYR','TOTAL',1,true) RETURNING id",Long.class,programme,feesSource);
        jdbc.update("UPDATE planning_profiles SET facts=facts || '{\"grade\":\"75\",\"grade.scale\":\"100\",\"budgetIncludesLiving\":\"false\"}'::jsonb WHERE session_id=?",session);
        var profile=sessionRepository.profile(owner,session,1);
        var state=new com.yangdoujiao.website.planningagent.agent.ToolDispatcher.State(profile,()->{});
        dispatcher.dispatch(new com.yangdoujiao.website.planningagent.agent.ToolCall("search_programmes",json.readTree("{}")),state);
        dispatcher.dispatch(new com.yangdoujiao.website.planningagent.agent.ToolCall("get_programme_evidence",json.valueToTree(Map.of("programmeId",programme))),state);
        var generated=validator.validate(new com.yangdoujiao.website.planningagent.agent.PlanDraft(1,List.of(programme),List.of(source,feesSource),List.of()),
                new com.yangdoujiao.website.planningagent.agent.ModelContext(List.of(),profile,state.results(),Instant.now().plusSeconds(60)),state);
        assertThat(generated.sourceFingerprint()).matches("[a-f0-9]{64}");
        var response=new com.yangdoujiao.website.planningagent.agent.PlanningOrchestrator.Response("PLAN",List.of(),generated);
        jdbc.update("UPDATE planning_runs SET result=? WHERE id=?",json.writeValueAsString(response),run);
        return new SourceRun(programme,source,condition,fee,university,category,level);
    }
    @Test void legacyRunsWithoutGenerationFingerprintAreExplicitlyUnverified() {
        var id=plans.save(owner,session,request("legacy")).planId();
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("GENERATION_SOURCES_UNVERIFIED");
    }
    @Test @org.springframework.transaction.annotation.Transactional
    void changesBetweenGenerationAndSaveCannotBlessOutdatedFactsAsCurrent() {
        var fixture=sourceRun();
        jdbc.update("UPDATE planning_rule_conditions SET expected='80' WHERE id=?",fixture.condition());
        jdbc.update("UPDATE planning_fees SET amount=200 WHERE id=?",fixture.fee());
        var id=plans.save(owner,session,request("changed-before-save")).planId();
        var view=plans.get(owner,id);
        assertThat(view.revalidationWarnings()).contains("SOURCE_DATA_CHANGED");
        assertThat(view.snapshot().plan().programmes().getFirst().budget().subtotals().get("MYR")).isEqualByComparingTo("100");
        assertThat(view.snapshot().plan().programmes().getFirst().ruleSnapshot().alternatives().getFirst().getFirst().expected()).isEqualTo("70");
        assertThat(view.snapshot().plan().programmes().getFirst().assessment().eligible()).isTrue();
        assertThat(plans.get(owner,id)).isEqualTo(view);
    }
    @Test @org.springframework.transaction.annotation.Transactional
    void sameIdEvidenceRuleFeeAndPublicationChangesWarnWithoutRewritingSnapshot() {
        var fixture=sourceRun();
        long programme=fixture.programme(),source=fixture.source(),condition=fixture.condition(),fee=fixture.fee();
        long university=fixture.university(),category=fixture.category(),level=fixture.level();
        var id=plans.save(owner,session,request("save")).planId();
        var original=plans.get(owner,id).snapshot();
        assertThat(plans.get(owner,id).revalidationWarnings()).isEmpty();
        jdbc.update("UPDATE planning_rule_conditions SET expected='80' WHERE id=?",condition);
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("SOURCE_DATA_CHANGED");
        jdbc.update("UPDATE planning_rule_conditions SET expected='70' WHERE id=?",condition);
        jdbc.update("UPDATE planning_fees SET amount=200 WHERE id=?",fee);
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("SOURCE_DATA_CHANGED");
        jdbc.update("UPDATE planning_fees SET amount=100 WHERE id=?",fee);
        jdbc.update("UPDATE planning_evidence SET excerpt='Changed same ID' WHERE id=?",source);
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("SOURCE_DATA_CHANGED");
        jdbc.update("UPDATE planning_evidence SET expires_at=CURRENT_TIMESTAMP-INTERVAL '1 day' WHERE id=?",source);
        jdbc.update("UPDATE programmes SET status='DRAFT' WHERE id=?",programme);
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("SOURCE_DATA_CHANGED","EVIDENCE_REVIEW_REQUIRED:"+source,"PROGRAMME_UNAVAILABLE:"+programme);
        assertThat(plans.get(owner,id).snapshot()).isEqualTo(original);
        long movedProgramme=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,slug,name_en,status) VALUES(?,?,?,?,?,'Other source course','PUBLISHED') RETURNING id",
                Long.class,"S_"+UUID.randomUUID().toString().replace("-","").toUpperCase(),university,category,level,"source-"+UUID.randomUUID());
        jdbc.update("DELETE FROM planning_fees WHERE id=?",fee);
        jdbc.update("UPDATE planning_evidence SET programme_id=? WHERE id=?",movedProgramme,source);
        assertThat(plans.get(owner,id).revalidationWarnings()).contains("SOURCE_DATA_CHANGED");
        assertThat(plans.get(owner,id).snapshot()).isEqualTo(original);
    }
    String bearer(long user) {
        String token=UUID.randomUUID().toString();
        jdbc.update("INSERT INTO miniapp_auth_tokens(user_account_id,token_hash,token_kind,family_id,expires_at) VALUES(?,?,'ACCESS',?,CURRENT_TIMESTAMP+INTERVAL '1 hour')",user,com.yangdoujiao.website.auth.AuthHash.sha256(token),UUID.randomUUID());
        return "Bearer "+token;
    }
    @Test void authenticatedCapabilityHasOnlyBooleansAndDisabledFeatureStillReadsOwnedHistory() throws Exception {
        var id=plans.save(owner,session,request("saved")).planId();
        String prefix="/api/v1/miniapp/me/planning-agent";
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(prefix+"/capability"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(prefix+"/capability").header("Authorization",bearer(owner)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(result->{
                    var body=json.readTree(result.getResponse().getContentAsString());
                    assertThat(body.propertyNames()).containsExactlyInAnyOrder("enabled","available","privacyVersion");
                    assertThat(body.get("enabled").booleanValue()).isFalse();
                    assertThat(body.get("available").booleanValue()).isFalse();
                    assertThat(body.get("privacyVersion").isNull()).isTrue();
                });
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(prefix+"/plans/"+id).header("Authorization",bearer(owner)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(prefix+"/plans/"+id).header("Authorization",bearer(other)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isNotFound());
    }
    @Test void consultationAndIdempotencyMappingRollbackTogetherWhenMappingWriteFails() {
        var id=plans.save(owner,session,request("save")).planId();
        jdbc.execute("CREATE FUNCTION task6_reject_share() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test mapping failure'; END; $$");
        jdbc.execute("CREATE TRIGGER task6_reject_share BEFORE INSERT ON planning_plan_consultations FOR EACH ROW EXECUTE FUNCTION task6_reject_share()");
        try {
            var contact=new ConsultationRequest("Alice","13800138000",null,null,null,"Confirmed summary","zh",true);
            assertThatThrownBy(()->plans.consult(owner,id,new PlanningPlanService.ShareRequest(true,"rollback",contact))).isInstanceOf(org.springframework.dao.DataAccessException.class);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isZero();
            assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_plan_consultations WHERE plan_id=?",Integer.class,id)).isZero();
        } finally {
            jdbc.execute("DROP TRIGGER task6_reject_share ON planning_plan_consultations");
            jdbc.execute("DROP FUNCTION task6_reject_share()");
        }
    }
}
