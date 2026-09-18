package com.yangdoujiao.website.search.v4.api;

import java.util.List;

public record UniversitySearchItemResponse(
        Long id, String slug, String nameZh, String nameEn,
        String countryCode, String countryNameZh, String countryNameEn,
        String cityZh, String cityEn, boolean popular,
        long matchedProgrammeCount, List<MatchedProgrammeResponse> matchedProgrammes
) {
    public UniversitySearchItemResponse {
        matchedProgrammes = List.copyOf(matchedProgrammes);
    }
}
