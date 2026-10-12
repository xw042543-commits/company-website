package com.yangdoujiao.website.community;
import tools.jackson.databind.JsonNode;
public record CommunityPostRequest(JsonNode body, JsonNode title, JsonNode category, JsonNode universityId, JsonNode imageIds) {
    public CommunityPostRequest(JsonNode body, JsonNode title, JsonNode category, JsonNode universityId) {
        this(body, title, category, universityId, null);
    }
    public CommunityPostRequest(JsonNode body) {
        this(body, null, null, null);
    }
}
