package com.yangdoujiao.website.search.v4.model;

import java.math.BigDecimal;
import java.util.List;

public record UniversitySearchResult(
        Long id, String slug, String nameZh, String nameEn,
        String countryCode, String countryNameZh, String countryNameEn,
        String cityZh, String cityEn, boolean popular,
        long matchedProgrammeCount, List<MatchedProgramme> matchedProgrammes
) {
    public UniversitySearchResult {
        matchedProgrammes = List.copyOf(matchedProgrammes);
    }

    public record MatchedProgramme(
            Long id, String programmeCode, String nameZh, String nameEn,
            String categoryCode, String studyLevelCode, String courseModeCode,
            List<String> languageCodes, Integer durationMonths, List<String> intakeMonths,
            BigDecimal tuitionTotalRmbMin, BigDecimal tuitionTotalRmbMax,
            String durationDisplay, List<String> intakeDisplayTexts, String tuitionDisplay
    ) {
        public MatchedProgramme {
            languageCodes = List.copyOf(languageCodes);
            intakeMonths = List.copyOf(intakeMonths);
            intakeDisplayTexts = List.copyOf(intakeDisplayTexts);
        }
    }
}
