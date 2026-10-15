package com.yangdoujiao.website.university.api;

public record UniversityProgrammeCategoryResponse(
        String code,
        String nameZh,
        String nameEn,
        long programmeCount
) {
}
