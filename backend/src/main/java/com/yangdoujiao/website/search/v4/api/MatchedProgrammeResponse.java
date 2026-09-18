package com.yangdoujiao.website.search.v4.api;

import java.math.BigDecimal;
import java.util.List;

public record MatchedProgrammeResponse(
        Long id, String programmeCode, String nameZh, String nameEn,
        String categoryCode, String studyLevelCode, String courseModeCode,
        List<String> languageCodes, Integer durationMonths, List<String> intakeMonths,
        BigDecimal tuitionTotalRmbMin, BigDecimal tuitionTotalRmbMax,
        String durationDisplay, List<String> intakeDisplayTexts, String tuitionDisplay
) {
    public MatchedProgrammeResponse {
        languageCodes = List.copyOf(languageCodes);
        intakeMonths = List.copyOf(intakeMonths);
        intakeDisplayTexts = List.copyOf(intakeDisplayTexts);
    }
}
