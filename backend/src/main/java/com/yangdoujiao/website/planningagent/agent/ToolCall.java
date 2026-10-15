package com.yangdoujiao.website.planningagent.agent;
import tools.jackson.databind.JsonNode;
public record ToolCall(String name, JsonNode arguments) {}
