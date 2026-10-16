package com.yangdoujiao.website.planningagent.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import com.yangdoujiao.website.planningagent.evidence.Evidence;

class EligibilityEvaluatorTest {
    private static final Instant NOW = Instant.parse("2026-10-15T00:00:00Z");
    private final EligibilityEvaluator evaluator = new EligibilityEvaluator();

    @Test void missingRulesNeverMeansEligible() {
        assertThat(evaluator.evaluate(new Profile(1, Map.of()), new RuleSet(1, 1, false, List.of()),
                Map.of(), Instant.EPOCH, "2027-02").eligible()).isFalse();
    }

    // Entirely synthetic requirements; these are not admissions facts about any institution.
    static Stream<Object[]> educationCases() {
        return Stream.of("HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER").flatMap(education -> Stream.of(
                new Object[]{education, "empty", false, null},
                new Object[]{education, "boundary", true, Status.MET},
                new Object[]{education, "different_scale", false, Status.PROFILE_MISSING},
                new Object[]{education, "missing_language", false, Status.PROFILE_MISSING},
                new Object[]{education, "unknown_pathway", false, Status.PROFILE_MISSING}));
    }

    @ParameterizedTest(name = "{0}: {1}") @MethodSource("educationCases")
    void syntheticEducationRequirements(String education, String scenario, boolean eligible, Status lastStatus) {
        var conditions = switch (scenario) {
            case "empty" -> List.<Condition>of();
            case "missing_language" -> List.of(condition("language.total", "GTE", "6.5", "IELTS"));
            case "unknown_pathway" -> List.of(condition("pathway.accepted", "EQ", "YES", null));
            default -> List.of(condition("score", "GTE", "80.00", "100"));
        };
        var facts = Map.of("education", education, "score", "80", "score.scale",
                scenario.equals("different_scale") ? "4" : "100");
        var result = evaluate(facts, true, List.of(conditions), official());
        assertThat(result.eligible()).isEqualTo(eligible);
        if (lastStatus != null) assertThat(result.alternatives().getFirst().getLast().status()).isEqualTo(lastStatus);
    }

    @Test void orPassesWhileRetainingAllFailuresAndUnknowns() {
        var result = evaluate(Map.of("score", "80", "score.scale", "100"), true,
                List.of(List.of(condition("score", "GTE", "81", "100")),
                        List.of(condition("language.total", "GTE", "6", "IELTS")),
                        List.of(condition("score", "GTE", "80", "100"))), official());
        assertThat(result.eligible()).isTrue();
        assertThat(result.alternatives()).containsExactly(
                List.of(new Finding("score", Status.NOT_MET, 7)),
                List.of(new Finding("language.total", Status.PROFILE_MISSING, 7)),
                List.of(new Finding("score", Status.MET, 7)));
    }

    @Test void andRequiresLanguageSubscoresAndKeepsEveryFinding() {
        var result = evaluate(Map.of("language.total", "7", "language.total.scale", "IELTS"), true,
                List.of(List.of(condition("language.total", "GTE", "6.5", "IELTS"),
                        condition("language.writing", "GTE", "6", "IELTS"))), official());
        assertThat(result.eligible()).isFalse();
        assertThat(result.alternatives().getFirst()).containsExactly(
                new Finding("language.total", Status.MET, 7),
                new Finding("language.writing", Status.PROFILE_MISSING, 7));
    }

    @Test void incompleteAndEmptyBranchesNeverPass() {
        assertThat(evaluate(Map.of("x", "yes"), false,
                List.of(List.of(condition("x", "EQ", "yes", null))), official()).eligible()).isFalse();
        assertThat(evaluate(Map.of(), true, List.of(List.of()), official()).eligible()).isFalse();
    }

    @Test void contradictoryScoresDoNotPass() {
        var result = evaluate(Map.of("score", "80", "score.scale", "100"), true,
                List.of(List.of(condition("score", "GTE", "90", "100"),
                        condition("score", "EQ", "80", "100"))), official());
        assertThat(result.eligible()).isFalse();
        assertThat(result.alternatives().getFirst()).extracting(Finding::status)
                .containsExactly(Status.NOT_MET, Status.MET);
    }

