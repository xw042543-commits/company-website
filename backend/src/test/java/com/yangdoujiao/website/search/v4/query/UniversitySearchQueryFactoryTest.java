package com.yangdoujiao.website.search.v4.query;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;

import com.yangdoujiao.website.search.v4.alias.SearchAliasTargetType;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;

class UniversitySearchQueryFactoryTest {
    private final UniversitySearchQueryFactory factory = new UniversitySearchQueryFactory();

    @Test
    void combinesAllProgrammeDimensionsInsideOneNestedBoolWithCountryAtRoot() {
        var criteria = new UniversitySearchCriteria("data", Set.of("COMPUTING", "BUSINESS"),
                Set.of("MASTER", "BACHELOR"), Set.of("GB", "AU"), Set.of("ONLINE", "ON_CAMPUS"),
                Set.of("ZH", "EN"), 12, YearMonth.of(2027, 9),
                new BigDecimal("200000.01"), new BigDecimal("236000.99"), 2, 12);
        NativeQuery query = factory.create(criteria, text("data"));
        assertThat(query.getQuery().bool().filter()).hasSize(1);
        assertTerms(query.getQuery().bool().filter().getFirst(), "countryCode", "GB", "AU");
        assertThat(query.getQuery().bool().must()).hasSize(2);
        var nested = matchedProgrammesNested(query);
        assertThat(nested.path()).isEqualTo("programmes");
        assertThat(nested.innerHits().name()).isEqualTo("matched_programmes");
        assertThat(nested.innerHits().size()).isEqualTo(3);
        BoolQuery programme = nested.query().bool();
        assertThat(programme.filter()).hasSize(10);
        assertTerms(programme.filter().get(0), "programmes.categoryCode", "COMPUTING", "BUSINESS");
        assertTerms(programme.filter().get(1), "programmes.studyLevelCode", "MASTER", "BACHELOR");
        assertTerms(programme.filter().get(2), "programmes.courseModeCode", "ONLINE", "ON_CAMPUS");
        assertTerms(programme.filter().get(3), "programmes.languageCodes", "ZH", "EN");
        assertThat(programme.filter().get(4).term().field()).isEqualTo("programmes.durationMonths");
        assertThat(programme.filter().get(4).term().value().longValue()).isEqualTo(12);
        assertThat(programme.filter().get(5).term().field()).isEqualTo("programmes.intakeMonths");
        assertThat(programme.filter().get(5).term().value().stringValue()).isEqualTo("2027-09");
        assertThat(programme.filter().stream().filter(Query::isExists).map(q -> q.exists().field()))
                .containsExactlyInAnyOrder("programmes.tuitionTotalRmbMin", "programmes.tuitionTotalRmbMax");
        var ranges = programme.filter().stream().filter(Query::isRange).map(q -> q.range().number()).toList();
        assertThat(ranges.get(0).field()).isEqualTo("programmes.tuitionTotalRmbMax");
        assertThat(ranges.get(0).gte()).isEqualTo(200000.01);
        assertThat(ranges.get(0).lte()).isNull();
        assertThat(ranges.get(1).field()).isEqualTo("programmes.tuitionTotalRmbMin");
        assertThat(ranges.get(1).lte()).isEqualTo(236000.99);
        assertThat(ranges.get(1).gte()).isNull();
        assertThat(programme.must()).isEmpty();
        assertThat(programme.should()).hasSize(1);
        assertThat(programme.minimumShouldMatch()).isEqualTo("0");
        assertProgrammeTextQuery(programme.should().getFirst(), "data", true);
        assertThat(query.getPageable().getPageNumber()).isEqualTo(1);
        assertThat(query.getPageable().getPageSize()).isEqualTo(12);
        assertThat(query.getTrackTotalHits()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void oneSidedTuitionKeepsOnlyRequestedRangeAndRequiresBothKnownBounds(boolean lower) {
        var criteria = criteria(null, lower ? BigDecimal.ZERO : null, lower ? null : new BigDecimal("236000"));
        var filters = nested(factory.create(criteria, text(null))).filter();
        assertThat(filters).hasSize(3);
        assertThat(filters.stream().filter(Query::isExists).map(q -> q.exists().field()))
                .containsExactlyInAnyOrder("programmes.tuitionTotalRmbMin", "programmes.tuitionTotalRmbMax");
        var range = filters.stream().filter(Query::isRange).findFirst().orElseThrow().range().number();
        assertThat(range.field()).isEqualTo(lower ? "programmes.tuitionTotalRmbMax" : "programmes.tuitionTotalRmbMin");
        assertThat(range.gte()).isEqualTo(lower ? 0.0 : null);
        assertThat(range.lte()).isEqualTo(lower ? null : 236000.0);
    }

    @Test
    void emptySearchStillRequiresAProgrammeAndUsesStableKeywordIdSort() {
        NativeQuery query = factory.create(criteria(null, null, null), text(null));
        assertThat(query.getQuery().bool().must()).hasSize(1);
        assertThat(nested(query).filter()).isEmpty();
        assertThat(nested(query).must()).isEmpty();
        assertThat(query.getSortOptions()).hasSize(3);
        assertThat(query.getSortOptions().stream().map(s -> s.field().field()))
                .containsExactly("popular", "nameZh.keyword", "id");
        assertThat(query.getSortOptions().get(0).field().order()).isEqualTo(SortOrder.Desc);
        assertThat(query.getSortOptions().get(1).field().order()).isEqualTo(SortOrder.Asc);
        assertThat(query.getSortOptions().get(2).field().order()).isEqualTo(SortOrder.Asc);
        assertThat(query.getPageable().getPageNumber()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"data science", "数据科学", "c++ (data) AND * : \\\"", "COMPUTING"})
    void textRemainsLiteralMultiMatchAndKeepsNestedRelevance(String keyword) {
        NativeQuery query = factory.create(criteria(keyword, null, null), text(keyword));
        assertThat(nested(query).should()).hasSize(1);
        assertThat(nested(query).minimumShouldMatch()).isEqualTo("0");
        assertThat(nested(query).filter()).singleElement().satisfies(filter -> assertThat(filter.isMatchAll()).isTrue());
        assertProgrammeTextQuery(nested(query).should().getFirst(), keyword, fuzzyEligible(keyword));
        assertRootKeywordQuery(query, keyword, fuzzyEligible(keyword));
        assertThat(query.getSortOptions().get(0).isScore()).isTrue();
        assertThat(query.getSortOptions().get(0).score().order()).isEqualTo(SortOrder.Desc);
        assertThat(query.getSortOptions().subList(1, 3).stream().map(s -> s.field().field()))
                .containsExactly("popular", "id");
    }

    @Test
    void latinTypingMistakesUseControlledFuzzinessAcrossUniversityAndProgrammeText() {
        NativeQuery query = factory.create(criteria("computr", null, null), text("computr"));

        assertRootKeywordQuery(query, "computr", true);
        assertProgrammeTextQuery(nested(query).should().getFirst(), "computr", true);
    }

    @ParameterizedTest
    @ValueSource(strings = {"um", "计算机"})
    void shortOrNonLatinKeywordsDoNotEnableFuzzyMatching(String keyword) {
        NativeQuery query = factory.create(criteria(keyword, null, null), text(keyword));

        assertRootKeywordQuery(query, keyword, false);
        assertProgrammeTextQuery(nested(query).should().getFirst(), keyword, false);
    }

    @ParameterizedTest
    @EnumSource(SearchAliasTargetType.class)
    void aliasesUseExactTargetAtItsCorrectScope(SearchAliasTargetType type) {
        NativeQuery query = factory.create(criteria("alias", null, null), new ResolvedSearchTerm("alias", type, "TARGET"));
        String field = switch (type) {
            case COUNTRY -> "countryCode";
            case SUBJECT_CATEGORY -> "programmes.categoryCode";
            case PROGRAMME -> "programmes.programmeCode";
        };
        List<Query> filters = type == SearchAliasTargetType.COUNTRY
                ? query.getQuery().bool().filter() : nested(query).filter();
        assertThat(filters).hasSize(1);
        assertThat(filters.getFirst().term().field()).isEqualTo(field);
        assertThat(filters.getFirst().term().value().stringValue()).isEqualTo("TARGET");
        assertThat(nested(query).must()).isEmpty();
        assertThat(query.getSortOptions().getFirst().isScore()).isTrue();
    }

    @Test
    void aliasTargetsAreAddedToRatherThanReplacingExplicitFilters() {
        NativeQuery conflictingCountry = factory.create(
                new UniversitySearchCriteria(null, Set.of(), Set.of(), Set.of("AU"), Set.of(), Set.of(),
                        null, null, null, null, 1, 12),
                new ResolvedSearchTerm("UK", SearchAliasTargetType.COUNTRY, "GB"));
        assertThat(conflictingCountry.getQuery().bool().filter()).hasSize(2);
        assertTerms(conflictingCountry.getQuery().bool().filter().get(0), "countryCode", "AU");
        assertThat(conflictingCountry.getQuery().bool().filter().get(1).term().field()).isEqualTo("countryCode");
        assertThat(conflictingCountry.getQuery().bool().filter().get(1).term().value().stringValue()).isEqualTo("GB");

        NativeQuery programmeAndMode = factory.create(
                new UniversitySearchCriteria(null, Set.of(), Set.of(), Set.of(), Set.of("ONLINE"), Set.of(),
                        null, null, null, null, 1, 12),
                new ResolvedSearchTerm("DS", SearchAliasTargetType.PROGRAMME, "P-GB-DS-01"));
        assertThat(nested(programmeAndMode).filter()).hasSize(2);
        assertTerms(nested(programmeAndMode).filter().get(0), "programmes.courseModeCode", "ONLINE");
        assertThat(nested(programmeAndMode).filter().get(1).term().field()).isEqualTo("programmes.programmeCode");
        assertThat(nested(programmeAndMode).filter().get(1).term().value().stringValue()).isEqualTo("P-GB-DS-01");
    }

    private static BoolQuery nested(NativeQuery query) {
        return matchedProgrammesNested(query).query().bool();
    }

    private static co.elastic.clients.elasticsearch._types.query_dsl.NestedQuery matchedProgrammesNested(
            NativeQuery query) {
        return query.getQuery().bool().must().stream()
                .filter(Query::isNested)
                .map(Query::nested)
                .filter(nested -> nested.innerHits() != null)
                .findFirst()
                .orElseThrow();
    }

    private static void assertRootKeywordQuery(NativeQuery query, String keyword, boolean fuzzy) {
        Query keywordQuery = query.getQuery().bool().must().stream()
                .filter(Query::isBool)
                .findFirst()
                .orElseThrow();
        assertThat(keywordQuery.bool().minimumShouldMatch()).isEqualTo("1");
        assertThat(keywordQuery.bool().should()).hasSize(2);
        var universityText = keywordQuery.bool().should().getFirst().multiMatch();
        assertThat(universityText.query()).isEqualTo(keyword);
        assertThat(universityText.fields()).containsExactlyInAnyOrder(
                "nameZh^4", "nameEn^4", "countryNameZh^2", "countryNameEn^2", "cityZh", "cityEn");
        assertThat(universityText.fuzziness()).isEqualTo(fuzzy ? "AUTO" : null);
        Query nestedProgramme = keywordQuery.bool().should().get(1);
        assertThat(nestedProgramme.isNested()).isTrue();
        assertThat(nestedProgramme.nested().path()).isEqualTo("programmes");
        assertThat(nestedProgramme.nested().innerHits().name()).isEqualTo("keyword_matched_programmes");
        assertThat(nestedProgramme.nested().innerHits().size()).isEqualTo(3);
        assertThat(nestedProgramme.nested().query().bool().must()).hasSize(1);
        assertProgrammeTextQuery(nestedProgramme.nested().query().bool().must().getFirst(), keyword, fuzzy);
    }

    private static void assertProgrammeTextQuery(Query query, String keyword, boolean fuzzy) {
        assertThat(query.isBool()).isTrue();
        assertThat(query.bool().minimumShouldMatch()).isEqualTo("1");
        assertThat(query.bool().should()).hasSize(2);
        assertThat(query.bool().should().get(0).multiMatch().query()).isEqualTo(keyword);
        assertThat(query.bool().should().get(0).multiMatch().fields())
                .containsExactlyInAnyOrder("programmes.nameZh", "programmes.nameEn");
        assertThat(query.bool().should().get(0).multiMatch().fuzziness()).isEqualTo(fuzzy ? "AUTO" : null);
        assertThat(query.bool().should().get(1).term().field()).isEqualTo("programmes.categoryCode");
        assertThat(query.bool().should().get(1).term().value().stringValue()).isEqualTo(keyword);
        assertThat(query.bool().should().get(1).term().caseInsensitive()).isTrue();
    }

    private static boolean fuzzyEligible(String keyword) {
        return keyword.matches("(?i)[a-z][a-z0-9 ]{3,}");
    }

    private static void assertTerms(Query query, String field, String... values) {
        assertThat(query.terms().field()).isEqualTo(field);
        assertThat(query.terms().terms().value().stream().map(v -> v.stringValue()))
                .containsExactlyInAnyOrder(values);
    }

    private static UniversitySearchCriteria criteria(String keyword, BigDecimal min, BigDecimal max) {
        return new UniversitySearchCriteria(keyword, Set.of(), Set.of(), Set.of(), Set.of(), Set.of(),
                null, null, min, max, 1, 12);
    }

    private static ResolvedSearchTerm text(String value) {
        return new ResolvedSearchTerm(value, null, null);
    }
}
