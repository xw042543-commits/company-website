package com.yangdoujiao.website.planningagent.budget;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.planningagent.evidence.Evidence;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.*;

class BudgetCalculatorTest {
    private final Instant now = Instant.parse("2026-10-15T00:00:00Z");
    private final BudgetCalculator calculator = new BudgetCalculator();
    private Evidence evidence(long id, long programme, String type) {
        return new Evidence(id, programme, type, "https://example.edu/fees", "OFFICIAL", "CN_MAINLAND",
                "2027-02", now.minusSeconds(60), now.plusSeconds(3600), "VERIFIED", 1L, "Fees", false);
    }
    private Fee fee(long id, String category, String currency, String period, Integer units, Long included) {
        return new Fee(id, 8, new BigDecimal("100.25"), currency, period, units, id, included, category, true);
    }
    @Test void unknownPeriodDoesNotBecomeTotal() {
        var result = calculator.calculate(List.of(fee(1,"TUITION","MYR","UNKNOWN",null,null)),
                Map.of(1L,evidence(1,8,"FEES")),now,"2027-02");
        assertThat(result.complete()).isFalse();
        assertThat(result.subtotals()).isEmpty();
    }
    @Test void totalsPeriodsInOriginalCurrenciesAndRequiresAllBudgetCategories() {
        var result = calculator.calculate(List.of(fee(1,"TUITION","MYR","YEAR",3,null),
                fee(2,"TAX","MYR","TOTAL",1,null),fee(3,"LIVING","USD","SEMESTER",6,null)),
                Map.of(1L,evidence(1,8,"FEES"),2L,evidence(2,8,"FEES"),3L,evidence(3,8,"FEES")),now,"2027-02");
        assertThat(result.subtotals()).containsExactlyInAnyOrderEntriesOf(Map.of("MYR",new BigDecimal("401.00"),"USD",new BigDecimal("601.50")));
        assertThat(result.complete()).isFalse();
        assertThat(result.missing()).contains("fx:verified-conversion-unavailable");
    }
    @Test void emptyOrMissingLivingCostsNeverMeanComplete() {
        assertThat(calculator.calculate(List.of(),Map.of(),now,"2027-02").complete()).isFalse();
        assertThat(calculator.calculate(List.of(fee(1,"TUITION","MYR","TOTAL",1,null)),
                Map.of(1L,evidence(1,8,"FEES")),now,"2027-02").missing()).contains("category:LIVING", "category:TAX");
    }
    @Test void includedItemsAreNotCountedTwiceRegardlessOfOrder() {
        var result = calculator.calculate(List.of(fee(2,"TAX","MYR","TOTAL",1,1L),fee(1,"TUITION","MYR","TOTAL",1,null),fee(3,"LIVING","MYR","TOTAL",1,null)),
                Map.of(1L,evidence(1,8,"FEES"),2L,evidence(2,8,"FEES"),3L,evidence(3,8,"FEES")),now,"2027-02");
        assertThat(result.complete()).isTrue();
        assertThat(result.subtotals().get("MYR")).isEqualByComparingTo("200.50");
    }
    @Test void rejectsInvalidOwnershipEvidencePeriodsAmountsAndInclusions() {
        var invalid = List.of(fee(1,"TUITION","MYR","YEAR",null,null),fee(2,"TAX","MYR","TOTAL",2,null),
                fee(3,"LIVING","MYR","TOTAL",1,99L),fee(4,"TAX","MYR","TOTAL",1,null));
        var result = calculator.calculate(invalid,Map.of(1L,evidence(1,8,"FEES"),2L,evidence(2,8,"FEES"),
                3L,evidence(3,8,"FEES"),4L,evidence(4,9,"FEES")),now,"2027-02");
        assertThat(result.complete()).isFalse();
        assertThat(result.subtotals()).isEmpty();
        var negative = new Fee(5,8,new BigDecimal("-1"),"MYR","TOTAL",1,5,null,"TUITION",true);
        assertThat(calculator.calculate(List.of(negative),Map.of(5L,evidence(5,8,"FEES")),now,"2027-02").subtotals()).isEmpty();
        assertThat(calculator.calculate(List.of(fee(6,"TUITION","MYR","TOTAL",1,null)),Map.of(6L,evidence(6,8,"ADMISSIONS")),now,"2027-02").subtotals()).isEmpty();
    }
    @Test void cyclesDuplicateIdsAndUnknownCoverageRemainIncomplete() {
        var a = fee(1,"TUITION","MYR","TOTAL",1,2L);
        var b = fee(2,"TAX","MYR","TOTAL",1,1L);
        var evidence = Map.of(1L,evidence(1,8,"FEES"),2L,evidence(2,8,"FEES"));
        assertThat(calculator.calculate(List.of(a,b),evidence,now,"2027-02").subtotals()).isEmpty();
        assertThat(calculator.calculate(List.of(a,a),evidence,now,"2027-02").complete()).isFalse();
        var unknown = new Fee(1,8,new BigDecimal("1"),"MYR","TOTAL",1,1,null,"TUITION",false);
        assertThat(calculator.calculate(List.of(unknown),evidence,now,"2027-02",new BudgetScope(Set.of("TUITION"))).complete()).isFalse();
    }
    @Test void missingPeriodAndCurrencyInInclusionChainFailClosed() {
        var period = new Fee(1,8,BigDecimal.ONE,"MYR",null,1,1,null,"TUITION",true);
        var parent = new Fee(2,8,BigDecimal.TEN,null,"TOTAL",1,2,null,"TUITION",true);
        var child = new Fee(3,8,BigDecimal.ONE,"MYR","TOTAL",1,3,2L,"TAX",true);
        var result = calculator.calculate(List.of(period,parent,child),
                Map.of(1L,evidence(1,8,"FEES"),2L,evidence(2,8,"FEES"),3L,evidence(3,8,"FEES")),now,"2027-02");
        assertThat(result.subtotals()).isEmpty();
        assertThat(result.complete()).isFalse();
    }
}
