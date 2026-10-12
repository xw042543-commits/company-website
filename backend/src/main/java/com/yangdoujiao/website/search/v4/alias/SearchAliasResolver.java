package com.yangdoujiao.website.search.v4.alias;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.CountryRepository;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.search.v4.SearchValidationException;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;

@Component
public class SearchAliasResolver {

    private final SearchAliasRepository aliases;
    private final CountryRepository countries;
    private final SubjectCategoryRepository categories;
    private final ProgrammeRepository programmes;

    public SearchAliasResolver(
            SearchAliasRepository aliases,
            CountryRepository countries,
            SubjectCategoryRepository categories,
            ProgrammeRepository programmes
    ) {
        this.aliases = aliases;
        this.countries = countries;
        this.categories = categories;
        this.programmes = programmes;
    }

    public ResolvedSearchTerm resolve(String keyword) {
        String text = normalizeText(keyword);
        if (text == null) {
            return new ResolvedSearchTerm(null, null, null);
        }

        Set<AliasTarget> targets = new LinkedHashSet<>();
        aliases.findAllByNormalizedAliasAndStatus(normalizeForLookup(text), SearchAliasStatus.PUBLISHED)
                .forEach(alias -> targets.add(new AliasTarget(alias.getTargetType(), alias.getTargetCode())));
        if (targets.isEmpty()) {
            return new ResolvedSearchTerm(text, null, null);
        }
        if (targets.size() != 1) {
            throw new SearchValidationException(Map.of("q", "alias resolves to conflicting targets"));
        }
        AliasTarget target = targets.iterator().next();
        if (!isAvailable(target)) {
            throw new SearchValidationException(Map.of("q", "alias target is unavailable"));
        }
        return new ResolvedSearchTerm(text, target.type(), target.code());
    }

    private static String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.strip().replaceAll("\\s+", " ");
        return normalized.isEmpty() ? null : normalized;
    }

    private static String normalizeForLookup(String text) {
        return text.toLowerCase(Locale.ROOT);
    }

    private boolean isAvailable(AliasTarget target) {
        return switch (target.type()) {
            case COUNTRY -> countries.existsByCode(target.code());
            case SUBJECT_CATEGORY -> categories.existsByCodeAndStatus(target.code(), CategoryStatus.PUBLISHED);
            case PROGRAMME -> programmes.existsByProgrammeCodeAndStatus(target.code(), CategoryStatus.PUBLISHED);
        };
    }

    private record AliasTarget(SearchAliasTargetType type, String code) {
    }
}
