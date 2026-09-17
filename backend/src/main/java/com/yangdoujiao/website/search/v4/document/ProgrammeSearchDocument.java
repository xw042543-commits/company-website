package com.yangdoujiao.website.search.v4.document;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.InnerField;
import org.springframework.data.elasticsearch.annotations.MultiField;

import lombok.Getter;

@Getter
public final class ProgrammeSearchDocument {

    @Field(type = FieldType.Long)
    private final Long id;

    @Field(type = FieldType.Keyword)
    private final String programmeCode;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String nameZh;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String nameEn;

    @Field(type = FieldType.Keyword)
    private final String categoryCode;

    @Field(type = FieldType.Keyword)
    private final String studyLevelCode;

    @Field(type = FieldType.Keyword)
    private final String courseModeCode;

    @Field(type = FieldType.Keyword)
    private final List<String> languageCodes;

    @Field(type = FieldType.Integer)
    private final Integer durationMonths;

    // YYYY-MM is lexicographically sortable and does not invent an intake day.
    @Field(type = FieldType.Keyword)
    private final List<String> intakeMonths;

    @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
    private final BigDecimal tuitionTotalRmbMin;

    @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
    private final BigDecimal tuitionTotalRmbMax;

    @Field(type = FieldType.Text, index = false)
    private final String durationDisplay;

    @Field(type = FieldType.Text, index = false)
    private final List<String> intakeDisplayTexts;

    @Field(type = FieldType.Text, index = false)
    private final String tuitionDisplay;

    public ProgrammeSearchDocument(Long id, String programmeCode, String nameZh, String nameEn,
            String categoryCode, String studyLevelCode, String courseModeCode, List<String> languageCodes,
            Integer durationMonths, List<String> intakeMonths, BigDecimal tuitionTotalRmbMin,
            BigDecimal tuitionTotalRmbMax, String durationDisplay, List<String> intakeDisplayTexts,
            String tuitionDisplay) {
        this.id = id;
        this.programmeCode = programmeCode;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.categoryCode = categoryCode;
        this.studyLevelCode = studyLevelCode;
        this.courseModeCode = courseModeCode;
        this.languageCodes = List.copyOf(languageCodes);
        this.durationMonths = durationMonths;
        this.intakeMonths = List.copyOf(intakeMonths);
        this.tuitionTotalRmbMin = tuitionTotalRmbMin;
        this.tuitionTotalRmbMax = tuitionTotalRmbMax;
        this.durationDisplay = durationDisplay;
        this.intakeDisplayTexts = List.copyOf(intakeDisplayTexts);
        this.tuitionDisplay = tuitionDisplay;
    }
}
