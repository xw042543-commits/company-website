package com.yangdoujiao.website.community;

import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.JsonNode;

public record CommunityPostMetadata(String title, CommunityCategory category, Long universityId) {
    static CommunityPostMetadata from(CommunityPostRequest request) {
        JsonNode title = request == null ? null : request.title();
        JsonNode category = request == null ? null : request.category();
        JsonNode university = request == null ? null : request.universityId();
        String normalizedTitle = title == null || title.isNull() ? null
                : CommunityWriteService.normalize(title, 60, () -> new ApiException(HttpStatus.BAD_REQUEST,
                        "INVALID_COMMUNITY_TITLE", "Community title is blank, too long, or contains invalid characters"));
        CommunityCategory normalizedCategory = CommunityCategory.GENERAL;
        if (category != null) {
            if (!category.isString()) throw invalidCategory();
            try { normalizedCategory = CommunityCategory.valueOf(category.asString()); }
            catch (IllegalArgumentException exception) { throw invalidCategory(); }
        }
        Long universityId = null;
        if (university != null && !university.isNull()) {
            if (!university.isString()) throw invalidUniversity();
            try { universityId = CommunityWriteService.decimalId(university.asString()); }
            catch (ApiException exception) { throw invalidUniversity(); }
        }
        return new CommunityPostMetadata(normalizedTitle, normalizedCategory, universityId);
    }

    private static ApiException invalidCategory() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_CATEGORY", "Community category is invalid");
    }

    private static ApiException invalidUniversity() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_UNIVERSITY", "University ID must be a decimal string");
    }
}
