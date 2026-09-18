package com.yangdoujiao.website.search.v4;

import java.util.List;

import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.elasticsearch.RestStatusException;
import org.springframework.data.elasticsearch.UncategorizedElasticsearchException;
import org.springframework.stereotype.Service;

import com.yangdoujiao.website.common.api.PageResponse;
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
    private final SearchAliasResolver aliasResolver;
    private final UniversitySearchGateway gateway;

    public UniversitySearchV1Service(
            UniversitySearchCriteriaFactory criteriaFactory,
            SearchFilterCodeValidator validator,
            SearchAliasResolver aliasResolver,
            UniversitySearchGateway gateway
    ) {
        this.criteriaFactory = criteriaFactory;
        this.validator = validator;
        this.aliasResolver = aliasResolver;
        this.gateway = gateway;
    }

    public PageResponse<UniversitySearchItemResponse> search(UniversitySearchQuery query) {
        var criteria = criteriaFactory.create(query);
        validator.validate(criteria);
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
        return PageResponse.of(results.items().stream().map(this::toResponse).toList(),
                results.page(), results.pageSize(), results.totalItems());
    }

    private static boolean isSearchAvailabilityStatus(Integer status) {
        return status != null && switch (status) {
            case 429, 502, 503, 504 -> true;
            default -> false;
        };
    }

    private UniversitySearchItemResponse toResponse(UniversitySearchResult result) {
        List<MatchedProgrammeResponse> programmes = result.matchedProgrammes().stream()
                .limit(3)
                .map(this::toResponse)
                .toList();
        return new UniversitySearchItemResponse(result.id(), result.slug(), result.nameZh(), result.nameEn(),
                result.countryCode(), result.countryNameZh(), result.countryNameEn(), result.cityZh(), result.cityEn(),
                result.popular(), result.matchedProgrammeCount(), programmes);
    }

    private MatchedProgrammeResponse toResponse(UniversitySearchResult.MatchedProgramme programme) {
        return new MatchedProgrammeResponse(programme.id(), programme.programmeCode(), programme.nameZh(), programme.nameEn(),
                programme.categoryCode(), programme.studyLevelCode(), programme.courseModeCode(), programme.languageCodes(),
                programme.durationMonths(), programme.intakeMonths(), programme.tuitionTotalRmbMin(), programme.tuitionTotalRmbMax(),
                programme.durationDisplay(), programme.intakeDisplayTexts(), programme.tuitionDisplay());
    }
}
