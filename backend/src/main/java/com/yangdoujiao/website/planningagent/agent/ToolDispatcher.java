package com.yangdoujiao.website.planningagent.agent;

import tools.jackson.databind.*;
import com.yangdoujiao.website.planningagent.catalog.PlanningCatalogue;
import com.yangdoujiao.website.planningagent.tools.PlanningTools;
import com.yangdoujiao.website.planningagent.eligibility.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.*;
import com.yangdoujiao.website.planningagent.evidence.*;
import com.yangdoujiao.website.planningagent.session.PlanningWorker.Guard;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Component;

/** Closed, read-only tool boundary. Profile/filter values come exclusively from the confirmed server profile. */
@Component
public class ToolDispatcher {
    private static final Set<String> TOOLS=Set.of("search_programmes","get_programme_evidence","evaluate_eligibility","calculate_budget");
    private static final Set<String> LEVELS=Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR");
    private final PlanningCatalogue catalogue;
    private final PlanningTools tools;
    private final RuleRepository rules;
    private final ObjectMapper json;
    private final Clock clock;
    public ToolDispatcher(PlanningCatalogue catalogue,PlanningTools tools,RuleRepository rules,ObjectMapper json,Clock clock) {
        this.catalogue=catalogue;this.tools=tools;this.rules=rules;this.json=json;this.clock=clock;
    }
    public static boolean allowed(String name) { return name!=null && TOOLS.contains(name); }
    public static class InvalidToolCall extends RuntimeException { public InvalidToolCall(String message) { super(message); } }

