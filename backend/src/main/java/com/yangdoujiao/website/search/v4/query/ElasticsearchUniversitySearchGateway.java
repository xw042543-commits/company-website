package com.yangdoujiao.website.search.v4.query;

import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Repository;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.index.SearchIndexNames;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult.MatchedProgramme;

@Repository
public class ElasticsearchUniversitySearchGateway implements UniversitySearchGateway {
    private final ElasticsearchOperations operations;
    private final UniversitySearchQueryFactory queryFactory;

    public ElasticsearchUniversitySearchGateway(ElasticsearchOperations operations, UniversitySearchQueryFactory queryFactory) {
        this.operations = operations;
        this.queryFactory = queryFactory;
    }

    @Override
    public PageResponse<UniversitySearchResult> search(UniversitySearchCriteria criteria, ResolvedSearchTerm resolvedTerm) {
        SearchHits<UniversityProgrammeSearchDocument> hits = operations.search(
                queryFactory.create(criteria, resolvedTerm), UniversityProgrammeSearchDocument.class,
                IndexCoordinates.of(SearchIndexNames.READ_ALIAS));
        return PageResponse.of(hits.getSearchHits().stream().map(this::toResult).toList(),
                criteria.page(), criteria.pageSize(), hits.getTotalHits());
    }

    private UniversitySearchResult toResult(SearchHit<UniversityProgrammeSearchDocument> hit) {
        var university = hit.getContent();
        SearchHits<?> innerHits = hit.getInnerHits(UniversitySearchQueryFactory.MATCHED_PROGRAMMES);
        if (innerHits == null) {
            throw new IllegalStateException("Search response is missing matched programmes");
        }
        var programmes = innerHits.getSearchHits().stream()
                .limit(UniversitySearchQueryFactory.MAX_MATCHED_PROGRAMMES)
                .map(inner -> toProgramme(inner.getContent())).toList();
        return new UniversitySearchResult(university.getId(), university.getSlug(), university.getNameZh(), university.getNameEn(),
                university.getCountryCode(), university.getCountryNameZh(), university.getCountryNameEn(),
                university.getCityZh(), university.getCityEn(), university.isPopular(), innerHits.getTotalHits(), programmes);
    }

    private MatchedProgramme toProgramme(Object content) {
        // Spring Data 6.1.1 converts nested inner hits using the programmes property's mapped type.
        if (!(content instanceof ProgrammeSearchDocument programme)) {
            throw new IllegalStateException("Search response contains an unexpected matched programme type");
        }
        return new MatchedProgramme(programme.getId(), programme.getProgrammeCode(), programme.getNameZh(), programme.getNameEn(),
                programme.getCategoryCode(), programme.getStudyLevelCode(), programme.getCourseModeCode(),
                programme.getLanguageCodes(), programme.getDurationMonths(), programme.getIntakeMonths(),
                programme.getTuitionTotalRmbMin(), programme.getTuitionTotalRmbMax(), programme.getDurationDisplay(),
                programme.getIntakeDisplayTexts(), programme.getTuitionDisplay());
    }
}
