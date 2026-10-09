package com.yangdoujiao.website.university.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeIntake;

public record UniversityProgrammeResponse(
        Long id,
        String programmeCode,
        String slug,
        String nameZh,
        String nameEn,
        String descriptionZh,
        String descriptionEn,
        String categoryCode,
        String studyLevelCode,
        String courseModeCode,
        List<String> languageCodes,
        Integer durationMonths,
        String durationDisplay,
        BigDecimal tuitionMin,
        BigDecimal tuitionMax,
        String tuitionCurrency,
        String tuitionFeePeriod,
        BigDecimal tuitionTotalRmbMin,
        BigDecimal tuitionTotalRmbMax,
        BigDecimal exchangeRate,
        LocalDate exchangeRateDate,
        String tuitionDisplay,
        List<String> intakeMonths,
        List<String> intakeDisplayTexts,
        String imageUrl
) {
    public UniversityProgrammeResponse {
        languageCodes = List.copyOf(languageCodes);
        intakeMonths = List.copyOf(intakeMonths);
        intakeDisplayTexts = List.copyOf(intakeDisplayTexts);
    }

    public static UniversityProgrammeResponse from(
            Programme programme,
            List<ProgrammeIntake> intakes,
            String imageUrl
    ) {
        return new UniversityProgrammeResponse(
                programme.getId(),
                programme.getProgrammeCode(),
                programme.getSlug(),
                programme.getNameZh(),
                programme.getNameEn(),
                programme.getDescriptionZh(),
                programme.getDescriptionEn(),
                programme.getSubjectCategory().getCode(),
                programme.getStudyLevel() == null ? null : programme.getStudyLevel().getCode(),
                programme.getCourseMode() == null ? null : programme.getCourseMode().getCode(),
                programme.getLanguages().stream()
                        .map(language -> language.getCode())
                        .sorted()
                        .toList(),
                programme.getDurationMonths(),
                programme.getDurationDisplay(),
                programme.getTuitionMin(),
                programme.getTuitionMax(),
                programme.getTuitionCurrency(),
                programme.getTuitionFeePeriod().name(),
                programme.getTuitionTotalRmbMin(),
                programme.getTuitionTotalRmbMax(),
                programme.getExchangeRate(),
                programme.getExchangeRateDate(),
                programme.getTuitionDisplay(),
                intakes.stream()
                        .map(ProgrammeIntake::getIntakeDate)
                        .filter(date -> date != null)
                        .sorted()
                        .map(date -> YearMonth.from(date).toString())
                        .toList(),
                intakes.stream()
                        .sorted(Comparator.comparing(
                                ProgrammeIntake::getIntakeDate,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ))
                        .map(ProgrammeIntake::getDisplayText)
                        .toList(),
                imageUrl
        );
    }
}
