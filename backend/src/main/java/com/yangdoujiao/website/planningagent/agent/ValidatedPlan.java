package com.yangdoujiao.website.planningagent.agent;
import java.util.List;
public record ValidatedPlan(long profileVersion,List<ProgrammeDecision> programmes,List<String> generalNextSteps,
        String sourceFingerprint) {
    public ValidatedPlan(long profileVersion,List<ProgrammeDecision> programmes,List<String> generalNextSteps) {
        this(profileVersion,programmes,generalNextSteps,null);
    }
}
