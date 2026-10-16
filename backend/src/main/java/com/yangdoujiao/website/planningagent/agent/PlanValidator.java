package com.yangdoujiao.website.planningagent.agent;

import java.util.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;
import com.yangdoujiao.website.planningagent.evidence.Evidence;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.yangdoujiao.website.planningagent.plan.PlanningSourceSnapshot;

@Component
public class PlanValidator {
    public static final Set<String> STEPS=Set.of("PREPARE_DOCUMENTS","PREPARE_LANGUAGE","CONFIRM_WITH_UNIVERSITY");
    private final ToolDispatcher dispatcher;
    private final PlanningSourceSnapshot sources;
    public PlanValidator(ToolDispatcher dispatcher) { this(dispatcher,null); }
    @Autowired
    public PlanValidator(ToolDispatcher dispatcher,PlanningSourceSnapshot sources) {
        this.dispatcher=dispatcher;this.sources=sources;
    }
    public static class InvalidPlan extends RuntimeException { public InvalidPlan(String message) { super(message); } }

    /** context is server-owned; provenance additionally requires the private execution state. */
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public ValidatedPlan validate(PlanDraft draft,ModelContext context,ToolDispatcher.State state) {
        if(draft==null || draft.profileVersion()<=0 || draft.profileVersion()!=state.profile.version() || draft.profileVersion()!=context.confirmedProfile().version()
                || draft.programmeIds()==null || draft.evidenceIds()==null || draft.generalNextSteps()==null
                || draft.programmeIds().size()>5 || draft.evidenceIds().size()>500 || draft.generalNextSteps().size()>3
                || draft.generalNextSteps().stream().anyMatch(step->step==null || !STEPS.contains(step)) || !unique(draft.programmeIds()) || !unique(draft.evidenceIds())
                || !state.candidates.containsAll(draft.programmeIds())) throw new InvalidPlan("Invalid plan shape or provenance");
        List<ProgrammeDecision> decisions=new ArrayList<>();Set<Long> used=new HashSet<>();
        for(long id:draft.programmeIds()) {
            var display=dispatcher.display(id,state);
            List<Evidence> sources=dispatcher.currentEvidence(id,state);
            Set<Long> available=new HashSet<>(); sources.forEach(e->available.add(e.id()));
            List<Long> chosen=draft.evidenceIds().stream().filter(e->state.evidence.getOrDefault(id,Set.of()).contains(e)).toList();
            if(!state.evidence.containsKey(id) || !available.equals(new HashSet<>(chosen))) throw new InvalidPlan("Current evidence lookup required");
            used.addAll(chosen);
            var rule=dispatcher.rule(id,state);
            var assessment=dispatcher.assessment(state,rule,sources);
            String classification=classify(assessment);
            var snapshots=sources.stream().filter(e->chosen.contains(e.id())).map(e->new ProgrammeDecision.EvidenceSnapshot(
                    e.id(),e.programmeId(),e.factType(),e.sourceUrl(),e.sourceType(),e.studentScope(),e.intake(),e.checkedAt(),e.expiresAt())).toList();
            // Every current source used to substantiate a MET/NOT_MET must be in the presented snapshot.
            if(assessment.alternatives().stream().flatMap(List::stream).anyMatch(f->
                    (f.status()==Status.MET || f.status()==Status.NOT_MET) && !chosen.contains(f.evidenceId())))
                throw new InvalidPlan("Admissions evidence omitted");
            decisions.add(new ProgrammeDecision(id,assessment,dispatcher.budget(id,state),chosen,classification,
                    display.programmeNameZh(),display.programmeNameEn(),display.universityNameZh(),display.universityNameEn(),
                    rule.map(RuleSet::version).orElse(null),safeRuleSnapshot(rule,assessment),snapshots,display.imageUrl()));
        }
        if(!used.equals(new HashSet<>(draft.evidenceIds()))) throw new InvalidPlan("Evidence outside selected programmes");
        decisions.sort(Comparator.comparingInt((ProgrammeDecision d)->switch(d.classification()) {case "ELIGIBLE"->0;case "NOT_MET"->1;default->2;})
                .thenComparingInt(d->switch(d.budget().preference()) {case "WITHIN"->0;case "OVER"->2;default->1;})
                .thenComparingLong(ProgrammeDecision::programmeId));
        var plan=new ValidatedPlan(draft.profileVersion(),List.copyOf(decisions),List.copyOf(draft.generalNextSteps()));
        // Capture provenance in the same repeatable-read transaction as final facts.
        String fingerprint=sources==null?null:sources.fingerprint(plan,state.guard::check);
        return new ValidatedPlan(plan.profileVersion(),plan.programmes(),plan.generalNextSteps(),fingerprint);
    }
    private static boolean unique(List<Long> values) { return values.stream().allMatch(v->v!=null && v>0) && new HashSet<>(values).size()==values.size(); }
    private static RuleSet safeRuleSnapshot(Optional<RuleSet> rule,Assessment assessment) {
        if(rule.isEmpty()) return null;
        var original=rule.get();List<List<Condition>> alternatives=new ArrayList<>();boolean complete=original.complete();
        for(int branch=0;branch<original.alternatives().size();branch++) {
            List<Condition> conditions=new ArrayList<>();
            for(int index=0;index<original.alternatives().get(branch).size();index++) {
                if(assessment.alternatives().get(branch).get(index).status()!=Status.EVIDENCE_MISSING)
                    conditions.add(original.alternatives().get(branch).get(index));
                else complete=false;
            }
            alternatives.add(List.copyOf(conditions));
        }
        return new RuleSet(original.programmeId(),original.version(),complete,List.copyOf(alternatives));
    }
    private static String classify(Assessment assessment) {
        if(assessment.eligible()) return "ELIGIBLE";
        // An OR pathway is definitely impossible only when EVERY branch has a known failure.
        boolean failed=!assessment.alternatives().isEmpty() && assessment.alternatives().stream()
                .allMatch(branch->branch.stream().anyMatch(f->f.status()==Status.NOT_MET));
        return failed?"NOT_MET":"UNKNOWN";
    }
}
