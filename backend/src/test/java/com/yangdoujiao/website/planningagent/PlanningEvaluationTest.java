package com.yangdoujiao.website.planningagent;

import static org.assertj.core.api.Assertions.*;
import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;

import java.time.*;
import java.util.*;
import java.util.stream.Stream;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationRequest;
import com.yangdoujiao.website.planningagent.agent.*;
import com.yangdoujiao.website.planningagent.plan.PlanningPlanService;
import com.yangdoujiao.website.planningagent.session.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityEvaluator;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;
import com.yangdoujiao.website.planningagent.evidence.Evidence;
import com.yangdoujiao.website.planningagent.budget.BudgetCalculator;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.*;

/** Synthetic offline acceptance only. No provider bean or production data is used. */
@SpringBootTest(properties={"app.planning-agent.enabled=true","app.planning-agent.privacy-version=planning-v1",
        "app.planning-agent.scheduling-enabled=false","app.consultation.submission-enabled=true",
        "app.consultation.privacy-notice-version=v1"})
@ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class PlanningEvaluationTest {
    static final ObjectMapper FIXTURE_JSON=JsonMapper.builder().findAndAddModules().build();
    @Autowired PlanningSessionService sessions;
    @Autowired PlanningSessionRepository repository;
    @Autowired PlanningPlanService plans;
    @Autowired PlanningCleanup cleanup;
    @Autowired ToolDispatcher dispatcher;
    @Autowired PlanValidator validator;
    @Autowired com.yangdoujiao.website.planningagent.security.PlanningPrivacyFilter privacy;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    long owner, university, programme, category, admissions, fees, country, level;
    boolean createdCountry, createdLevel;
    String subject;

    @BeforeEach void fixture() {
        owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Synthetic offline tester','ACTIVE','v1','v1') RETURNING id",Long.class);
        subject="EVAL_"+UUID.randomUUID().toString().replace("-", "").toUpperCase();
        category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?,'Synthetic evaluation') RETURNING id",Long.class,subject);
        createdCountry=!jdbc.queryForList("INSERT INTO countries(code,name_en,continent_code) VALUES('MY','Malaysia','ASIA') ON CONFLICT(code) DO NOTHING RETURNING id",Long.class).isEmpty();
        createdLevel=!jdbc.queryForList("INSERT INTO study_levels(code,name_en,status) VALUES('MASTER','Master','PUBLISHED') ON CONFLICT(code) DO NOTHING RETURNING id",Long.class).isEmpty();
        country=jdbc.queryForObject("SELECT id FROM countries WHERE code='MY'",Long.class);
        level=jdbc.queryForObject("SELECT id FROM study_levels WHERE code='MASTER'",Long.class);
        university=jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES('Synthetic university',?,'Malaysia',?,'PUBLISHED') RETURNING id",Long.class,"eval-"+UUID.randomUUID(),country);
        programme=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,slug,name_en,status) VALUES(?,?,?,?,?,'Synthetic course','PUBLISHED') RETURNING id",Long.class,subject,university,category,level,"eval-"+UUID.randomUUID());
        admissions=evidence("ADMISSIONS"); fees=evidence("FEES");
        long rule=jdbc.queryForObject("INSERT INTO planning_rule_sets(programme_id,version,complete,active) VALUES(?,1,true,true) RETURNING id",Long.class,programme);
        jdbc.update("INSERT INTO planning_rule_conditions(rule_set_id,branch_no,field,operator,expected,scale,evidence_id) VALUES(?,0,'grade','GTE','70','100',?)",rule,admissions);
        jdbc.update("INSERT INTO planning_fees(programme_id,evidence_id,category,amount,currency,period,units,coverage_complete) VALUES(?,?,'TUITION',10000,'MYR','YEAR',2,true),(?,?,'TAX',0,'MYR','TOTAL',1,true)",programme,fees,programme,fees);
    }
    long evidence(String type) {
        return jdbc.queryForObject("INSERT INTO planning_evidence(programme_id,fact_type,source_url,source_type,student_scope,intake,checked_at,expires_at,review_status,reviewer_id,excerpt) VALUES(?,?,'https://example.edu/synthetic','OFFICIAL','CN_MAINLAND','2027-09',CURRENT_TIMESTAMP-INTERVAL '1 day',CURRENT_TIMESTAMP+INTERVAL '30 days','VERIFIED',1,'SYNTHETIC: not official admissions data') RETURNING id",Long.class,programme,type);
    }
    @AfterEach void removeFixture() {
        cleanup.purgeOwner(owner);
        jdbc.update("DELETE FROM consultation_enquiries WHERE user_account_id=?",owner);
        jdbc.update("DELETE FROM user_accounts WHERE id=?",owner);
        jdbc.update("DELETE FROM planning_rule_conditions WHERE rule_set_id IN (SELECT id FROM planning_rule_sets WHERE programme_id=?)",programme);
        jdbc.update("DELETE FROM planning_rule_sets WHERE programme_id=?",programme);
        jdbc.update("DELETE FROM planning_fees WHERE programme_id=?",programme);
        jdbc.update("DELETE FROM planning_evidence WHERE programme_id=?",programme);
        jdbc.update("DELETE FROM programmes WHERE id=?",programme);
        jdbc.update("DELETE FROM universities WHERE id=?",university);
        jdbc.update("DELETE FROM subject_categories WHERE id=?",category);
        if(createdLevel) jdbc.update("DELETE FROM study_levels WHERE id=?",level);
        if(createdCountry) jdbc.update("DELETE FROM countries WHERE id=?",country);
    }
    Map<String,String> profile(String budget) {
        return Map.of("targetLevel","MASTER","education","BACHELOR","intake","2027-09","grade","70","grade.scale","100",
                "subject",subject,"budget",budget,"budgetCurrency","MYR","budgetPeriod","TOTAL","budgetIncludesLiving","false");
    }
    PlanningOrchestrator runner(PlanningModel model) {
        return new PlanningOrchestrator(model,dispatcher,validator,privacy,json,Clock.systemUTC());
    }
    PlanningOrchestrator scriptedRunner() {
        // Only the external model boundary is replaced. All tools, validation and persistence remain real.
        return runner(context->{
            assertThat(context.redactedMessages()).containsExactly("生成方案");
            assertThat(context.confirmedProfile().facts()).doesNotContainKey("subject");
            return switch(context.results().size()) {
                case 0 -> new AgentReply(List.of(),List.of(new ToolCall("search_programmes",json.readTree("{}"))),null);
                case 1 -> new AgentReply(List.of(),List.of(new ToolCall("get_programme_evidence",json.valueToTree(Map.of("programmeId",programme)))),null);
                case 2 -> new AgentReply(List.of(),List.of(),new PlanDraft(context.confirmedProfile().version(),List.of(programme),List.of(admissions,fees),List.of("PREPARE_DOCUMENTS")));
                default -> throw new AssertionError("Unexpected tool loop");
            };
        });
    }
    RunAccepted generate(UUID session,String key,PlanningOrchestrator runner) {
        var accepted=sessions.message(owner,session,new MessageRequest(key,"生成方案",Intent.GENERATE));
        new PlanningWorker(repository,Clock.systemUTC(),runner).runOnce();
        return accepted;
    }
    void code(String expected,Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,e->assertThat(e.getCode()).isEqualTo(expected));
    }
    @Test void confirmedBackgroundBudgetRevisionSaveConsultRetryAndPurgeUseRealServices() {
        UUID session=sessions.create(owner,new CreateSession("AGE_18_PLUS","planning-v1")).id();
        code("PROFILE_CONFIRMATION_REQUIRED",()->sessions.message(owner,session,new MessageRequest("early","生成方案",Intent.GENERATE)));
        sessions.confirm(owner,session,new ProfileConfirmation(0,profile("30000")));
        var first=generate(session,"first",scriptedRunner());
        assertThat(sessions.run(owner,session,first.runId()).status()).isEqualTo("SUCCEEDED");
        var firstResult=json.readValue(sessions.run(owner,session,first.runId()).result(),PlanningOrchestrator.Response.class);
        assertThat(firstResult.plan().profileVersion()).isEqualTo(1);
        assertThat(firstResult.plan().programmes()).singleElement().satisfies(p->{
            assertThat(p.classification()).isEqualTo("ELIGIBLE");
            assertThat(p.budget().subtotals().get("MYR")).isEqualByComparingTo("20000");
            assertThat(p.budget().complete()).isTrue();
        });
        assertThat(plans.list(owner)).isEmpty();
        sessions.confirm(owner,session,new ProfileConfirmation(1,profile("15000")));
        var second=generate(session,"second",scriptedRunner());
        assertThat(sessions.run(owner,session,second.runId()).status()).isEqualTo("SUCCEEDED");
        code("SUCCESSFUL_PLAN_REQUIRED",()->plans.save(owner,session,new PlanningPlanService.SaveRequest(first.runId(),true,"stale")));
        assertThatThrownBy(()->plans.save(owner,session,new PlanningPlanService.SaveRequest(second.runId(),false,"save"))).hasMessage("CONFIRMATION_REQUIRED");
        var saved=plans.save(owner,session,new PlanningPlanService.SaveRequest(second.runId(),true,"save"));
        assertThat(plans.save(owner,session,new PlanningPlanService.SaveRequest(second.runId(),true,"save"))).isEqualTo(saved);
        var view=plans.get(owner,saved.planId());
        assertThat(view.snapshot().profile().version()).isEqualTo(2);
        assertThat(view.snapshot().profile().facts()).containsEntry("budget","15000");
        assertThat(view.snapshot().plan().profileVersion()).isEqualTo(2);
        assertThat(view.snapshot().plan().programmes().getFirst().budget().subtotals().get("MYR")).isEqualByComparingTo("20000");
        assertThat(view.revalidationWarnings()).isEmpty();
        assertThat(sessions.run(owner,session,first.runId()).result()).isEqualTo(json.writeValueAsString(firstResult));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isZero();
        var contact=new ConsultationRequest("Synthetic tester","13800138000",null,null,null,"Synthetic confirmed summary","zh",true);
        assertThatThrownBy(()->plans.consult(owner,saved.planId(),new PlanningPlanService.ShareRequest(false,"share",contact))).hasMessage("CONFIRMATION_REQUIRED");
        var shared=plans.consult(owner,saved.planId(),new PlanningPlanService.ShareRequest(true,"share",contact));
        assertThat(plans.consult(owner,saved.planId(),new PlanningPlanService.ShareRequest(true,"share",contact)).referenceCode()).isEqualTo(shared.referenceCode());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isOne();
        cleanup.purgeOwner(owner);
        assertThat(plans.list(owner)).isEmpty();
        code("NOT_FOUND",()->sessions.get(owner,session));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_profiles WHERE session_id=?",Integer.class,session)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_messages WHERE session_id=?",Integer.class,session)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_runs WHERE session_id=?",Integer.class,session)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_plan_consultations WHERE plan_id=?",Integer.class,saved.planId())).isZero();
        // A separately confirmed consultation keeps the existing consultation lifecycle.
        assertThat(jdbc.queryForObject("SELECT count(*) FROM consultation_enquiries WHERE user_account_id=?",Integer.class,owner)).isOne();
    }
    @Test void missingOrFailingModelNeverCreatesAnAssistantPlanOrSaveableResult() {
        for(PlanningOrchestrator runner:List.of(runner(null),runner(context->{throw new IllegalStateException("synthetic provider failure");}))) {
            UUID session=sessions.create(owner,new CreateSession("AGE_18_PLUS","planning-v1")).id();
            sessions.confirm(owner,session,new ProfileConfirmation(0,profile("30000")));
            var accepted=generate(session,"failure",runner);
            var failed=sessions.run(owner,session,accepted.runId());
            assertThat(failed.status()).isEqualTo("FAILED");
            assertThat(failed.errorCode()).isIn("RUNNER_UNAVAILABLE","RUN_FAILED");
            assertThat(failed.result()).isNull();
            assertThat(sessions.get(owner,session).messages()).extracting(Message::role).containsExactly("USER");
            code("SUCCESSFUL_PLAN_REQUIRED",()->plans.save(owner,session,new PlanningPlanService.SaveRequest(accepted.runId(),true,"save-failed")));
        }
        assertThat(plans.list(owner)).isEmpty();
    }
    static JsonNode corpus() {
        try(var input=PlanningEvaluationTest.class.getResourceAsStream("/planning-agent/evaluation-cases.json")) {
            assertThat(input).as("Required synthetic evaluation corpus").isNotNull();
            return FIXTURE_JSON.readTree(input);
        } catch(java.io.IOException error) { throw new java.io.UncheckedIOException(error); }
    }
    static Stream<org.junit.jupiter.params.provider.Arguments> evaluationCases() {
        return corpus().get("cases").valueStream().map(c->org.junit.jupiter.params.provider.Arguments.of(c.get("id").asText(),c));
    }
    @Test void corpusContainsExactlyFiveSyntheticCasesPerLevel() {
        var root=corpus();
        assertThat(root.get("provenance").asText()).isEqualTo("SYNTHETIC_OFFLINE_ONLY");
        assertThat(root.get("adviserReviewed").booleanValue()).isFalse();
        assertThat(root.get("officialAdmissionsData").booleanValue()).isFalse();
        var cases=root.get("cases").valueStream().toList();
        assertThat(cases).hasSize(20);
        assertThat(cases.stream().map(c->c.get("id").asText()).toList()).doesNotHaveDuplicates();
        for(String level:List.of("FOUNDATION","BACHELOR","MASTER","DOCTOR"))
            assertThat(cases.stream().filter(c->level.equals(c.get("level").asText())).toList()).hasSize(5);
    }
    @ParameterizedTest(name="{0}") @MethodSource("evaluationCases")
    void syntheticRulesAndOriginalCurrencyBudgetsMatchLiteralExpectations(String id,JsonNode c) {
        Instant now=Instant.parse(corpus().get("now").asText());
        Profile profile=FIXTURE_JSON.treeToValue(c.get("profile"),Profile.class);
        RuleSet rules=FIXTURE_JSON.treeToValue(c.get("rules"),RuleSet.class);
        Map<Long,Evidence> evidence=new HashMap<>();
        c.get("evidence").forEach(e->{var source=FIXTURE_JSON.treeToValue(e,Evidence.class);evidence.put(source.id(),source);});
        var result=new EligibilityEvaluator().evaluate(profile,rules,evidence,now,profile.facts().get("intake"));
        assertThat(result.eligible()).as(id).isEqualTo(c.get("expectedEligible").booleanValue());
        var findings=result.alternatives().stream().flatMap(List::stream).toList();
        assertThat(findings.stream().map(f->f.status().name()).toList()).as(id).containsExactlyElementsOf(strings(c.get("expectedStatuses")));
        Set<String> missing=new TreeSet<>();
        if(!rules.complete() || findings.stream().anyMatch(f->f.status()==Status.EVIDENCE_MISSING)) missing.add("ADMISSIONS");
        findings.stream().filter(f->f.status()==Status.PROFILE_MISSING).forEach(f->missing.add("profile:"+f.field()));
        assertThat(missing).as(id).containsExactlyInAnyOrderElementsOf(strings(c.get("expectedMissing")));
        var budget=c.get("budget");
        List<Fee> charges=budget.get("fees").valueStream().map(f->FIXTURE_JSON.treeToValue(f,Fee.class)).toList();
        var cost=new BudgetCalculator().calculate(charges,evidence,now,profile.facts().get("intake"),new BudgetScope(new HashSet<>(strings(budget.get("scope")))));
        assertThat(cost.complete()).as(id).isEqualTo(budget.get("expectedComplete").booleanValue());
        assertThat(cost.missing()).as(id).containsExactlyInAnyOrderElementsOf(strings(budget.get("expectedMissing")));
        assertThat(cost.subtotals().keySet()).as(id).containsExactlyInAnyOrderElementsOf(budget.get("expectedSubtotals").propertyNames());
        budget.get("expectedSubtotals").properties().forEach(e->assertThat(cost.subtotals().get(e.getKey())).as(id+" "+e.getKey()).isEqualByComparingTo(e.getValue().asText()));
    }
    static List<String> strings(JsonNode values) { return values.valueStream().map(JsonNode::asText).toList(); }
}
