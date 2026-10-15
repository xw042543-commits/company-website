package com.yangdoujiao.website.programme;

/** Official original text and a separately recorded Chinese translation; absent facts remain null. */
public record OfficialCourseModule(
        String nameZh, String nameEn, String descriptionZh, String descriptionEn,
        String courseCode, String credits, String requirement,
        String sourceUrl, String sourceCheckedAt, String curriculumVersion, String evidence,
        String translationMethod, String translationCheckedAt
) {}
