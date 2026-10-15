package com.yangdoujiao.website.planningagent.agent;
import java.util.*;
/** Test-only deterministic provider; never registered as a production bean. */
final class ScriptedPlanningModel implements PlanningModel {
    private final Iterator<AgentReply> replies;
    ScriptedPlanningModel(List<AgentReply> replies) { this.replies=replies.iterator(); }
    public AgentReply next(ModelContext context) { return replies.next(); }
}
