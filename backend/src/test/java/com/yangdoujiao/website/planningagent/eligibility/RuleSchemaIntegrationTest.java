package com.yangdoujiao.website.planningagent.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class RuleSchemaIntegrationTest {
    @Autowired private JdbcTemplate jdbc;
    private long programme;
    private long evidence;

    @BeforeEach void createSyntheticProgrammeAndEvidence() {
        programme = programme();
        evidence = jdbc.queryForObject("""
                INSERT INTO planning_evidence(programme_id,fact_type,source_type,student_scope,review_status,excerpt)
                VALUES(?,'ADMISSIONS','OFFICIAL','CN_MAINLAND','DRAFT','Synthetic requirements') RETURNING id
                """, Long.class, programme);
    }

    @Test void readsOnlyActiveVersionAndPreservesBranchesAndOrder() {
        ruleSet(programme, 1, true, false);
        long active = ruleSet(programme, 2, true, true);
        condition(active, 3, "language.total", "GTE", "6.5", "IELTS", evidence);
        condition(active, 0, "education", "EQ", "DIPLOMA", null, evidence);
        condition(active, 0, "score", "GTE", "80", "100", evidence);
        var repository = new RuleRepository(jdbc);
        assertThat(repository.findCurrent(programme)).contains(new RuleSet(programme, 2, true, List.of(
                List.of(new Condition("education", "EQ", "DIPLOMA", null, evidence),
                        new Condition("score", "GTE", "80", "100", evidence)),
                List.of(new Condition("language.total", "GTE", "6.5", "IELTS", evidence)))));
        assertThat(repository.findCurrent(-1)).isEmpty();
        assertThat(jdbc.queryForObject("SELECT status FROM programmes WHERE id=?", String.class, programme)).isEqualTo("DRAFT");
    }

    @Test void emptyIncompleteRuleRemainsNonEligible() {
        ruleSet(programme, 1, false, true);
        assertThat(new RuleRepository(jdbc).findCurrent(programme))
                .contains(new RuleSet(programme, 1, false, List.of()));
    }

    @Test void inactiveOnlyMeansNoCurrentRules() {
        ruleSet(programme, 1, true, false);
        assertThat(new RuleRepository(jdbc).findCurrent(programme)).isEmpty();
    }

    @Test void repositoryRefusesEvidenceFromAnotherProgramme() {
        long otherRules = ruleSet(programme(), 1, true, true);
        condition(otherRules, 0, "education", "EQ", "DIPLOMA", null, evidence);
        long otherProgramme = jdbc.queryForObject("SELECT programme_id FROM planning_rule_sets WHERE id=?", Long.class, otherRules);
        assertThatThrownBy(() -> new RuleRepository(jdbc).findCurrent(otherProgramme))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test void rejectsDuplicateProgrammeVersion() {
        ruleSet(programme, 1, false, false);
        assertThatThrownBy(() -> ruleSet(programme, 1, true, false)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test void rejectsTwoActiveVersions() {
        ruleSet(programme, 1, false, true);
        assertThatThrownBy(() -> ruleSet(programme, 2, true, true)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test void rejectsMissingProgramme() {
        assertThatThrownBy(() -> ruleSet(-1, 1, false, false)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test void rejectsMissingEvidence() {
        long rules = ruleSet(programme, 1, true, true);
        assertThatThrownBy(() -> condition(rules, 0, "x", "EQ", "yes", null, -1))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test void rejectsMissingRuleSet() {
        assertThatThrownBy(() -> condition(-1, 0, "x", "EQ", "yes", null, evidence))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private long programme() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        long category = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?,'Synthetic rules category') RETURNING id", Long.class, "R_" + suffix.toUpperCase());
        long university = jdbc.queryForObject("INSERT INTO universities(name,slug,country) VALUES('Synthetic school',?,'Malaysia') RETURNING id", Long.class, "rules-" + suffix);
        return jdbc.queryForObject("""
                INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_en)
                VALUES(?,?,?,?,'Synthetic rules programme') RETURNING id
                """, Long.class, "R_" + suffix.toUpperCase(), university, category, "rules-" + suffix);
    }

    private long ruleSet(long programmeId, long version, boolean complete, boolean active) {
        return jdbc.queryForObject("""
                INSERT INTO planning_rule_sets(programme_id,version,complete,active) VALUES(?,?,?,?) RETURNING id
                """, Long.class, programmeId, version, complete, active);
    }

    private void condition(long rules, int branch, String field, String operator, String expected, String scale, long source) {
        jdbc.update("""
                INSERT INTO planning_rule_conditions(rule_set_id,branch_no,field,operator,expected,scale,evidence_id)
                VALUES(?,?,?,?,?,?,?)
                """, rules, branch, field, operator, expected, scale, source);
    }
}
