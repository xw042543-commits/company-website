package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

class UniversitySearchCriteriaFactoryTest {

    private final UniversitySearchCriteriaFactory factory = new UniversitySearchCriteriaFactory();

    @Test
    void appliesDefaultsAndTreatsBlankKeywordAsAbsent() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setQ("  \t  ");

        UniversitySearchCriteria criteria = factory.create(query);

        assertThat(criteria.keyword()).isNull();
        assertThat(criteria.page()).isEqualTo(1);
        assertThat(criteria.pageSize()).isEqualTo(12);
        assertThat(criteria.categories()).isEmpty();
        assertThat(criteria.levels()).isEmpty();
        assertThat(criteria.countries()).isEmpty();
        assertThat(criteria.modes()).isEmpty();
        assertThat(criteria.languages()).isEmpty();
    }

    @Test
    void normalizesKeywordWhitespaceWithoutChangingEnglishCase() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setQ("  Computer   Science\tMSc  ");

        UniversitySearchCriteria criteria = factory.create(query);

        assertThat(criteria.keyword()).isEqualTo("Computer Science MSc");
    }

    @Test
    void uppercasesAndDeduplicatesEveryCodeDimension() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setCategory(List.of(" business ", "BUSINESS", "computer_science"));
        query.setLevel(List.of("master", " MASTER "));
        query.setCountry(List.of("my", "GB", " my "));
        query.setMode(List.of("taught", "TAUGHT"));
        query.setLanguage(List.of("en", " ZH ", "EN"));

        UniversitySearchCriteria criteria = factory.create(query);

        assertThat(criteria.categories()).containsExactly("BUSINESS", "COMPUTER_SCIENCE");
        assertThat(criteria.levels()).containsExactly("MASTER");
        assertThat(criteria.countries()).containsExactly("MY", "GB");
        assertThat(criteria.modes()).containsExactly("TAUGHT");
        assertThat(criteria.languages()).containsExactly("EN", "ZH");
        assertThatThrownBy(() -> criteria.categories().add("LAW"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void parsesValidNumericAndMonthFilters() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setDuration("24");
        query.setIntake("2027-09");
        query.setTuitionMin("100000.50");
        query.setTuitionMax("300000");
        query.setPage("3");
        query.setSize("24");

        UniversitySearchCriteria criteria = factory.create(query);

        assertThat(criteria.durationMonths()).isEqualTo(24);
        assertThat(criteria.intakeMonth()).isEqualTo(YearMonth.of(2027, 9));
        assertThat(criteria.tuitionMin()).isEqualByComparingTo(new BigDecimal("100000.50"));
        assertThat(criteria.tuitionMax()).isEqualByComparingTo(new BigDecimal("300000"));
        assertThat(criteria.page()).isEqualTo(3);
        assertThat(criteria.pageSize()).isEqualTo(24);
    }

    @Test
    void rejectsMoreThanTwentyValuesInEveryDimension() {
        List<String> tooMany = IntStream.rangeClosed(1, 21)
                .mapToObj(value -> "code_" + value)
                .toList();
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setCategory(tooMany);
        query.setLevel(tooMany);
        query.setCountry(tooMany);
        query.setMode(tooMany);
        query.setLanguage(tooMany);

        assertThatThrownBy(() -> factory.create(query))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                        assertThat(exception.getFieldErrors()).containsExactlyInAnyOrderEntriesOf(
                                java.util.Map.of(
                                        "category", "must contain at most 20 values",
                                        "level", "must contain at most 20 values",
                                        "country", "must contain at most 20 values",
                                        "mode", "must contain at most 20 values",
                                        "language", "must contain at most 20 values"
                                )
                        ));
    }

    @Test
    void rejectsReversedTuitionRangeOnMaximumField() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setTuitionMin("300000");
        query.setTuitionMax("200000");

        assertThatThrownBy(() -> factory.create(query))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                        assertThat(exception.getFieldErrors())
                                .containsEntry(
                                        "tuitionMax",
                                        "must be greater than or equal to tuitionMin"
                                ));
    }

    @Test
    void aggregatesAllDiscoverableFieldErrors() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setQ("x".repeat(101));
        query.setDuration("0");
        query.setIntake("2027-13");
        query.setTuitionMin("-1");
        query.setTuitionMax("not-a-number");
        query.setPage("0");
        query.setSize("49");
        query.setSort("name");

        assertThatThrownBy(() -> factory.create(query))
                .isInstanceOfSatisfying(SearchValidationException.class, exception -> {
                    assertThat(exception.getFieldErrors()).containsOnlyKeys(
                            "q",
                            "duration",
                            "intake",
                            "tuitionMin",
                            "tuitionMax",
                            "page",
                            "size",
                            "sort"
                    );
                    assertThat(exception.getFieldErrors())
                            .containsEntry("q", "must be at most 100 characters")
                            .containsEntry("duration", "must be a positive integer")
                            .containsEntry("intake", "must use YYYY-MM format")
                            .containsEntry("tuitionMin", "must be greater than or equal to 0")
                            .containsEntry("tuitionMax", "must be a non-negative number")
                            .containsEntry("page", "must be greater than or equal to 1")
                            .containsEntry("size", "must be less than or equal to 48")
                            .containsEntry("sort", "must be relevance");
                });
    }

    @Test
    void rejectsMalformedAndNonPositiveIntegerFields() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setDuration("2.5");
        query.setPage("abc");
        query.setSize("0");

        assertThatThrownBy(() -> factory.create(query))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                        assertThat(exception.getFieldErrors())
                                .containsEntry("duration", "must be a positive integer")
                                .containsEntry("page", "must be a positive integer")
                                .containsEntry("size", "must be greater than or equal to 1"));
    }

    @Test
    void acceptsExactlyTwentyValuesAndBoundaryLengths() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        query.setQ("q".repeat(100));
        query.setCountry(IntStream.rangeClosed(1, 20)
                .mapToObj(value -> "c" + value)
                .toList());
        query.setSize("48");

        UniversitySearchCriteria criteria = factory.create(query);

        assertThat(criteria.keyword()).hasSize(100);
        assertThat(criteria.countries()).hasSize(20);
        assertThat(criteria.pageSize()).isEqualTo(48);
    }
}
