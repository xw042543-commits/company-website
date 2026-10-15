package com.yangdoujiao.website.planningagent.tools;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import com.yangdoujiao.website.planningagent.budget.*;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.*;
import com.yangdoujiao.website.planningagent.catalog.PlanningCatalogue;
import com.yangdoujiao.website.planningagent.evidence.*;

/** Internal read-only server tools. No model-supplied monetary values or model write endpoint. */
@Service
@Transactional(readOnly=true, isolation=Isolation.REPEATABLE_READ)
public class PlanningTools {
    private final PlanningCatalogue catalogue;
    private final EvidenceRepository evidence;
    private final FeeRepository fees;
    private final BudgetCalculator calculator = new BudgetCalculator();
    public PlanningTools(PlanningCatalogue catalogue, EvidenceRepository evidence, FeeRepository fees) {
        this.catalogue=catalogue; this.evidence=evidence; this.fees=fees;
    }

    public List<Evidence> getProgrammeEvidence(long programmeId) {
        return catalogue.isPublishedMalaysianProgramme(programmeId) ? evidence.findByProgrammeId(programmeId) : List.of();
    }

    public BudgetResult calculateBudget(long programmeId, Instant now, String intake, BudgetScope scope) {
        if (!catalogue.isPublishedMalaysianProgramme(programmeId)) {
            return new BudgetResult(Map.of(),false,List.of("programme:not-published-my"));
        }
        Map<Long,Evidence> sources = evidence.findByProgrammeId(programmeId).stream()
                .collect(Collectors.toMap(Evidence::id,Function.identity()));
        return calculator.calculate(fees.findByProgrammeId(programmeId),sources,now,intake,scope);
    }
}
