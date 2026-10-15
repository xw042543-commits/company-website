package com.yangdoujiao.website.planningagent.budget;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import com.yangdoujiao.website.planningagent.evidence.*;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.*;

/** Internal deterministic arithmetic. Callers must load structured fees from FeeRepository. */
public class BudgetCalculator {
    private final EvidencePolicy policy = new EvidencePolicy();

    public BudgetResult calculate(List<Fee> fees, Map<Long,Evidence> evidence, Instant now, String intake) {
        return calculate(fees,evidence,now,intake,new BudgetScope(BudgetTypes.CATEGORIES));
    }

    public BudgetResult calculate(List<Fee> fees, Map<Long,Evidence> evidence, Instant now, String intake, BudgetScope scope) {
        Map<Long,Fee> byId = new HashMap<>();
        Set<Long> duplicates = new HashSet<>();
        for (Fee fee : fees) if (byId.put(fee.id(),fee) != null) duplicates.add(fee.id());
        Map<String,BigDecimal> totals = new TreeMap<>();
        Set<String> covered = new HashSet<>();
        Set<String> missing = new TreeSet<>();
        for (Fee fee : fees) {
            if (fee.category() == null) { missing.add("fee:" + fee.id()); continue; }
            if (!scope.categories().contains(fee.category())) continue;
            if (!validChain(fee,byId,duplicates,evidence,now,intake,new HashSet<>())) {
                missing.add("fee:" + fee.id());
                continue;
            }
            covered.add(fee.category());
            if (fee.includedIn() == null) {
                totals.merge(fee.currency(),fee.amount().multiply(BigDecimal.valueOf(fee.units())),BigDecimal::add);
            } else {
                // A parent outside the requested categories still carries the included child's cost.
                Fee root = fee;
                while (root.includedIn() != null) root = byId.get(root.includedIn());
                if (!scope.categories().contains(root.category())) {
                    missing.add("inclusion-outside-scope:" + fee.id());
                }
            }
        }
        for (String category : scope.categories()) if (!covered.contains(category)) missing.add("category:"+category);
        if (totals.size() > 1) missing.add("fx:verified-conversion-unavailable");
        return new BudgetResult(totals,missing.isEmpty(),new ArrayList<>(missing));
    }

    private boolean validChain(Fee fee, Map<Long,Fee> fees, Set<Long> duplicates, Map<Long,Evidence> evidence,
            Instant now, String intake, Set<Long> visited) {
        if (fee == null || !visited.add(fee.id()) || duplicates.contains(fee.id()) || fee.id() <= 0
                || fee.programmeId() <= 0 || fee.amount() == null || fee.amount().signum() < 0
                || fee.currency() == null || !fee.currency().matches("[A-Z]{3}") || !fee.coverageComplete()
                || fee.category() == null || !BudgetTypes.CATEGORIES.contains(fee.category()) || fee.units() == null || fee.units() <= 0
                || !("TOTAL".equals(fee.period()) && fee.units() == 1
                     || "YEAR".equals(fee.period()) || "SEMESTER".equals(fee.period()))) return false;
        Evidence source = evidence.get(fee.evidenceId());
        if (source == null || source.id() != fee.evidenceId() || source.programmeId() != fee.programmeId()
                || !"FEES".equals(source.factType()) || policy.assess(source,now,intake) != EvidenceState.VERIFIED) return false;
        if (fee.includedIn() == null) return true;
        Fee parent = fees.get(fee.includedIn());
        return parent != null && parent.programmeId() == fee.programmeId() && Objects.equals(parent.currency(),fee.currency())
                && validChain(parent,fees,duplicates,evidence,now,intake,visited)
                && fee.amount().multiply(BigDecimal.valueOf(fee.units())).compareTo(
                        parent.amount().multiply(BigDecimal.valueOf(parent.units()))) <= 0;
    }
}
