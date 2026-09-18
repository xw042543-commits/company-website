package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.elasticsearch.RestStatusException;
import org.springframework.data.elasticsearch.UncategorizedElasticsearchException;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.alias.SearchAliasResolver;
import com.yangdoujiao.website.search.v4.alias.SearchAliasTargetType;
import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult;
import com.yangdoujiao.website.search.v4.query.UniversitySearchGateway;

class UniversitySearchV1ServiceTest {

    private final UniversitySearchCriteriaFactory criteriaFactory = mock(UniversitySearchCriteriaFactory.class);
    private final SearchFilterCodeValidator validator = mock(SearchFilterCodeValidator.class);
    private final SearchAliasResolver aliasResolver = mock(SearchAliasResolver.class);
    private final UniversitySearchGateway gateway = mock(UniversitySearchGateway.class);
    private final UniversitySearchV1Service service = new UniversitySearchV1Service(
            criteriaFactory, validator, aliasResolver, gateway);

    @Test
    void usesTheRequiredPipelineAndMapsGatewayResults() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = criteria("Data Science");
        ResolvedSearchTerm term = new ResolvedSearchTerm("Data Science", null, null);
        UniversitySearchResult result = result(4);
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(aliasResolver.resolve("Data Science")).thenReturn(term);
        when(gateway.search(criteria, term)).thenReturn(PageResponse.of(List.of(result), 1, 12, 1));

        var response = service.search(query);

        InOrder order = inOrder(criteriaFactory, validator, aliasResolver, gateway);
        order.verify(criteriaFactory).create(query);
        order.verify(validator).validate(criteria);
        order.verify(aliasResolver).resolve("Data Science");
        order.verify(gateway).search(criteria, term);
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().matchedProgrammeCount()).isEqualTo(4);
        assertThat(response.items().getFirst().matchedProgrammes()).hasSize(3);
        assertThat(response.items().getFirst().nameZh()).isNull();
    }

    @Test
    void preservesEmptyKeywordAndResolvedAliasForTheGateway() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = criteria(null);
        ResolvedSearchTerm term = new ResolvedSearchTerm(null, null, null);
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(aliasResolver.resolve(null)).thenReturn(term);
        when(gateway.search(criteria, term)).thenReturn(PageResponse.of(List.of(), 1, 12, 0));

        assertThat(service.search(query).items()).isEmpty();

        UniversitySearchQuery aliasQuery = new UniversitySearchQuery();
        UniversitySearchCriteria aliasCriteria = criteria("UK");
        ResolvedSearchTerm alias = new ResolvedSearchTerm("UK", SearchAliasTargetType.COUNTRY, "GB");
        when(criteriaFactory.create(aliasQuery)).thenReturn(aliasCriteria);
        when(aliasResolver.resolve("UK")).thenReturn(alias);
        when(gateway.search(aliasCriteria, alias)).thenReturn(PageResponse.of(List.of(), 1, 12, 0));
        assertThat(service.search(aliasQuery).items()).isEmpty();
    }

    @Test
    void convertsOnlyKnownSearchAvailabilityFailuresAndLeavesValidationAndProgrammingErrorsUntouched() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = criteria(null);
        ResolvedSearchTerm term = new ResolvedSearchTerm(null, null, null);
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(aliasResolver.resolve(null)).thenReturn(term);
        when(gateway.search(any(), any())).thenThrow(new DataAccessResourceFailureException("connection refused"));

        assertThatThrownBy(() -> service.search(query)).isInstanceOf(SearchServiceUnavailableException.class);

        reset(gateway);
        when(gateway.search(any(), any())).thenThrow(new IllegalStateException("programming error"));
        assertThatThrownBy(() -> service.search(query)).isInstanceOf(IllegalStateException.class)
                .hasMessage("programming error");
    }

    @Test
    void convertsOnlyAvailabilityStatusesFromElasticsearchStatusExceptions() {
        for (int status : new int[]{429, 502, 503, 504}) {
            assertUnavailable(new RestStatusException(status, "search failure"));
            assertUnavailable(new UncategorizedElasticsearchException("search failure", status, "internal", null));
        }

        RestStatusException badRequest = new RestStatusException(400, "query bug");
        assertThatThrownBy(() -> searchWith(badRequest)).isSameAs(badRequest);
        UncategorizedElasticsearchException malformedQuery = new UncategorizedElasticsearchException(
                "query bug", 400, "internal", null);
        assertThatThrownBy(() -> searchWith(malformedQuery)).isSameAs(malformedQuery);
    }

    @Test
    void doesNotTranslateAvailabilityExceptionThrownDuringDtoMapping() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = criteria(null);
        ResolvedSearchTerm term = new ResolvedSearchTerm(null, null, null);
        UniversitySearchResult result = mock(UniversitySearchResult.class);
        RestStatusException mappingFailure = new RestStatusException(503, "mapping failure");
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(aliasResolver.resolve(null)).thenReturn(term);
        when(gateway.search(criteria, term)).thenReturn(PageResponse.of(List.of(result), 1, 12, 1));
        when(result.matchedProgrammes()).thenThrow(mappingFailure);

        assertThatThrownBy(() -> service.search(query)).isSameAs(mappingFailure);
    }

    private void assertUnavailable(RuntimeException exception) {
        assertThatThrownBy(() -> searchWith(exception)).isInstanceOf(SearchServiceUnavailableException.class)
                .extracting(Throwable::getCause)
                .isSameAs(exception);
    }

    private void searchWith(RuntimeException exception) {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = criteria(null);
        ResolvedSearchTerm term = new ResolvedSearchTerm(null, null, null);
        reset(criteriaFactory, validator, aliasResolver, gateway);
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(aliasResolver.resolve(null)).thenReturn(term);
        when(gateway.search(any(), any())).thenThrow(exception);
        service.search(query);
    }

    private static UniversitySearchCriteria criteria(String keyword) {
        return new UniversitySearchCriteria(keyword, Set.of(), Set.of(), Set.of(), Set.of(), Set.of(),
                null, null, null, null, 1, 12);
    }

    private static UniversitySearchResult result(int count) {
        UniversitySearchResult.MatchedProgramme programme = new UniversitySearchResult.MatchedProgramme(
                10L, "P-GB-DS-01", null, "Data Science", "COMPUTING", "MASTER", "ONLINE",
                List.of("EN"), 12, List.of("2027-09"), null, null, "12 months", List.of("September 2027"), "Ask");
        return new UniversitySearchResult(1L, "northstar", null, "Northstar", "GB", null, "United Kingdom",
                null, "London", true, count, List.of(programme, programme, programme, programme));
    }
}
