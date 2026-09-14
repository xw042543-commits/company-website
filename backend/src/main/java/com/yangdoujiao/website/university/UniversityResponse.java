package com.yangdoujiao.website.university;

import java.time.OffsetDateTime;

public record UniversityResponse(
        Long id,
        String name,
        String slug,
        String country,
        boolean popular,
        OffsetDateTime createdAt
) {
    public static UniversityResponse from(University university) {
        return new UniversityResponse(
                university.getId(),
                university.getName(),
                university.getSlug(),
                university.getCountry(),
                university.isPopular(),
                university.getCreatedAt()
        );
    }
}
