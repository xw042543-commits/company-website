package com.yangdoujiao.website.community;
import tools.jackson.databind.JsonNode;
public record CommunityCommentRequest(JsonNode body, JsonNode parentCommentId) {}
