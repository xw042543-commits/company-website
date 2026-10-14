package com.yangdoujiao.website.catalog.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class StudyLevelDisplayNamesTest {

    @ParameterizedTest
    @CsvSource({
            "FOUNDATION, Foundation, 预科",
            "DIPLOMA, 文凭, 大专",
            "BACHELOR, Bachelor's Degree, 本科",
            "MASTER, Master's Degree, 硕士",
            "DOCTOR, Doctor, 博士",
            "DOCTORATE, Doctorate, 博士",
            "PHD, PhD, 博士",
            "DOCTORAL_DEGREE, Doctoral Degree, 博士"
    })
    void canonicalizesChineseStudyLevelNames(String code, String sourceName, String expected) {
        assertThat(StudyLevelDisplayNames.chineseName(code, sourceName, sourceName)).isEqualTo(expected);
    }
}
