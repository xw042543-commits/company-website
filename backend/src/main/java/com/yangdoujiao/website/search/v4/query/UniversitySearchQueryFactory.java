package com.yangdoujiao.website.search.v4.query;

import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.ChildScoreMode;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;

@Component
public class UniversitySearchQueryFactory {
    public static final String MATCHED_PROGRAMMES = "matched_programmes";
    public static final int MAX_MATCHED_PROGRAMMES = 3;

    public NativeQuery create(UniversitySearchCriteria criteria, ResolvedSearchTerm resolvedTerm) {
        BoolQuery.Builder root = new BoolQuery.Builder();
        BoolQuery.Builder programme = new BoolQuery.Builder();
        terms(root, "countryCode", criteria.countries());
        terms(programme, "programmes.categoryCode", criteria.categories());
        terms(programme, "programmes.studyLevelCode", criteria.levels());
        terms(programme, "programmes.courseModeCode", criteria.modes());
        terms(programme, "programmes.languageCodes", criteria.languages());
        if (criteria.durationMonths() != null) {
            programme.filter(q -> q.term(t -> t.field("programmes.durationMonths").value(criteria.durationMonths())));
        }
        if (criteria.intakeMonth() != null) {
            programme.filter(term("programmes.intakeMonths", criteria.intakeMonth().toString()));
        }
        if (criteria.tuitionMin() != null || criteria.tuitionMax() != null) {
            // Incomplete totals are unknown, including when the request supplies only one bound.
            programme.filter(q -> q.exists(e -> e.field("programmes.tuitionTotalRmbMin")));
            programme.filter(q -> q.exists(e -> e.field("programmes.tuitionTotalRmbMax")));
        }
        if (criteria.tuitionMin() != null) {
            programme.filter(q -> q.range(r -> r.number(n -> n.field("programmes.tuitionTotalRmbMax")
                    .gte(criteria.tuitionMin().doubleValue()))));
        }
        if (criteria.tuitionMax() != null) {
            programme.filter(q -> q.range(r -> r.number(n -> n.field("programmes.tuitionTotalRmbMin")
                    .lte(criteria.tuitionMax().doubleValue()))));
        }

        boolean hasKeyword = resolvedTerm.isAlias()
                || (resolvedTerm.text() != null && !resolvedTerm.text().isBlank());
        if (resolvedTerm.isAlias()) {
            switch (resolvedTerm.targetType()) {
                case COUNTRY -> root.filter(term("countryCode", resolvedTerm.targetCode()));
                case SUBJECT_CATEGORY -> programme.filter(term("programmes.categoryCode", resolvedTerm.targetCode()));
                case PROGRAMME -> programme.filter(term("programmes.programmeCode", resolvedTerm.targetCode()));
            }
        } else if (hasKeyword) {
            programme.must(q -> q.bool(b -> b.minimumShouldMatch("1")
                    .should(s -> s.multiMatch(m -> m.query(resolvedTerm.text())
                            .fields("programmes.nameZh", "programmes.nameEn")))
                    .should(s -> s.term(t -> t.field("programmes.categoryCode")
                            .value(resolvedTerm.text()).caseInsensitive(true)))));
        }

        // A single nested query also excludes universities without any public programme.
        root.must(q -> q.nested(n -> n.path("programmes").query(programme.build()._toQuery())
                .scoreMode(ChildScoreMode.Max)
                .innerHits(i -> i.name(MATCHED_PROGRAMMES).size(MAX_MATCHED_PROGRAMMES)
                        .sort(s -> s.score(score -> score.order(SortOrder.Desc)))
                        .sort(s -> s.field(f -> f.field("programmes.id").order(SortOrder.Asc))))));

        var builder = NativeQuery.builder().withQuery(root.build()._toQuery())
                .withPageable(PageRequest.of(criteria.page() - 1, criteria.pageSize()))
                .withTrackTotalHits(true);
        if (hasKeyword) {
            builder.withSort(s -> s.score(score -> score.order(SortOrder.Desc)));
        }
        builder.withSort(s -> s.field(f -> f.field("popular").order(SortOrder.Desc)));
        if (!hasKeyword) {
            builder.withSort(s -> s.field(f -> f.field("nameZh.keyword").order(SortOrder.Asc)));
        }
        // Task 4 maps id itself as keyword; neither _id nor id.keyword is sortable here.
        builder.withSort(s -> s.field(f -> f.field("id").order(SortOrder.Asc)));
        return builder.build();
    }

    private static void terms(BoolQuery.Builder query, String field, Set<String> values) {
        if (!values.isEmpty()) {
            query.filter(q -> q.terms(t -> t.field(field)
                    .terms(v -> v.value(values.stream().map(FieldValue::of).toList()))));
        }
    }

    private static Query term(String field, String value) {
        return Query.of(q -> q.term(t -> t.field(field).value(value)));
    }
}
