package com.yangdoujiao.website.planningagent.security;

import static org.assertj.core.api.Assertions.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.planningagent.agent.*;
import com.yangdoujiao.website.planningagent.config.PlanningAgentProperties;
import com.yangdoujiao.website.planningagent.session.*;
import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;

@SpringBootTest(properties={"app.planning-agent.enabled=true","app.planning-agent.scheduling-enabled=false",
        "app.planning-agent.vendor=openai","app.planning-agent.processing-region=test-approved","app.planning-agent.privacy-version=current",
        "app.planning-agent.daily-cost-cap=10","app.planning-agent.worst-case-run-cost=1","app.planning-agent.daily-token-cap=2000000",
        "app.planning-agent.max-input-tokens=512","app.planning-agent.max-output-tokens=1000"})
@ActiveProfiles("test") @Import({TestContainersConfiguration.class,PlanningProviderIntegrationTest.ProviderConfiguration.class})
class PlanningProviderIntegrationTest {
    @TestConfiguration @Profile("test")
    static class ProviderConfiguration {
        @Bean ScriptedProvider scriptedProvider() { return new ScriptedProvider(); }
    }
    static class ScriptedProvider implements PlanningAgentProperties.ApprovedProvider {
        final AtomicInteger calls=new AtomicInteger();
        volatile ModelContext captured;
        volatile boolean repair;
        public String vendor() { return "openai"; }
        public String processingRegion() { return "test-approved"; }
        public boolean pricingAndPrivacyApproved() { return true; }
        public AgentReply next(ModelContext context,int maxInput,int maxOutput) {
            assertThat(maxInput).isEqualTo(512);assertThat(maxOutput).isEqualTo(1000);
            captured=context;
            if(calls.incrementAndGet()==1 && repair) return null;
            return new AgentReply(List.of("BUDGET"),List.of(),null);
        }
    }
    @Autowired PlanningSessionService sessions;
    @Autowired PlanningWorker worker;
    @Autowired ScriptedProvider provider;
    @Autowired JdbcTemplate jdbc;
    @Autowired org.springframework.transaction.support.TransactionTemplate transactions;
    @Autowired PlanningCleanup planningCleanup;
    @Autowired com.yangdoujiao.website.planningagent.plan.PlanningPlanController planController;
    @Autowired com.yangdoujiao.website.auth.account.UserAccountRepository accounts;
    long owner;
    UUID session;
    @BeforeEach void fixture() {
        provider.calls.set(0);provider.repair=false;provider.captured=null;
        owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Never sent name','ACTIVE','v1','v1') RETURNING id",Long.class);
        session=sessions.create(owner,new CreateSession("AGE_18_PLUS","current")).id();
    }
    @AfterEach void cleanup() { jdbc.update("DELETE FROM user_accounts WHERE id=?",owner); }
    @Test void actualWorkerUsesPrivacyBeanAndRepairReusesOneConservativeReservation() {
        sessions.confirm(owner,session,new ProfileConfirmation(0,Map.of("targetLevel","MASTER","institution","Private Alice School","budget","50000","intake","2027")));
        provider.repair=true;
        var request=new MessageRequest("same","plan alice@example.com 13800138000",Intent.GENERATE);
        var run=sessions.message(owner,session,request);
        assertThat(sessions.message(owner,session,request)).isEqualTo(run);
        worker.runOnce();
        assertThat(sessions.run(owner,session,run.runId()).status()).isEqualTo("SUCCEEDED");
        assertThat(provider.captured.redactedMessages()).containsExactly("plan");
        assertThat(provider.captured.confirmedProfile().facts()).containsExactlyInAnyOrderEntriesOf(Map.of("targetLevel","MASTER","budget","50000","intake","2027"));
        assertThat(jdbc.queryForObject("SELECT calls FROM planning_reservations WHERE run_id=?",Integer.class,run.runId())).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_reservations WHERE owner_id=?",Integer.class,owner)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT cost FROM planning_reservations WHERE run_id=?",java.math.BigDecimal.class,run.runId())).isEqualByComparingTo("1");
        assertThat(jdbc.queryForObject("SELECT used FROM planning_usage WHERE owner_id=? AND bucket LIKE 'minute:%'",Integer.class,owner)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT used FROM planning_usage WHERE owner_id=? AND bucket LIKE 'day:%'",Integer.class,owner)).isEqualTo(1);
    }
    @Test void personalNarrativeFailsActionablyBeforeProviderOrReservation() {
        var run=sessions.message(owner,session,new MessageRequest("private","My name is Alice and my passport is A12345678",Intent.CHAT));
        worker.runOnce();
        assertThat(sessions.run(owner,session,run.runId()).errorCode()).isEqualTo("STRUCTURED_INPUT_REQUIRED");
        assertThat(provider.calls.get()).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_reservations WHERE owner_id=?",Integer.class,owner)).isZero();
    }
    @Test void queuedRunLosesPermissionWhenPrivacyNoticeChangesBeforeExecution() {
        var run=sessions.message(owner,session,new MessageRequest("old","plan",Intent.CHAT));
        jdbc.update("UPDATE planning_sessions SET privacy_version='old' WHERE id=?",session);
        worker.runOnce();
        assertThat(sessions.run(owner,session,run.runId()).errorCode()).isEqualTo("PRIVACY_CONSENT_REQUIRED");
        assertThat(provider.calls.get()).isZero();
    }
    @Test void serializedInputCeilingPreventsProviderTransmission() {
        Map<String,String> facts=new HashMap<>();
        for(String field:List.of("grade","languageTotal","languageListening","languageReading","languageWriting","languageSpeaking","math","science","budget","transferCredits")) facts.put(field,"999999999");
        for(String field:List.of("grade.scale","languageTotal.scale","languageListening.scale","languageReading.scale","languageWriting.scale","languageSpeaking.scale","math.scale","science.scale")) facts.put(field,"PERCENT");
        facts.put("targetLevel","MASTER");facts.put("qualification","HIGH_SCHOOL");facts.put("intake","2027");
        sessions.confirm(owner,session,new ProfileConfirmation(0,facts));
        var run=sessions.message(owner,session,new MessageRequest("large","plan",Intent.CHAT));
        worker.runOnce();
        assertThat(sessions.run(owner,session,run.runId()).errorCode()).isEqualTo("MODEL_INPUT_TOO_LARGE");
        assertThat(provider.calls.get()).isZero();
    }
    @Test void deletedAccountCannotResurrectPlanningSessions() {
        jdbc.update("UPDATE user_accounts SET status='DELETED',deleted_at=CURRENT_TIMESTAMP WHERE id=?",owner);
        assertThatThrownBy(()->sessions.create(owner,new CreateSession("AGE_18_PLUS","current")))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,e->assertThat(e.getCode()).isEqualTo("AUTH_REQUIRED"));
    }
    @Test void approvedAvailableCapabilityExposesCurrentPublicConsentVersion() {
        var capability=planController.capability(com.yangdoujiao.website.auth.session.UserPrincipal.from(accounts.findById(owner).orElseThrow()));
        assertThat(capability.enabled()).isTrue();
        assertThat(capability.available()).isTrue();
        assertThat(capability.privacyVersion()).isEqualTo("current");
    }
    @Test void sessionCreationWaitingForAccountDeletionCannotRecreatePurgedData() throws Exception {
        var locked=new java.util.concurrent.CountDownLatch(1);
        var release=new java.util.concurrent.CountDownLatch(1);
        try(var executor=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var deletion=executor.submit(()->transactions.executeWithoutResult(status->{
                jdbc.queryForObject("SELECT id FROM user_accounts WHERE id=? FOR UPDATE",Long.class,owner);
                jdbc.update("UPDATE user_accounts SET status='DELETED',deleted_at=CURRENT_TIMESTAMP WHERE id=?",owner);
                planningCleanup.purgeOwner(owner);locked.countDown();
                try { if(!release.await(5,java.util.concurrent.TimeUnit.SECONDS)) throw new IllegalStateException("release timeout"); }
                catch(InterruptedException e) { throw new IllegalStateException(e); }
            }));
            assertThat(locked.await(5,java.util.concurrent.TimeUnit.SECONDS)).isTrue();
            var creation=executor.submit(()->sessions.create(owner,new CreateSession("AGE_18_PLUS","current")));
            try {
                assertThatThrownBy(()->creation.get(100,java.util.concurrent.TimeUnit.MILLISECONDS)).isInstanceOf(java.util.concurrent.TimeoutException.class);
            } finally { release.countDown(); }
            deletion.get(5,java.util.concurrent.TimeUnit.SECONDS);
            assertThatThrownBy(()->creation.get(5,java.util.concurrent.TimeUnit.SECONDS))
                    .hasCauseInstanceOf(com.yangdoujiao.website.common.exception.ApiException.class);
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_sessions WHERE owner_id=?",Integer.class,owner)).isZero();
    }
}
