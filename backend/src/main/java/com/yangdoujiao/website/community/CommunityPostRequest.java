package com.yangdoujiao.website.community;
import tools.jackson.databind.JsonNode;
public record CommunityPostRequest(JsonNode body, JsonNode title, JsonNode category, JsonNode universityId) {
    public CommunityPostRequest(JsonNode body) {
        this(body, null, null, null);
    }
}
