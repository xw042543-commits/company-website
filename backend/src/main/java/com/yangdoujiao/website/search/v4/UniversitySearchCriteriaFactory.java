package com.yangdoujiao.website.search.v4;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

@Component
public class UniversitySearchCriteriaFactory {

    private static final int MAX_KEYWORD_LENGTH = 100;
    private static final int MAX_DIMENSION_VALUES = 20;
    private static final int MAX_PAGE_SIZE = 48;

    public UniversitySearchCriteria create(UniversitySearchQuery query) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        String keyword = normalizeKeyword(query.getQ());
        if (keyword != null && keyword.length() > MAX_KEYWORD_LENGTH) {
            fieldErrors.put("q", "must be at most 100 characters");
        }

        Set<String> categories = normalizeCodes("category", query.getCategory(), fieldErrors);
        Set<String> levels = normalizeCodes("level", query.getLevel(), fieldErrors);
        Set<String> countries = normalizeCodes("country", query.getCountry(), fieldErrors);
        Set<String> modes = normalizeCodes("mode", query.getMode(), fieldErrors);
        Set<String> languages = normalizeCodes("language", query.getLanguage(), fieldErrors);

        Integer duration = parsePositiveInteger(query.getDuration(), "duration", true, fieldErrors);
        YearMonth intake = parseIntake(query.getIntake(), fieldErrors);
        BigDecimal tuitionMin = parseAmount(query.getTuitionMin(), "tuitionMin", fieldErrors);
        BigDecimal tuitionMax = parseAmount(query.getTuitionMax(), "tuitionMax", fieldErrors);
        Integer page = parsePositiveInteger(defaultIfNull(query.getPage(), "1"), "page", false, fieldErrors);
        Integer pageSize = parsePositiveInteger(defaultIfNull(query.getSize(), "12"), "size", false, fieldErrors);

        if (pageSize != null && pageSize > MAX_PAGE_SIZE) {
            fieldErrors.put("size", "must be less than or equal to 48");
        }
        if (tuitionMin != null && tuitionMax != null && tuitionMax.compareTo(tuitionMin) < 0) {
            fieldErrors.putIfAbsent(
                    "tuitionMax",
                    "must be greater than or equal to tuitionMin"
            );
        }

        String sort = normalizeOptional(query.getSort());
        if (sort == null) {
            sort = "relevance";
        }
        if (!"relevance".equals(sort)) {
            fieldErrors.put("sort", "must be relevance");
        }

        if (!fieldErrors.isEmpty()) {
            throw new SearchValidationException(fieldErrors);
        }

        return new UniversitySearchCriteria(
                keyword,
                categories,
                levels,
                countries,
                modes,
                languages,
                duration,
                intake,
                tuitionMin,
                tuitionMax,
                page,
                pageSize
        );
    }

    private String normalizeKeyword(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null ? null : normalized.replaceAll("\\s+", " ");
    }

    private Set<String> normalizeCodes(
            String field,
            List<String> values,
            Map<String, String> fieldErrors
    ) {
        if (values == null || values.isEmpty()) {
            return Set.of();
        }
        if (values.size() > MAX_DIMENSION_VALUES) {
            fieldErrors.put(field, "must contain at most 20 values");
        }

        Set<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            String code = normalizeOptional(value);
            if (code != null) {
                normalized.add(code.toUpperCase(Locale.ROOT));
            }
        }
        return normalized;
    }

    private Integer parsePositiveInteger(
            String value,
            String field,
            boolean optional,
            Map<String, String> fieldErrors
    ) {
        if (value == null || (optional && value.isBlank())) {
            return null;
        }
        try {
            int parsed = Integer.parseInt(value.strip());
            if (parsed < 1) {
                fieldErrors.put(
                        field,
                        "duration".equals(field)
                                ? "must be a positive integer"
                                : "must be greater than or equal to 1"
                );
                return null;
            }
            return parsed;
        } catch (NumberFormatException exception) {
            fieldErrors.put(field, "must be a positive integer");
            return null;
        }
    }

    private YearMonth parseIntake(String value, Map<String, String> fieldErrors) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        if (!normalized.matches("\\d{4}-\\d{2}")) {
            fieldErrors.put("intake", "must use YYYY-MM format");
            return null;
        }
        try {
            return YearMonth.parse(normalized);
        } catch (DateTimeException exception) {
            fieldErrors.put("intake", "must use YYYY-MM format");
            return null;
        }
    }

    private BigDecimal parseAmount(
            String value,
            String field,
            Map<String, String> fieldErrors
    ) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        try {
            BigDecimal amount = new BigDecimal(normalized);
            if (amount.signum() < 0) {
                fieldErrors.put(field, "must be greater than or equal to 0");
                return null;
            }
            return amount;
        } catch (NumberFormatException exception) {
            fieldErrors.put(field, "must be a non-negative number");
            return null;
        }
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.strip();
        return normalized.isEmpty() ? null : normalized;
    }

    private String defaultIfNull(String value, String defaultValue) {
        return value == null ? defaultValue : value;
    }
}
