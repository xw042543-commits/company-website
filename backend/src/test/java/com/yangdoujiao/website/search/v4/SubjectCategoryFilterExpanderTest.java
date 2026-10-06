package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

class SubjectCategoryFilterExpanderTest {

    private final SubjectCategoryRepository repository = mock(SubjectCategoryRepository.class);
    private final SubjectCategoryFilterExpander expander = new SubjectCategoryFilterExpander(repository);

    @Test
    void expandsASelectedParentToEveryPublishedDescendantAndPreservesOtherFilters() {
        SubjectCategory business = category("BUSINESS", null);
        SubjectCategory accounting = category("ACCOUNTING_FINANCE", business);
        SubjectCategory management = category("BUSINESS_MANAGEMENT", business);
        SubjectCategory specialist = category("ENTREPRENEURSHIP", management);
        SubjectCategory stem = category("STEM", null);
        SubjectCategory computing = category("COMPUTING_IT", stem);
        when(repository.findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED))
                .thenReturn(List.of(business, accounting, management, specialist, stem, computing));
        UniversitySearchCriteria criteria = new UniversitySearchCriteria(
                null, Set.of("BUSINESS"), Set.of("BACHELOR"), Set.of("MY"), Set.of("ON_CAMPUS"),
                Set.of("EN"), 36, YearMonth.of(2027, 9), new BigDecimal("100000"),
                new BigDecimal("300000"), 2, 12);

        UniversitySearchCriteria expanded = expander.expand(criteria);

        assertThat(expanded.categories()).containsExactly(
                "BUSINESS", "ACCOUNTING_FINANCE", "BUSINESS_MANAGEMENT", "ENTREPRENEURSHIP");
        assertThat(expanded.levels()).containsExactly("BACHELOR");
        assertThat(expanded.countries()).containsExactly("MY");
        assertThat(expanded.modes()).containsExactly("ON_CAMPUS");
        assertThat(expanded.languages()).containsExactly("EN");
        assertThat(expanded.durationMonths()).isEqualTo(36);
        assertThat(expanded.intakeMonth()).isEqualTo(YearMonth.of(2027, 9));
        assertThat(expanded.tuitionMin()).isEqualByComparingTo("100000");
        assertThat(expanded.tuitionMax()).isEqualByComparingTo("300000");
        assertThat(expanded.page()).isEqualTo(2);
        assertThat(expanded.pageSize()).isEqualTo(12);
    }

    @Test
    void keepsALeafSelectionNarrowInsteadOfAddingItsParentOrSibling() {
        SubjectCategory business = category("BUSINESS", null);
        SubjectCategory accounting = category("ACCOUNTING_FINANCE", business);
        SubjectCategory management = category("BUSINESS_MANAGEMENT", business);
        when(repository.findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED))
                .thenReturn(List.of(business, accounting, management));
        UniversitySearchCriteria criteria = criteria(Set.of("ACCOUNTING_FINANCE"));

        assertThat(expander.expand(criteria).categories()).containsExactly("ACCOUNTING_FINANCE");
    }

    @Test
    void skipsTheCategoryQueryWhenNoCategoryFilterWasSelected() {
        UniversitySearchCriteria criteria = criteria(Set.of());

        assertThat(expander.expand(criteria)).isSameAs(criteria);
        verify(repository, never()).findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED);
    }

    @Test
    void neverDropsAValidatedCategoryIfTheDictionaryChangesBetweenValidationAndExpansion() {
        when(repository.findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)).thenReturn(List.of());

        assertThat(expander.expand(criteria(Set.of("BUSINESS"))).categories()).containsExactly("BUSINESS");
    }

    private static SubjectCategory category(String code, SubjectCategory parent) {
        return new SubjectCategory(code, code, code, parent, 100, CategoryStatus.PUBLISHED);
    }

    private static UniversitySearchCriteria criteria(Set<String> categories) {
        return new UniversitySearchCriteria(null, categories, Set.of("BACHELOR"), Set.of(), Set.of(), Set.of(),
                null, null, null, null, 1, 12);
    }
}
