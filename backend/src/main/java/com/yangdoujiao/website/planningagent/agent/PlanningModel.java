package com.yangdoujiao.website.planningagent.agent;
/** Provider must honor context.deadline and interruption; no provider is enabled by default. */
@FunctionalInterface
public interface PlanningModel { AgentReply next(ModelContext context); }
