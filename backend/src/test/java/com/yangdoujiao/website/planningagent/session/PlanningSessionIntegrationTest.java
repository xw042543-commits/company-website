package com.yangdoujiao.website.planningagent.session;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.auth.AuthHash;
import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import static com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;

@SpringBootTest(properties={"app.planning-agent.enabled=true","app.planning-agent.privacy-version=planning-v1","app.planning-agent.scheduling-enabled=false",
        "app.miniapp.auth.enabled=true","app.miniapp.auth.local-provider-enabled=true",
        "app.miniapp.auth.local-test-code=planning-test-code","app.miniapp.auth.local-test-subject=planning-test-subject"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class PlanningSessionIntegrationTest {
    @Autowired PlanningSessionService service;
    @Autowired PlanningSessionRepository repository;
    @Autowired com.yangdoujiao.website.planningagent.security.PlanningLimits limits;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    long owner;
    long other;
    @BeforeEach void users() { owner=createUser(); other=createUser(); }
    @AfterEach void cleanup() {
        jdbc.update("DELETE FROM miniapp_auth_tokens WHERE user_account_id IN (?,?)",owner,other);
        jdbc.update("DELETE FROM user_accounts WHERE id IN (?,?)",owner,other);
    }
    String bearer(long id) {
        String token=UUID.randomUUID().toString();
        jdbc.update("INSERT INTO miniapp_auth_tokens(user_account_id,token_hash,token_kind,family_id,expires_at) VALUES(?,?,'ACCESS',?,CURRENT_TIMESTAMP+INTERVAL '1 hour')",id,AuthHash.sha256(token),UUID.randomUUID());
        return "Bearer "+token;
    }
    long createUser() { return jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Planning tester','ACTIVE','v1','v1') RETURNING id",Long.class); }
    UUID session() { return service.create(owner,new CreateSession("AGE_18_PLUS","planning-v1")).id(); }
    MessageRequest chat(String key,String text) { return new MessageRequest(key,text,Intent.CHAT); }
    void code(String code,Runnable action) { assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,e -> assertThat(e.getCode()).isEqualTo(code)); }

    @Test void unauthenticatedHttpRouteRequiresLogin() throws Exception {
        mvc.perform(post("/api/v1/miniapp/me/planning-agent/sessions").contentType("application/json").content("{\"ageBand\":\"AGE_18_PLUS\",\"privacyVersion\":\"planning-v1\"}")).andExpect(status().isUnauthorized());
    }
    @Test void acceptedRetryAndRestoredRunsExposeTheSamePersistedDeadline() throws Exception {
        UUID id=session(); var accepted=service.message(owner,id,chat("deadline","hello"));
        Instant deadline=jdbc.queryForObject("SELECT deadline FROM planning_runs WHERE id=?",java.sql.Timestamp.class,accepted.runId()).toInstant();
        String prefix="/api/v1/miniapp/me/planning-agent/sessions/"+id;
        String principal=bearer(owner);
        mvc.perform(post(prefix+"/messages").header("Authorization",principal).contentType("application/json")
                .content("{\"requestKey\":\"deadline\",\"text\":\"hello\",\"intent\":\"CHAT\"}"))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.deadline").value(deadline.toString()));
        mvc.perform(get(prefix+"/runs/"+accepted.runId()).header("Authorization",principal))
                .andExpect(status().isOk()).andExpect(jsonPath("$.deadline").value(deadline.toString()));
        mvc.perform(get(prefix).header("Authorization",principal))
                .andExpect(status().isOk()).andExpect(jsonPath("$.runs[0].deadline").value(deadline.toString()));
    }
    @Test void authenticatedHttpUsesPrincipalOwnershipAndIgnoresSuppliedOwner() throws Exception {
        String principal=bearer(owner);
        UUID id=session(); var accepted=service.message(owner,id,chat("http","hello"));
        String foreign=bearer(other);
        String prefix="/api/v1/miniapp/me/planning-agent/sessions/"+id;
        mvc.perform(get(prefix).header("Authorization",principal)).andExpect(status().isOk()).andExpect(jsonPath("$.messages[0].text").value("hello"));
        mvc.perform(get(prefix).header("Authorization",foreign)).andExpect(status().isNotFound());
        mvc.perform(get(prefix+"/runs/"+accepted.runId()).header("Authorization",foreign)).andExpect(status().isNotFound());
        mvc.perform(delete(prefix).header("Authorization",foreign)).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/miniapp/me/planning-agent/sessions").header("Authorization",principal).contentType("application/json")
                .content("{\"ageBand\":\"AGE_18_PLUS\",\"privacyVersion\":\"planning-v1\",\"ownerId\":"+other+"}"))
                .andExpect(status().isCreated());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_sessions WHERE owner_id=?",Integer.class,other)).isZero();
    }
    @Test void frontendScoreContractAndHistoricalAliasesSurviveConfirmationPrivacyAndRealEvaluation() throws Exception {
        var json = new tools.jackson.databind.ObjectMapper();
        var request = json.treeToValue(json.readTree(getClass().getResourceAsStream("/planning-score-contract.json")).get("profile"), ProfileConfirmation.class);
        var legacy = new LinkedHashMap<>(request.facts());
        legacy.put("grade.scale","PERCENT"); legacy.put("math.scale","GPA4"); legacy.put("science.scale","GPA5");
        code("INVALID_PROFILE", () -> service.confirm(owner,session(),new ProfileConfirmation(0,Map.of("grade","80","grade.scale","UNKNOWN"))));
        String principal = bearer(owner);
        for (var facts : List.of(request.facts(), legacy)) {
            UUID id = session(); String prefix = "/api/v1/miniapp/me/planning-agent/sessions/"+id;
            mvc.perform(post(prefix+"/profile-confirmation").header("Authorization",principal).contentType("application/json")
                    .content(json.writeValueAsString(new ProfileConfirmation(0,facts))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.confirmedVersion").value(1));
            var profile = repository.profile(owner,id,1);
            assertThat(profile.facts()).containsExactlyInAnyOrderEntriesOf(request.facts());
            var now = Instant.now();
            var sanitized = new com.yangdoujiao.website.planningagent.security.PlanningPrivacyFilter().sanitize(
                    new RunInput(UUID.randomUUID(),id,owner,Intent.GENERATE,"生成方案",profile,List.of(),now.plusSeconds(60)),List.of()).confirmedProfile();
            assertThat(sanitized.facts()).containsExactlyInAnyOrderEntriesOf(request.facts());
            var rules = new RuleSet(1,1,true,List.of(List.of(new Condition("grade","GTE","70","100",7),
                    new Condition("math","GTE","3","4",7),new Condition("science","GTE","4","5",7))));
            var evidence = new com.yangdoujiao.website.planningagent.evidence.Evidence(7,1,"ADMISSIONS","https://example.edu/synthetic",
                    "OFFICIAL","CN_MAINLAND","2027-02",now,null,"VERIFIED",3L,"Synthetic score contract, not admissions data",false);
            var assessment = new com.yangdoujiao.website.planningagent.eligibility.EligibilityEvaluator().evaluate(
                    sanitized,rules,Map.of(7L,evidence),now,"2027-02");
            assertThat(assessment.eligible()).isTrue();
            assertThat(assessment.alternatives().getFirst()).extracting(Finding::status).containsExactly(Status.MET,Status.MET,Status.MET);
        }
    }
    @Test void disabledFeatureRejectsRequestsBeforeCreatingPersistentState() {
        var disabled=new PlanningSessionService(repository,Clock.systemUTC(),false,"planning-v1",limits);
        code("PLANNING_DISABLED",() -> disabled.create(owner,new CreateSession("AGE_18_PLUS","planning-v1")));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_sessions WHERE owner_id=?",Integer.class,owner)).isZero();
    }
    @Test void enforcesAgeAndCurrentPrivacyConsent() {
        code("AGE_RESTRICTED",() -> service.create(owner,new CreateSession("UNDER_14","planning-v1")));
        code("PRIVACY_CONSENT_REQUIRED",() -> service.create(owner,new CreateSession("AGE_14_17","old")));
        assertThat(service.create(owner,new CreateSession("AGE_14_17","planning-v1")).id()).isNotNull();
    }
    @Test void ownershipAndRunSessionJoinProtectEveryReadAndDelete() {
        UUID id=session(); var run=service.message(owner,id,chat("one","hello")); UUID second=session();
        code("NOT_FOUND",() -> service.get(other,id));
        code("NOT_FOUND",() -> service.delete(other,id));
        code("NOT_FOUND",() -> service.run(other,id,run.runId()));
        code("NOT_FOUND",() -> service.run(owner,second,run.runId()));
        code("NOT_FOUND",() -> service.message(other,id,chat("bad","hello")));
        code("NOT_FOUND",() -> service.confirm(other,id,new ProfileConfirmation(0,Map.of("qualification","HIGH_SCHOOL"))));
        assertThat(service.get(owner,id).messages()).hasSize(1);
        service.delete(owner,id); code("NOT_FOUND",() -> service.get(owner,id));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_runs WHERE session_id=?",Integer.class,id)).isZero();
    }
    @Test void idempotencyReturnsOriginalAndMismatchOrActiveRunConflictsWithoutExtraMessages() {
        UUID id=session(); var request=chat("same","hello"); var first=service.message(owner,id,request);
        assertThat(service.message(owner,id,request)).isEqualTo(first);
        code("IDEMPOTENCY_CONFLICT",() -> service.message(owner,id,chat("same","changed")));
        code("RUN_ACTIVE",() -> service.message(owner,id,chat("next","hello")));
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    @Test void concurrentSameKeyCreatesOnlyOneRunAndMessage() throws Exception {
        UUID id=session(); var gate=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            Callable<RunAccepted> call=() -> { gate.await(); return service.message(owner,id,chat("parallel","hello")); };
            var a=executor.submit(call); var b=executor.submit(call); gate.countDown();
            assertThat(a.get(10,TimeUnit.SECONDS).runId()).isEqualTo(b.get(10,TimeUnit.SECONDS).runId());
        }
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    @Test void generationRequiresCurrentConfirmedProfileAndRejectsSensitiveUnknownFields() {
        UUID id=session();
        code("PROFILE_CONFIRMATION_REQUIRED",() -> service.message(owner,id,new MessageRequest("generate","plan",Intent.GENERATE)));
        code("INVALID_PROFILE",() -> service.confirm(owner,id,new ProfileConfirmation(0,Map.of("passport","secret"))));
        assertThat(service.confirm(owner,id,new ProfileConfirmation(0,Map.of("qualification","HIGH_SCHOOL"))).confirmedVersion()).isEqualTo(1);
        code("PROFILE_VERSION_CONFLICT",() -> service.confirm(owner,id,new ProfileConfirmation(0,Map.of("qualification","MASTER"))));
        assertThat(service.message(owner,id,new MessageRequest("generate","plan",Intent.GENERATE)).status()).isEqualTo("QUEUED");
        assertThat(service.get(owner,id).profile().facts()).containsEntry("qualification","HIGH_SCHOOL");
    }
}
