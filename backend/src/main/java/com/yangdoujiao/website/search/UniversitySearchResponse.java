package com.yangdoujiao.website.search;

public record UniversitySearchResponse(
        String id,
        String name,
        String slug,
        String country,
        boolean popular
) {
    public static UniversitySearchResponse from(UniversitySearchDocument document) {
        return new UniversitySearchResponse(
                document.getId(),
                document.getName(),
                document.getSlug(),
                document.getCountry(),
                document.isPopular()
        );
    }
}
