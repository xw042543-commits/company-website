package com.yangdoujiao.website.miniapp;

import java.math.BigDecimal;
import java.util.List;

import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeDetailSection;
import com.yangdoujiao.website.programme.ProgrammeIntake;
import com.yangdoujiao.website.university.University;

public record MiniappProgrammeDetailResponse(
        Long id,
        String programmeCode,
        String slug,
        String nameZh,
        String nameEn,
        String universitySlug,
        String universityNameZh,
        String universityNameEn,
        String cityZh,
        String cityEn,
        String descriptionZh,
        String descriptionEn,
        String categoryCode,
        String studyLevelCode,
        String courseModeCode,
        List<String> languageCodes,
        String studyPaceDisplay,
        Integer durationMonths,
        String durationDisplay,
        BigDecimal tuitionMin,
        BigDecimal tuitionMax,
        String tuitionCurrency,
        String tuitionDisplay,
        List<String> intakeDisplayTexts,
        List<DetailSection> sections,
        String imageUrl
) {
    public record DetailSection(
            String type,
            String titleZh,
            String titleEn,
            String bodyZh,
            String bodyEn,
            int sortOrder
    ) {
        static DetailSection from(ProgrammeDetailSection section) {
            return new DetailSection(section.getSectionType().name(), section.getTitleZh(), section.getTitleEn(),
                    section.getBodyZh(), section.getBodyEn(), section.getSortOrder());
        }
    }

    static MiniappProgrammeDetailResponse from(Programme programme, University university,
            List<ProgrammeIntake> intakes, List<ProgrammeDetailSection> sections, String imageUrl) {
        return new MiniappProgrammeDetailResponse(
                programme.getId(), programme.getProgrammeCode(), programme.getSlug(), programme.getNameZh(),
                programme.getNameEn(), university.getSlug(), university.getNameZh(), university.getNameEn(),
                university.getCityZh(), university.getCityEn(), programme.getDescriptionZh(),
                programme.getDescriptionEn(), programme.getSubjectCategory().getCode(),
                programme.getStudyLevel() == null ? null : programme.getStudyLevel().getCode(),
                programme.getCourseMode() == null ? null : programme.getCourseMode().getCode(),
                programme.getLanguages().stream().map(language -> language.getCode()).sorted().toList(),
                programme.getStudyPaceDisplay(), programme.getDurationMonths(), programme.getDurationDisplay(),
                programme.getTuitionMin(), programme.getTuitionMax(), programme.getTuitionCurrency(),
                programme.getTuitionDisplay(), intakes.stream().map(ProgrammeIntake::getDisplayText).toList(),
                sections.stream().map(DetailSection::from).toList(), imageUrl);
    }
}
