package com.yangdoujiao.website.planningagent.eligibility;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Condition;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.RuleSet;

@Repository
public class RuleRepository {
    private final JdbcTemplate jdbc;

    public RuleRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<RuleSet> findCurrent(long programmeId) {
        // One statement keeps the selected active version and all conditions in one database snapshot.
        return jdbc.query("""
                SELECT r.version, r.complete, c.id AS condition_id, c.branch_no, c.field, c.operator,
                    c.expected, c.scale, c.evidence_id, e.programme_id AS evidence_programme_id
                FROM planning_rule_sets r
                LEFT JOIN planning_rule_conditions c ON c.rule_set_id = r.id
                LEFT JOIN planning_evidence e ON e.id = c.evidence_id
                WHERE r.programme_id = ? AND r.active = TRUE
                ORDER BY c.branch_no, c.id
                """, rows -> {
                    if (!rows.next()) return Optional.empty();
                    long version = rows.getLong("version");
                    boolean complete = rows.getBoolean("complete");
                    Map<Integer, List<Condition>> branches = new LinkedHashMap<>();
                    do {
                        if (rows.getObject("condition_id") == null) continue;
                        if (rows.getLong("evidence_programme_id") != programmeId) {
                            throw new IllegalStateException("Rule evidence must belong to the rule programme");
                        }
                        branches.computeIfAbsent(rows.getInt("branch_no"), ignored -> new ArrayList<>())
                                .add(new Condition(rows.getString("field"), rows.getString("operator"),
                                        rows.getString("expected"), rows.getString("scale"), rows.getLong("evidence_id")));
                    } while (rows.next());
                    return Optional.of(new RuleSet(programmeId, version, complete,
                            branches.values().stream().map(List::copyOf).toList()));
                }, programmeId);
    }
}
