package com.yangdoujiao.website.planningagent.security;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.planningagent.config.PlanningAgentProperties;

@SpringBootTest(properties="app.planning-agent.scheduling-enabled=false")
@ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class PlanningLimitsTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired TransactionTemplate transactions;
    final Instant now=Instant.parse("2040-01-01T15:59:30Z");
    long owner,other;
    UUID session,second;
    PlanningLimits limits;
    PlanningAgentProperties properties() {
        return new PlanningAgentProperties(true,"openai","approved-region","v1",new BigDecimal("1"),2000,
                new BigDecimal("1"),100,100);
    }
    @BeforeEach void fixture() {
        owner=user();other=user();session=session(owner);second=session(other);
        limits=new PlanningLimits(jdbc,transactions,Clock.fixed(now,ZoneOffset.UTC),properties());
    }
    long user() { return jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Limits','ACTIVE','v1','v1') RETURNING id",Long.class); }
    UUID session(long owner) {
        UUID id=UUID.randomUUID();jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',CURRENT_TIMESTAMP)",id,owner);return id;
    }
    UUID run(UUID session) {
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO planning_runs(id,session_id,request_key,request_hash,intent,status,created_at,deadline,lease_token,lease_until) VALUES(?,?,?,?,'CHAT','RUNNING',?,?,?,?)",
                id,session,id.toString(),"b".repeat(64),java.sql.Timestamp.from(now),java.sql.Timestamp.from(now.plusSeconds(60)),UUID.randomUUID(),java.sql.Timestamp.from(now.plusSeconds(60)));
        return id;
    }
    @AfterEach void cleanup() {
        jdbc.update("DELETE FROM user_accounts WHERE id IN (?,?)",owner,other);
        jdbc.update("DELETE FROM planning_daily_budget WHERE day IN ('2040-01-01','2040-01-02')");
    }
    void code(String expected,Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,e->assertThat(e.getCode()).isEqualTo(expected));
    }
    @Test void dailyTenAndMinuteTwentyAreAtomicAndShanghaiDayResets() {
        for(int i=0;i<10;i++) transactions.executeWithoutResult(s->limits.admit(owner,true));
        code("GENERATION_DAILY_LIMIT",()->transactions.executeWithoutResult(s->limits.admit(owner,true)));
        for(int i=0;i<10;i++) transactions.executeWithoutResult(s->limits.admit(owner,false));
        code("MESSAGE_RATE_LIMIT",()->transactions.executeWithoutResult(s->limits.admit(owner,false)));
        var tomorrow=new PlanningLimits(jdbc,transactions,Clock.fixed(now.plusSeconds(60),ZoneOffset.UTC),properties());
        transactions.executeWithoutResult(s->tomorrow.admit(owner,true));
        assertThat(jdbc.queryForObject("SELECT used FROM planning_usage WHERE owner_id=? AND bucket='day:2040-01-02'",Integer.class,owner)).isEqualTo(1);
    }
    @Test void sameRunRetriesDebitOnceButStopAfterTenActualCalls() {
        UUID run=run(session);
        for(int i=0;i<10;i++) limits.beforeCall(owner,session,run);
        code("MODEL_CALL_LIMIT",()->limits.beforeCall(owner,session,run));
        assertThat(jdbc.queryForObject("SELECT cost FROM planning_daily_budget WHERE day='2040-01-01'",BigDecimal.class)).isEqualByComparingTo("1");
        assertThat(jdbc.queryForObject("SELECT tokens FROM planning_daily_budget WHERE day='2040-01-01'",Long.class)).isEqualTo(2000);
        UUID next=run(second);
        code("GLOBAL_BUDGET_EXHAUSTED",()->limits.beforeCall(other,second,next));
    }
    @Test void competingOwnersCannotOverspendTheGlobalBudget() throws Exception {
        var gate=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            Callable<String> one=()->attempt(gate,owner,session);
            Callable<String> two=()->attempt(gate,other,second);
            var a=executor.submit(one);var b=executor.submit(two);gate.countDown();
            assertThat(List.of(a.get(10,TimeUnit.SECONDS),b.get(10,TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder("OK","GLOBAL_BUDGET_EXHAUSTED");
        }
        assertThat(jdbc.queryForObject("SELECT cost FROM planning_daily_budget WHERE day='2040-01-01'",BigDecimal.class)).isEqualByComparingTo("1");
    }
    String attempt(CountDownLatch gate,long owner,UUID session) throws Exception {
        UUID id=run(session);
        gate.await();try { limits.beforeCall(owner,session,id);return "OK"; }
        catch(ApiException exception) { return exception.getCode(); }
    }
    @Test void stalePrivacyConsentCannotReserveBudget() {
        jdbc.update("UPDATE planning_sessions SET privacy_version='old' WHERE id=?",session);
        code("PRIVACY_CONSENT_REQUIRED",()->limits.beforeCall(owner,session,UUID.randomUUID()));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_reservations WHERE owner_id=?",Integer.class,owner)).isZero();
    }
    @Test void reservationCannotBeBorrowedByAnotherOwnedSessionOrInventedRun() {
        UUID another=session(owner);
        code("RUN_NOT_ACTIVE",()->limits.beforeCall(owner,another,UUID.randomUUID()));
    }
    @Test void plausibleVendorStringAndScriptedFunctionCannotEnableProduction() {
        assertThat(properties().available(context->null)).isFalse();
        assertThat(properties().available(null)).isFalse();
    }
    @Test void concurrentAdmissionCannotExceedTenDailyGenerations() throws Exception {
        var gate=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> outcomes=new ArrayList<>();
            for(int i=0;i<12;i++) outcomes.add(executor.submit(()->{
                gate.await();try { transactions.executeWithoutResult(s->limits.admit(owner,true));return "OK"; }
                catch(ApiException exception) { return exception.getCode(); }
            }));
            gate.countDown();List<String> values=new ArrayList<>();
            for(var outcome:outcomes) values.add(outcome.get(10,TimeUnit.SECONDS));
            assertThat(values.stream().filter("OK"::equals)).hasSize(10);
            assertThat(values.stream().filter("GENERATION_DAILY_LIMIT"::equals)).hasSize(2);
        }
    }
}
