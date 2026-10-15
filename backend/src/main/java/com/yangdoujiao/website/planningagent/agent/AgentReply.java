package com.yangdoujiao.website.planningagent.agent;
import java.util.List;
import java.util.Set;
import tools.jackson.databind.*;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.core.StreamReadFeature;
/** questions contain controlled template IDs, never model-authored factual prose. */
public record AgentReply(List<String> questions, List<ToolCall> calls, PlanDraft plan) {
    private static final ObjectMapper STRICT_JSON=JsonMapper.builder()
            .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION)
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).build();
    /** External providers must use this closed-schema decoder rather than permissive bean coercion. */
    public static AgentReply decode(String payload,ObjectMapper json) {
        try {
            require(payload!=null && payload.length()<=32000);
            JsonNode root=STRICT_JSON.readTree(payload);
            object(root,Set.of("questions","calls","plan"));
            strings(root.get("questions"),2);
            JsonNode calls=root.get("calls");require(calls!=null && calls.isArray() && calls.size()<=8);
            for(JsonNode call:calls) {
                object(call,Set.of("name","arguments"));
                require(call.get("name").isTextual() && call.get("name").textValue().length()<=64 && call.get("arguments").isObject());
            }
            JsonNode plan=root.get("plan");
            if(!plan.isNull()) {
                object(plan,Set.of("profileVersion","programmeIds","evidenceIds","generalNextSteps"));
                require(plan.get("profileVersion").isIntegralNumber() && plan.get("profileVersion").canConvertToLong());
                ids(plan.get("programmeIds"),5);ids(plan.get("evidenceIds"),500);strings(plan.get("generalNextSteps"),3);
            }
            return json.treeToValue(root,AgentReply.class);
        } catch(Exception invalid) { throw new PlanningOrchestrator.InvalidReply(); }
    }
    private static void object(JsonNode node,Set<String> fields) {
        require(node!=null && node.isObject() && node.size()==fields.size() && fields.containsAll(node.propertyNames()));
    }
    private static void strings(JsonNode node,int max) {
        require(node!=null && node.isArray() && node.size()<=max);
        for(JsonNode value:node) require(value.isTextual() && value.textValue().length()<=64);
    }
    private static void ids(JsonNode node,int max) {
        require(node!=null && node.isArray() && node.size()<=max);
        for(JsonNode value:node) require(value.isIntegralNumber() && value.canConvertToLong() && value.longValue()>0);
    }
    private static void require(boolean condition) { if(!condition) throw new PlanningOrchestrator.InvalidReply(); }
}
