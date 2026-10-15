package com.yangdoujiao.website.admin;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public final class AdminCatalogDtos {
    private AdminCatalogDtos() {}

    public record PageResponse<T>(List<T> items, int page, int size, long total, int totalPages) {}
    public record Option(Long id, String code, String nameZh, String nameEn) {}
    public record Options(List<Option> countries, List<Option> categories, List<Option> studyLevels,
            List<Option> courseModes, List<Option> universities) {}

    public record UniversityItem(Long id, String universityCode, String slug, String nameZh, String nameEn,
            String countryCode, String countryNameZh, String countryNameEn, String regionZh, String regionEn,
            String descriptionZh, String descriptionEn, String officialUrl, String logoUrl, String status,
            long programmeCount, OffsetDateTime updatedAt) {}

    public record UniversityInput(
            @Pattern(regexp = "^$|^[A-Z][A-Z0-9_]{0,63}$") String universityCode,
            @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$") @Size(max = 200) String slug,
            @Size(max = 200) String nameZh,
            @Size(max = 200) String nameEn,
            @NotBlank @Pattern(regexp = "^[A-Z]{2}$") String countryCode,
            @Size(max = 200) String regionZh,
            @Size(max = 200) String regionEn,
            String descriptionZh,
            String descriptionEn,
            @Size(max = 1000) String officialUrl,
            @Size(max = 2000) String logoUrl) {}

    public record ProgrammeItem(Long id, String programmeCode, Long universityId, String universityName,
            String slug, String nameZh, String nameEn, Long categoryId, String categoryName,
            Long studyLevelId, String studyLevelName, Long courseModeId, String courseModeName,
            String descriptionZh, String descriptionEn, Integer durationMonths, String durationDisplay,
            BigDecimal tuitionMin, BigDecimal tuitionMax, String tuitionCurrency, String tuitionDisplay,
            String admissionsZh, String admissionsEn, String curriculumZh, String curriculumEn,
            String officialUrl, String status, OffsetDateTime updatedAt) {}

    public record ProgrammeInput(
            @Pattern(regexp = "^$|^[A-Z][A-Z0-9_]{0,63}$") String programmeCode,
            @NotNull @Positive Long universityId,
            @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$") @Size(max = 200) String slug,
            @Size(max = 200) String nameZh,
            @Size(max = 200) String nameEn,
            @NotNull @Positive Long categoryId,
            @Positive Long studyLevelId,
            @Positive Long courseModeId,
            String descriptionZh,
            String descriptionEn,
            @Positive Integer durationMonths,
            @Size(max = 100) String durationDisplay,
            @DecimalMin("0") BigDecimal tuitionMin,
            @DecimalMin("0") BigDecimal tuitionMax,
            @Pattern(regexp = "^[A-Z]{3}$") String tuitionCurrency,
            @Size(max = 200) String tuitionDisplay,
            String admissionsZh,
            String admissionsEn,
            String curriculumZh,
            String curriculumEn,
            @Size(max = 1000) String officialUrl) {}

    public record StatusInput(@NotNull Boolean enabled) {}
}
