package com.yangdoujiao.website.search.v4;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.elasticsearch.RestStatusException;
import org.springframework.data.elasticsearch.UncategorizedElasticsearchException;
import org.springframework.stereotype.Service;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.media.MediaLookupRepository;
import com.yangdoujiao.website.search.v4.alias.SearchAliasResolver;
import com.yangdoujiao.website.search.v4.api.MatchedProgrammeResponse;
import com.yangdoujiao.website.search.v4.api.UniversitySearchItemResponse;
import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult;
import com.yangdoujiao.website.search.v4.query.UniversitySearchGateway;

@Service
public class UniversitySearchV1Service {

    private final UniversitySearchCriteriaFactory criteriaFactory;
    private final SearchFilterCodeValidator validator;
    private final SubjectCategoryFilterExpander categoryFilterExpander;
    private final SearchAliasResolver aliasResolver;
    private final UniversitySearchGateway gateway;
    private final MediaLookupRepository media;

    public UniversitySearchV1Service(
            UniversitySearchCriteriaFactory criteriaFactory,
            SearchFilterCodeValidator validator,
            SubjectCategoryFilterExpander categoryFilterExpander,
            SearchAliasResolver aliasResolver,
            UniversitySearchGateway gateway,
            MediaLookupRepository media
    ) {
        this.criteriaFactory = criteriaFactory;
        this.validator = validator;
        this.categoryFilterExpander = categoryFilterExpander;
        this.aliasResolver = aliasResolver;
        this.gateway = gateway;
        this.media = media;
    }

    public PageResponse<UniversitySearchItemResponse> search(UniversitySearchQuery query) {
        var requestedCriteria = criteriaFactory.create(query);
        validator.validate(requestedCriteria);
        var criteria = categoryFilterExpander.expand(requestedCriteria);
        var resolvedTerm = aliasResolver.resolve(criteria.keyword());
        PageResponse<UniversitySearchResult> results;
        try {
            results = gateway.search(criteria, resolvedTerm);
        } catch (DataAccessResourceFailureException exception) {
            throw new SearchServiceUnavailableException(exception);
        } catch (RestStatusException exception) {
            if (isSearchAvailabilityStatus(exception.getStatus())) {
                throw new SearchServiceUnavailableException(exception);
            }
            throw exception;
        } catch (UncategorizedElasticsearchException exception) {
            if (isSearchAvailabilityStatus(exception.getStatusCode())) {
                throw new SearchServiceUnavailableException(exception);
            }
            throw exception;
        }
        List<Long> universityIds = results.items().stream().map(UniversitySearchResult::id).toList();
        List<Long> programmeIds = results.items().stream()
                .flatMap(result -> result.matchedProgrammes().stream())
                .map(UniversitySearchResult.MatchedProgramme::id)
                .toList();
        Map<Long, String> universityImages = media.findUniversityImageUrls(universityIds);
        Map<Long, String> programmeImages = media.findProgrammeImageUrls(programmeIds);
        return PageResponse.of(results.items().stream()
                        .map(result -> toResponse(result, universityImages, programmeImages))
                        .toList(),
                results.page(), results.pageSize(), results.totalItems());
    }

    private static boolean isSearchAvailabilityStatus(Integer status) {
        return status != null && switch (status) {
            case 429, 502, 503, 504 -> true;
            default -> false;
        };
    }

    private UniversitySearchItemResponse toResponse(
            UniversitySearchResult result,
            Map<Long, String> universityImages,
            Map<Long, String> programmeImages
    ) {
        String universityImage = universityImages.get(result.id());
        List<MatchedProgrammeResponse> programmes = result.matchedProgrammes().stream()
                .limit(3)
                .map(programme -> toResponse(programme, programmeImages.getOrDefault(programme.id(), universityImage)))
                .toList();
        return new UniversitySearchItemResponse(result.id(), result.slug(), result.nameZh(), result.nameEn(),
                result.countryCode(), result.countryNameZh(), result.countryNameEn(), result.cityZh(), result.cityEn(),
                result.popular(), result.matchedProgrammeCount(), programmes, universityImage);
    }

    private MatchedProgrammeResponse toResponse(UniversitySearchResult.MatchedProgramme programme, String imageUrl) {
        return new MatchedProgrammeResponse(programme.id(), programme.programmeCode(), programme.nameZh(), programme.nameEn(),
                programme.categoryCode(), programme.studyLevelCode(), programme.courseModeCode(), programme.languageCodes(),
                programme.durationMonths(), programme.intakeMonths(), programme.tuitionTotalRmbMin(), programme.tuitionTotalRmbMax(),
                programme.durationDisplay(), programme.intakeDisplayTexts(), programme.tuitionDisplay(), imageUrl);
    }
}
