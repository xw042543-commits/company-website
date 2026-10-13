package com.yangdoujiao.website.university.api;

import java.util.List;

import com.yangdoujiao.website.catalog.Country;
import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityProfileSection;

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
        boolean popular,
        String imageUrl,
        List<ProfileSection> sections
) {
    public record ProfileSection(String type, String titleZh, String titleEn,
            String bodyZh, String bodyEn, int sortOrder) {
        static ProfileSection from(UniversityProfileSection section) {
            return new ProfileSection(section.getSectionType().name(), section.getTitleZh(), section.getTitleEn(),
                    section.getBodyZh(), section.getBodyEn(), section.getSortOrder());
        }
    }

    public static UniversityDetailResponse from(University university, String imageUrl,
            List<UniversityProfileSection> sections) {
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
                university.isPopular(),
                imageUrl,
                sections.stream().map(ProfileSection::from).toList()
        );
    }
}
