package com.yangdoujiao.website.search.v4;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;

import org.springframework.stereotype.Component;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.CountryRepository;
import com.yangdoujiao.website.catalog.CourseModeRepository;
import com.yangdoujiao.website.catalog.LanguageRepository;
import com.yangdoujiao.website.catalog.StudyLevelRepository;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

@Component
public class SearchFilterCodeValidator {

    private final CountryRepository countries;
    private final SubjectCategoryRepository categories;
    private final StudyLevelRepository levels;
    private final CourseModeRepository modes;
    private final LanguageRepository languages;

    public SearchFilterCodeValidator(
            CountryRepository countries,
            SubjectCategoryRepository categories,
            StudyLevelRepository levels,
            CourseModeRepository modes,
            LanguageRepository languages
    ) {
        this.countries = countries;
        this.categories = categories;
        this.levels = levels;
        this.modes = modes;
        this.languages = languages;
    }

    public void validate(UniversitySearchCriteria criteria) {
        Map<String, String> errors = new LinkedHashMap<>();
        validateCodes("country", criteria.countries(), countries::existsByCode, "must reference an existing country", errors);
        validateCodes("category", criteria.categories(),
                code -> categories.existsByCodeAndStatus(code, CategoryStatus.PUBLISHED),
                "must reference a published category", errors);
        validateCodes("level", criteria.levels(),
                code -> levels.existsByCodeAndStatus(code, CategoryStatus.PUBLISHED),
                "must reference a published level", errors);
        validateCodes("mode", criteria.modes(),
                code -> modes.existsByCodeAndStatus(code, CategoryStatus.PUBLISHED),
                "must reference a published mode", errors);
        validateCodes("language", criteria.languages(),
                code -> languages.existsByCodeAndStatus(code, CategoryStatus.PUBLISHED),
                "must reference a published language", errors);
        if (!errors.isEmpty()) {
            throw new SearchValidationException(errors);
        }
    }

    private static void validateCodes(
            String field,
            Set<String> codes,
            Predicate<String> exists,
            String message,
            Map<String, String> errors
    ) {
        for (String code : codes) {
            if (!exists.test(code)) {
                errors.putIfAbsent(field, message);
            }
        }
    }
}
