package com.yangdoujiao.website.planningagent.budget;

import java.math.BigDecimal;
import java.util.*;

public final class BudgetTypes {
    private BudgetTypes() {}
    public static final Set<String> CATEGORIES = Set.of("TUITION", "TAX", "LIVING");

    /** coverageComplete means the documented amount/units cover the whole requested study scope. */
    public record Fee(long id, long programmeId, BigDecimal amount, String currency, String period,
            Integer units, long evidenceId, Long includedIn, String category, boolean coverageComplete) {}
    public record BudgetScope(Set<String> categories) {
        public BudgetScope {
            categories = Set.copyOf(categories);
            if (categories.isEmpty() || !CATEGORIES.containsAll(categories)) {
                throw new IllegalArgumentException("Explicit supported budget categories required");
            }
        }
    }
    /** Complete requires covered categories and a single comparable currency; it never asserts affordability. */
    public record BudgetResult(Map<String,BigDecimal> subtotals, boolean complete, List<String> missing) {
        public BudgetResult { subtotals = Map.copyOf(subtotals); missing = List.copyOf(missing); }
    }
}