    /** Owned by one execution, never handed to a model/provider. */
    public static final class State {
        final Profile profile;
        final Guard guard;
        final Set<Long> candidates=new HashSet<>();
        final Map<Long,Set<Long>> evidence=new HashMap<>();
        private final List<ToolResult> results=new ArrayList<>();
        private int calls;
        public State(Profile profile,Guard guard) { this.profile=new Profile(profile.version(),Map.copyOf(profile.facts()));this.guard=guard; }
        public List<ToolResult> results() { return results.stream().map(r->new ToolResult(r.name(),r.value().deepCopy())).toList(); }
    }
    public ToolResult dispatch(ToolCall call,State state) {
        if(call==null || !allowed(call.name())) throw new InvalidToolCall("Unknown tool");
        if(++state.calls>8) throw new InvalidToolCall("Tool limit exceeded");
        JsonNode args=call.arguments();
        boolean search="search_programmes".equals(call.name());
        fields(args,search?Set.of("page"):Set.of("programmeId"));
        Object value;
        if(search) {
            String level=state.profile.facts().get("targetLevel");
            if(!LEVELS.contains(level==null?"":level)) throw new InvalidToolCall("Confirmed target required");
            int page=0;
            if(args.has("page")) {
                if(!args.get("page").isIntegralNumber() || !args.get("page").canConvertToInt()) throw new InvalidToolCall("Invalid page type");
                page=args.get("page").intValue();
                if(page<0 || page>100) throw new InvalidToolCall("Invalid page range");
            }
            state.guard.check();
            List<Long> ids=catalogue.search(level,filter(state,"subject"),filter(state,"city"),page);
            state.candidates.addAll(ids); value=Map.of("programmeIds",ids);
        } else {
            JsonNode id=args.get("programmeId");
            if(id==null || !id.isIntegralNumber() || !id.canConvertToLong() || id.longValue()<=0 || !state.candidates.contains(id.longValue()))
                throw new InvalidToolCall("Programme outside current search");
            long programme=id.longValue();
            switch(call.name()) {
                case "get_programme_evidence" -> {
                    List<Evidence> current=currentEvidence(programme,state);
                    Set<Long> ids=new HashSet<>(); current.forEach(e->ids.add(e.id()));state.evidence.put(programme,ids);
                    // Excerpts, source free text and URLs never enter the model context.
                    value=Map.of("programmeId",programme,"evidenceIds",current.stream().map(Evidence::id).toList());
                }
                case "evaluate_eligibility" -> value=Map.of("programmeId",programme,"assessment",assessment(programme,state));
                case "calculate_budget" -> value=Map.of("programmeId",programme,"budget",budget(programme,state));
                default -> throw new InvalidToolCall("Unknown tool");
            }
        }
        ToolResult result=new ToolResult(call.name(),json.valueToTree(value));state.results.add(result);return result;
    }
    private static void fields(JsonNode args,Set<String> fields) {
        if(args==null || !args.isObject() || args.size()>fields.size() || args.toString().length()>256) throw new InvalidToolCall("Invalid arguments");
        args.propertyNames().forEach(name->{if(!fields.contains(name)) throw new InvalidToolCall("Unknown argument");});
    }
    private static String filter(State state,String name) {
        String value=state.profile.facts().get(name);
        if(value!=null && value.length()>200) throw new InvalidToolCall("Filter too long");
        return value;
    }
    String intake(State state) { return state.profile.facts().get("intake"); }
    List<Evidence> currentEvidence(long id,State state) {
        state.guard.check();
        return tools.getProgrammeEvidence(id).stream().filter(e->e.programmeId()==id
                && new EvidencePolicy().assess(e,clock.instant(),intake(state))==EvidenceState.VERIFIED).toList();
    }
    Optional<RuleSet> rule(long id,State state) { state.guard.check();return rules.findCurrent(id); }
    Assessment assessment(long id,State state) {
        return assessment(state,rule(id,state),currentEvidence(id,state));
    }
    Assessment assessment(State state,Optional<RuleSet> rule,List<Evidence> sources) {
        if(rule.isEmpty()) return new Assessment(false,List.of());
        Map<Long,Evidence> map=new HashMap<>(); sources.forEach(e->map.put(e.id(),e));
        return new EligibilityEvaluator().evaluate(state.profile,rule.get(),map,clock.instant(),intake(state));
    }
    BudgetResult budget(long id,State state) {
        Set<String> categories=new HashSet<>(Set.of("TUITION","TAX"));
        String living=state.profile.facts().get("budgetIncludesLiving");
        boolean explicit="true".equalsIgnoreCase(living) || "false".equalsIgnoreCase(living);
        if(!explicit || "true".equalsIgnoreCase(living)) categories.add("LIVING");
        state.guard.check();
        BudgetResult result=tools.calculateBudget(id,clock.instant(),intake(state),new BudgetScope(categories));
        if(explicit) return compareBudget(result,state,categories);
        List<String> missing=new ArrayList<>(result.missing());missing.add("profile:budgetIncludesLiving");
        return new BudgetResult(result.subtotals(),false,missing,result.lineItems(),result.categories(),result.calculationScope(),"UNKNOWN","LIVING_SCOPE_UNKNOWN");
    }
    private BudgetResult compareBudget(BudgetResult result,State state,Set<String> categories) {
        String preference="UNKNOWN",reason="BUDGET_NOT_CONFIRMED";
        var facts=state.profile.facts();
        if(!"TOTAL".equals(facts.get("budgetPeriod"))) reason="PERIOD_NOT_COMPARABLE";
        else if(!result.complete()) reason="INCOMPLETE_COSTS";
        else if(!"WHOLE_STUDY".equals(result.calculationScope()) || result.lineItems().isEmpty() || !result.categories().equals(categories)) reason="SCOPE_NOT_COMPARABLE";
        else if(facts.get("budgetCurrency")==null) reason="BUDGET_NOT_CONFIRMED";
        else if(result.subtotals().size()!=1 || !result.subtotals().containsKey(facts.get("budgetCurrency"))) reason="CURRENCY_NOT_COMPARABLE";
        else {
            try {
                var budget=new java.math.BigDecimal(facts.getOrDefault("budget",""));
                if(budget.signum()>=0) {
                    preference=result.subtotals().get(facts.get("budgetCurrency")).compareTo(budget)<=0?"WITHIN":"OVER";
                    reason="VERIFIED_SCOPE_ONLY";
                }
            } catch(NumberFormatException invalid) { /* Unconfirmed amounts cannot rank affordability. */ }
        }
        return new BudgetResult(result.subtotals(),result.complete(),result.missing(),result.lineItems(),result.categories(),result.calculationScope(),preference,reason);
    }
    PlanningCatalogue.ProgrammeDisplay display(long id,State state) {
        state.guard.check();
        if(!catalogue.isPublishedMalaysianProgramme(id)) throw new PlanValidator.InvalidPlan("Programme no longer published");
        state.guard.check();
        return catalogue.display(id).orElseThrow(()->new PlanValidator.InvalidPlan("Programme unavailable"));
    }
}
