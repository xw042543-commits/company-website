package com.yangdoujiao.website.catalog.api;

import java.util.List;

public record FilterOptionsResponse(
        List<FilterOptionResponse> countries,
        List<FilterOptionResponse> subjectCategories,
        List<FilterOptionResponse> studyLevels,
        List<FilterOptionResponse> courseModes,
        List<FilterOptionResponse> languages
) {
}