    static Stream<Evidence> unusableEvidence() {
        Evidence good = official();
        return Stream.of(
                new Evidence(7, 2, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW, null, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(8, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW, null, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "AI_GENERATED", "CN_MAINLAND", "2027-02", NOW, null, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW, null, "DRAFT", null, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW.minus(91, ChronoUnit.DAYS), null, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW, NOW, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-09", NOW, null, "VERIFIED", 3L, "Synthetic", false),
                new Evidence(7, 1, good.factType(), good.sourceUrl(), "OFFICIAL", "CN_MAINLAND", "2027-02", NOW, null, "VERIFIED", 3L, "Synthetic", true));
    }

    @ParameterizedTest @MethodSource("unusableEvidence")
    void evidenceMustBeValidForThisProgrammeAndReference(Evidence evidence) {
        var result = evaluate(Map.of("x", "yes"), true,
                List.of(List.of(condition("x", "EQ", "yes", null))), evidence);
        assertThat(result.eligible()).isFalse();
        assertThat(result.alternatives().getFirst().getFirst().status()).isEqualTo(Status.EVIDENCE_MISSING);
    }

    @Test void absentEvidenceIsUnknownEvenWhenProfileMatches() {
        var result = evaluator.evaluate(new Profile(1, Map.of("x", "yes")),
                new RuleSet(1, 1, true, List.of(List.of(condition("x", "EQ", "yes", null)))), Map.of(), NOW, "2027-02");
        assertThat(result.eligible()).isFalse();
        assertThat(result.alternatives().getFirst().getFirst().status()).isEqualTo(Status.EVIDENCE_MISSING);
    }

    @Test void feesEvidenceCannotEstablishAdmissionsEligibility() {
        Evidence good=official();
        Evidence fee=new Evidence(7,1,"FEES",good.sourceUrl(),good.sourceType(),good.studentScope(),
                good.intake(),good.checkedAt(),good.expiresAt(),good.reviewStatus(),good.reviewerId(),good.excerpt(),false);
        var result=evaluate(Map.of("x","yes"),true,List.of(List.of(condition("x","EQ","yes",null))),fee);
        assertThat(result.eligible()).isFalse();
        assertThat(result.alternatives().getFirst().getFirst().status()).isEqualTo(Status.EVIDENCE_MISSING);
    }

    @Test void unsupportedExceptionsAndMalformedRuleValuesAreUnknown() {
        for (var condition : List.of(condition("x", "EXCEPTION", "yes", null),
                condition("x", "GTE", "invalid", "100"), condition("x", "GTE", "80", null),
                condition("x", "EQ", "", null))) {
            var result = evaluate(Map.of("x", "80", "x.scale", "100"), true, List.of(List.of(condition)), official());
            assertThat(result.eligible()).isFalse();
            assertThat(result.alternatives().getFirst().getFirst().status()).isEqualTo(Status.EVIDENCE_MISSING);
        }
    }

    @Test void malformedOrMissingScoreAndScaleAreProfileMissing() {
        for (var facts : List.of(Map.of("score", "NaN", "score.scale", "100"),
                Map.of("score", "80"), Map.of("score", "", "score.scale", "100"))) {
            var result = evaluate(facts, true, List.of(List.of(condition("score", "GTE", "80", "100"))), official());
            assertThat(result.eligible()).isFalse();
            assertThat(result.alternatives().getFirst().getFirst().status()).isEqualTo(Status.PROFILE_MISSING);
        }
    }

    @Test void scaledEqualityUsesDecimalComparisonWithoutConversion() {
        assertThat(evaluate(Map.of("score", "80.0", "score.scale", "100"), true,
                List.of(List.of(condition("score", "EQ", "80.00", "100"))), official()).eligible()).isTrue();
        assertThat(evaluate(Map.of("x", "no"), true,
                List.of(List.of(condition("x", "EQ", "yes", null))), official()).alternatives().getFirst().getFirst().status())
                .isEqualTo(Status.NOT_MET);
    }

    @Test void academicAliasesMatchInBothDirectionsButDifferentScalesNeverConvert() {
        var aliases = new tools.jackson.databind.ObjectMapper().readTree(
                getClass().getResourceAsStream("/planning-score-contract.json")).get("aliases");
        for (String field : List.of("grade", "math", "science")) {
            for (var alias : aliases.properties()) {
                for (var pair : List.of(List.of(alias.getKey(), alias.getValue().asText()), List.of(alias.getValue().asText(), alias.getKey()))) {
                    assertThat(evaluate(Map.of(field, "3.0", field+".scale", pair.get(0)), true,
                            List.of(List.of(condition(field,"GTE","3",pair.get(1)))),official()).eligible()).isTrue();
                }
            }
            assertThat(evaluate(Map.of(field,"80",field+".scale","PERCENT"),true,
                    List.of(List.of(condition(field,"GTE","3","4"))),official()).alternatives().getFirst().getFirst().status()).isEqualTo(Status.PROFILE_MISSING);
            assertThat(evaluate(Map.of(field,"80",field+".scale","UNKNOWN"),true,
                    List.of(List.of(condition(field,"GTE","70","100"))),official()).alternatives().getFirst().getFirst().status()).isEqualTo(Status.PROFILE_MISSING);
            assertThat(evaluate(Map.of(field,"80",field+".scale","UNKNOWN"),true,
                    List.of(List.of(condition(field,"GTE","70","UNKNOWN"))),official()).alternatives().getFirst().getFirst().status()).isEqualTo(Status.EVIDENCE_MISSING);
        }
        for (var pair : List.of(List.of("IELTS","9"), List.of("TOEFL","120"))) {
            assertThat(evaluate(Map.of("languageTotal","7","languageTotal.scale",pair.get(0)),true,
                    List.of(List.of(condition("languageTotal","GTE","6",pair.get(1)))),official()).alternatives().getFirst().getFirst().status()).isEqualTo(Status.PROFILE_MISSING);
        }
    }

    private Assessment evaluate(Map<String, String> facts, boolean complete, List<List<Condition>> alternatives, Evidence evidence) {
        return evaluator.evaluate(new Profile(1, facts), new RuleSet(1, 1, complete, alternatives),
                Map.of(7L, evidence), NOW, "2027-02");
    }

    private static Condition condition(String field, String operator, String expected, String scale) {
        return new Condition(field, operator, expected, scale, 7);
    }

    private static Evidence official() {
        return new Evidence(7, 1, "ADMISSIONS", "https://example.edu/synthetic", "OFFICIAL", "CN_MAINLAND",
                "2027-02", NOW, null, "VERIFIED", 3L, "Synthetic test rule", false);
    }
}
