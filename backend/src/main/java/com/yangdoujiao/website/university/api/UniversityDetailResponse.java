package com.yangdoujiao.website.university.api;

import com.yangdoujiao.website.catalog.Country;
import com.yangdoujiao.website.university.University;

public record UniversityDetailResponse(
        Long id,
        String slug,
        String nameZh,
        String nameEn,
        String countryCode,
        String countryNameZh,
        String countryNameEn,
        String cityZh,
        String cityEn,
        String descriptionZh,
        String descriptionEn,
        boolean popular
) {
    public static UniversityDetailResponse from(University university) {
        Country country = university.getCountryReference();
        return new UniversityDetailResponse(
                university.getId(),
                university.getSlug(),
                university.getNameZh(),
                university.getNameEn(),
                country == null ? null : country.getCode(),
                country == null ? null : country.getNameZh(),
                country == null ? null : country.getNameEn(),
                university.getCityZh(),
                university.getCityEn(),
                university.getDescriptionZh(),
                university.getDescriptionEn(),
                university.isPopular()
        );
    }
}
