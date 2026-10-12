package com.yangdoujiao.website.search.v4.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchHitsImpl;
import org.springframework.data.elasticsearch.core.TotalHitsRelation;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;

import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

class ElasticsearchUniversitySearchGatewayTest {
    private final ElasticsearchOperations operations = mock(ElasticsearchOperations.class);
    private final UniversitySearchGateway gateway = new ElasticsearchUniversitySearchGateway(
            operations, new UniversitySearchQueryFactory());
    private final UniversitySearchCriteria criteria = new UniversitySearchCriteria(null, Set.of(), Set.of(),
            Set.of(), Set.of(), Set.of(), null, null, null, null, 2, 12);

    @Test
    void mapsOnlyNamedInnerHitsPreservesTranslationsAndUsesRootTotalForPage() {
        var programme = new ProgrammeSearchDocument(21L, "MATCH", null, "Data Science", "COMPUTING", "MASTER",
                "ONLINE", List.of("EN", "ZH"), 12, List.of("2027-01", "2027-09"),
                new BigDecimal("200000"), new BigDecimal("236000"), "12 months", List.of("January", "September"), "RMB 200,000–236,000");
        SearchHits<ProgrammeSearchDocument> inner = hits(6, List.of(hit(programme, Map.of())));
        var university = university(List.of(new ProgrammeSearchDocument(99L, "UNMATCHED", "不匹配", null,
                "OTHER", null, null, List.of(), null, List.of(), null, null, null, List.of(), null)));
        respond(hits(13, List.of(hit(university, Map.of("matched_programmes", inner)))));

        var page = gateway.search(criteria, new ResolvedSearchTerm(null, null, null));

        assertThat(page.page()).isEqualTo(2);
        assertThat(page.pageSize()).isEqualTo(12);
        assertThat(page.totalItems()).isEqualTo(13);
        assertThat(page.totalPages()).isEqualTo(2);
        var result = page.items().getFirst();
        assertThat(result.id()).isEqualTo(7);
        assertThat(result.slug()).isEqualTo("fictional");
        assertThat(result.nameZh()).isNull();
        assertThat(result.nameEn()).isEqualTo("Fictional university");
        assertThat(result.countryCode()).isEqualTo("GB");
        assertThat(result.countryNameZh()).isNull();
        assertThat(result.countryNameEn()).isEqualTo("United Kingdom");
        assertThat(result.cityZh()).isNull();
        assertThat(result.cityEn()).isEqualTo("Fictional city");
        assertThat(result.popular()).isTrue();
        assertThat(result.matchedProgrammeCount()).isEqualTo(6);
        var matched = result.matchedProgrammes().getFirst();
        assertThat(result.matchedProgrammes()).hasSize(1);
        assertThat(matched.id()).isEqualTo(21);
        assertThat(matched.programmeCode()).isEqualTo("MATCH");
        assertThat(matched.nameZh()).isNull();
        assertThat(matched.nameEn()).isEqualTo("Data Science");
        assertThat(matched.categoryCode()).isEqualTo("COMPUTING");
        assertThat(matched.studyLevelCode()).isEqualTo("MASTER");
        assertThat(matched.courseModeCode()).isEqualTo("ONLINE");
        assertThat(matched.languageCodes()).containsExactly("EN", "ZH");
        assertThat(matched.durationMonths()).isEqualTo(12);
        assertThat(matched.intakeMonths()).containsExactly("2027-01", "2027-09");
        assertThat(matched.tuitionTotalRmbMin()).isEqualByComparingTo("200000");
        assertThat(matched.tuitionTotalRmbMax()).isEqualByComparingTo("236000");
        assertThat(matched.durationDisplay()).isEqualTo("12 months");
        assertThat(matched.intakeDisplayTexts()).containsExactly("January", "September");
        assertThat(matched.tuitionDisplay()).isEqualTo("RMB 200,000–236,000");
    }

    @Test
    void returnsEmptyPageWithZeroRootTotal() {
        respond(hits(0, List.of()));
        var page = gateway.search(criteria, new ResolvedSearchTerm(null, null, null));
        assertThat(page.items()).isEmpty();
        assertThat(page.totalItems()).isZero();
        assertThat(page.totalPages()).isZero();
        assertThat(page.page()).isEqualTo(2);
    }

    @Test
    void failsOnMissingInnerHitsInsteadOfReturningArbitrarySourceProgrammes() {
        respond(hits(1, List.of(hit(university(List.of()), Map.of()))));
        assertThatThrownBy(() -> gateway.search(criteria, new ResolvedSearchTerm(null, null, null)))
                .isInstanceOf(IllegalStateException.class);
    }

    private void respond(SearchHits<UniversityProgrammeSearchDocument> hits) {
        when(operations.search(any(Query.class), eq(UniversityProgrammeSearchDocument.class),
                eq(IndexCoordinates.of("universities-v4-read")))).thenReturn(hits);
    }

    private UniversityProgrammeSearchDocument university(List<ProgrammeSearchDocument> programmes) {
        return new UniversityProgrammeSearchDocument(7L, "FICTIONAL", "fictional", null, "Fictional university",
                "GB", null, "United Kingdom", null, "Fictional city", true, programmes);
    }

    private static <T> SearchHit<T> hit(T content, Map<String, SearchHits<?>> inner) {
        return new SearchHit<>("universities-v4-test", "7", null, 1, null, Map.of(), inner, null, null, Map.of(), content);
    }

    private static <T> SearchHits<T> hits(long total, List<SearchHit<T>> hits) {
        return new SearchHitsImpl<>(total, TotalHitsRelation.EQUAL_TO, 1, Duration.ZERO,
                null, null, hits, null, null, null);
    }
}
