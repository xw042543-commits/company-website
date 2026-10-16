package com.yangdoujiao.website.planningagent.plan;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.yangdoujiao.website.planningagent.agent.ProgrammeDecision;
import com.yangdoujiao.website.planningagent.agent.ValidatedPlan;
import com.yangdoujiao.website.planningagent.budget.FeeRepository;
import com.yangdoujiao.website.planningagent.catalog.PlanningCatalogue;
import com.yangdoujiao.website.planningagent.eligibility.RuleRepository;
import com.yangdoujiao.website.planningagent.evidence.EvidenceRepository;

/** Canonical source-only provenance. Neither user facts nor contact details enter its hash. */
@Component
public class PlanningSourceSnapshot {
    private final PlanningCatalogue catalogue;
    private final EvidenceRepository evidence;
    private final RuleRepository rules;
    private final FeeRepository fees;
    private final ObjectMapper json;

    public PlanningSourceSnapshot(PlanningCatalogue catalogue, EvidenceRepository evidence,
            RuleRepository rules, FeeRepository fees, ObjectMapper json) {
        this.catalogue = catalogue;
        this.evidence = evidence;
        this.rules = rules;
        this.fees = fees;
        this.json = json;
    }

    public JsonNode baseline(ValidatedPlan plan) {
        // Preserve exact serialized decimal values across JSONB's numeric normalization.
        return json.valueToTree(Map.of("sourceData", canonical(ids(plan), () -> {})));
    }

    public String fingerprint(ValidatedPlan plan, Runnable guard) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(canonical(ids(plan), guard).getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private List<Long> ids(ValidatedPlan plan) {
        return plan.programmes().stream().map(ProgrammeDecision::programmeId).distinct().sorted().toList();
    }

    private String canonical(List<Long> ids, Runnable guard) {
        Map<String, Object> values = new TreeMap<>();
        for (long id : ids) {
            Map<String, Object> source = new TreeMap<>();
            guard.run();
            source.put("display", catalogue.display(id).orElse(null));
            guard.run();
            source.put("evidence", evidence.findByProgrammeId(id));
            guard.run();
            source.put("rule", rules.findCurrent(id).orElse(null));
            guard.run();
            source.put("fees", fees.findByProgrammeId(id));
            values.put(Long.toString(id), source);
        }
        return json.writeValueAsString(values);
    }
}
