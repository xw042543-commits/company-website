package com.yangdoujiao.website.planningagent.agent;
import java.util.List;
public record PlanDraft(long profileVersion,List<Long> programmeIds,List<Long> evidenceIds,List<String> generalNextSteps) {}
