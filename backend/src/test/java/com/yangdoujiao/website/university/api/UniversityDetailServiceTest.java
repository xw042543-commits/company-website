package com.yangdoujiao.website.university.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.programme.ProgrammeIntakeRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.search.v4.SearchFilterCodeValidator;
import com.yangdoujiao.website.search.v4.UniversitySearchCriteriaFactory;
import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;
import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityRepository;

@ExtendWith(MockitoExtension.class)
class UniversityDetailServiceTest {

    @Mock private UniversityRepository universities;
    @Mock private ProgrammeRepository programmes;
    @Mock private ProgrammeIntakeRepository intakes;
    @Mock private UniversityProgrammeQueryRepository programmeQuery;
    @Mock private UniversitySearchCriteriaFactory criteriaFactory;
    @Mock private SearchFilterCodeValidator filterCodeValidator;
    @Mock private University university;

    @Test
    void skipsProgrammeThatDisappearsBetweenPageAndDetailQueries() {
        UniversitySearchQuery query = new UniversitySearchQuery();
        UniversitySearchCriteria criteria = new UniversitySearchCriteria(
                null,
                Set.of(),
                Set.of(),
                Set.of(),
                Set.of(),
                Set.of(),
                null,
                null,
                null,
                null,
                1,
                12
        );
        when(university.getId()).thenReturn(7L);
        when(universities.findBySlugAndStatus("example-university", CategoryStatus.PUBLISHED))
                .thenReturn(Optional.of(university));
        when(criteriaFactory.create(query)).thenReturn(criteria);
        when(programmeQuery.findPageIds(7L, criteria)).thenReturn(new PageImpl<>(
                List.of(99L),
                PageRequest.of(0, 12),
                1
        ));
        when(programmes.findPublishedDetailedByIdInAndUniversityId(List.of(99L), 7L))
                .thenReturn(List.of());
        when(intakes.findAllByProgramme_IdInOrderByIntakeDateAsc(List.of(99L)))
                .thenReturn(List.of());
        UniversityDetailService service = new UniversityDetailService(
                universities,
                programmes,
                intakes,
                programmeQuery,
                criteriaFactory,
                filterCodeValidator
        );

        PageResponse<UniversityProgrammeResponse> response = service.getPublishedProgrammes(
                "example-university",
                query
        );

        assertThat(response.items()).isEmpty();
    }
}
