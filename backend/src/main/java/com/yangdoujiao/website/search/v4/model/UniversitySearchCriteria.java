package com.yangdoujiao.website.search.v4.model;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

public record UniversitySearchCriteria(
        String keyword,
        Set<String> categories,
        Set<String> levels,
        Set<String> countries,
        Set<String> modes,
        Set<String> languages,
        Integer durationMonths,
        YearMonth intakeMonth,
        BigDecimal tuitionMin,
        BigDecimal tuitionMax,
        int page,
        int pageSize
) {
    public UniversitySearchCriteria {
        categories = immutableSet(categories);
        levels = immutableSet(levels);
        countries = immutableSet(countries);
        modes = immutableSet(modes);
        languages = immutableSet(languages);
    }

    private static Set<String> immutableSet(Set<String> values) {
        if (values == null || values.isEmpty()) {
            return Set.of();
        }
        return Collections.unmodifiableSet(new LinkedHashSet<>(values));
    }
}
