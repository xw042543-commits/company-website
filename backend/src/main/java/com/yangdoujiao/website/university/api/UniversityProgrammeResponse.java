package com.yangdoujiao.website.university.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeDetailSection;
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
        List<DetailSection> sections,
        String officialUrl,
        OffsetDateTime sourceCheckedAt,
        String imageUrl
) {
    public record DetailSection(
            String type,
            String titleZh,
            String titleEn,
            String bodyZh,
            String bodyEn,
            int sortOrder,
            String sourceUrl,
            OffsetDateTime sourceCheckedAt
    ) {
        static DetailSection from(ProgrammeDetailSection section) {
            return new DetailSection(section.getSectionType().name(), section.getTitleZh(), section.getTitleEn(),
                    section.getBodyZh(), section.getBodyEn(), section.getSortOrder(), section.getSourceUrl(),
                    section.getSourceCheckedAt());
        }
    }

    public UniversityProgrammeResponse {
        languageCodes = List.copyOf(languageCodes);
        intakeMonths = List.copyOf(intakeMonths);
        intakeDisplayTexts = List.copyOf(intakeDisplayTexts);
        sections = List.copyOf(sections);
    }

    public static UniversityProgrammeResponse from(
            Programme programme,
            List<ProgrammeIntake> intakes,
            List<ProgrammeDetailSection> sections,
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
                sections.stream().map(DetailSection::from).toList(),
                programme.getOfficialUrl(),
                programme.getSourceCheckedAt(),
                imageUrl
        );
    }
}
