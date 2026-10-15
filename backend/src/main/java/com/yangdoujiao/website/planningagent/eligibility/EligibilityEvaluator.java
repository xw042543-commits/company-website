package com.yangdoujiao.website.planningagent.eligibility;

import static com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import com.yangdoujiao.website.planningagent.evidence.Evidence;
import com.yangdoujiao.website.planningagent.evidence.EvidencePolicy;
import com.yangdoujiao.website.planningagent.evidence.EvidenceState;

public class EligibilityEvaluator {
    private final EvidencePolicy evidencePolicy = new EvidencePolicy();

    public Assessment evaluate(Profile profile, RuleSet rules, Map<Long, Evidence> evidence, Instant now, String intake) {
        var findings = rules.alternatives().stream().map(branch -> branch.stream()
                .map(condition -> new Finding(condition.field(), assess(profile, rules, condition, evidence, now, intake),
                        condition.evidenceId())).toList()).toList();
        boolean eligible = rules.complete() && findings.stream().anyMatch(branch -> !branch.isEmpty()
                && branch.stream().allMatch(finding -> finding.status() == Status.MET));
        return new Assessment(eligible, findings);
    }

    private Status assess(Profile profile, RuleSet rules, Condition condition, Map<Long, Evidence> evidence,
            Instant now, String intake) {
        Evidence source = evidence.get(condition.evidenceId());
        if (source == null || source.id() != condition.evidenceId() || source.programmeId() != rules.programmeId()
                || !"ADMISSIONS".equals(source.factType())
                || evidencePolicy.assess(source, now, intake) != EvidenceState.VERIFIED
                || blank(condition.field()) || blank(condition.expected())
                || !("EQ".equals(condition.operator()) || "GTE".equals(condition.operator()))) {
            return Status.EVIDENCE_MISSING;
        }
        boolean numeric = condition.scale() != null || "GTE".equals(condition.operator());
        BigDecimal expected = null;
        if (numeric) {
            if (blank(condition.scale())) return Status.EVIDENCE_MISSING;
            try {
                expected = new BigDecimal(condition.expected());
            } catch (NumberFormatException invalidRule) {
                return Status.EVIDENCE_MISSING;
            }
        }
        String actual = profile.facts().get(condition.field());
        if (blank(actual)) return Status.PROFILE_MISSING;
        if (!numeric) return actual.equals(condition.expected()) ? Status.MET : Status.NOT_MET;
        if (!condition.scale().equals(profile.facts().get(condition.field() + ".scale"))) {
            return Status.PROFILE_MISSING;
        }
        try {
            int comparison = new BigDecimal(actual).compareTo(expected);
            boolean matches = "EQ".equals(condition.operator()) ? comparison == 0 : comparison >= 0;
            return matches ? Status.MET : Status.NOT_MET;
        } catch (NumberFormatException invalidProfile) {
            return Status.PROFILE_MISSING;
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
