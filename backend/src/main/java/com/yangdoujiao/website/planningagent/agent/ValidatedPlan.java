package com.yangdoujiao.website.planningagent.agent;
import java.util.List;
public record ValidatedPlan(long profileVersion,List<ProgrammeDecision> programmes,List<String> generalNextSteps) {}
