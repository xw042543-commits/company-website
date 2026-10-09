package com.yangdoujiao.website.university.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
import com.yangdoujiao.website.catalog.CourseMode;
import com.yangdoujiao.website.catalog.StudyLevel;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.media.MediaLookupRepository;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeIntakeRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.programme.TuitionFeePeriod;
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
    @Mock private MediaLookupRepository media;
    @Mock private University university;
    @Mock private Programme programme;
    @Mock private SubjectCategory subjectCategory;
    @Mock private StudyLevel studyLevel;
    @Mock private CourseMode courseMode;

    @Test
    void returnsPublishedProgrammeOnlyWhenItBelongsToThePublishedUniversity() {
        when(university.getId()).thenReturn(9L);
        when(universities.findBySlugAndStatus("segi", CategoryStatus.PUBLISHED))
                .thenReturn(Optional.of(university));
        when(programmes.findPublishedDetailedByIdAndUniversityId(584L, 9L))
                .thenReturn(Optional.of(programme));
        when(programme.getId()).thenReturn(584L);
        when(programme.getProgrammeCode()).thenReturn("SEGI_BACHELOR_001");
        when(programme.getSlug()).thenReturn("segi-bachelor-001");
        when(programme.getNameZh()).thenReturn("商务管理（荣誉）学士学位");
        when(programme.getSubjectCategory()).thenReturn(subjectCategory);
        when(subjectCategory.getCode()).thenReturn("BUSINESS_MANAGEMENT");
        when(programme.getStudyLevel()).thenReturn(studyLevel);
        when(studyLevel.getCode()).thenReturn("BACHELOR");
        when(programme.getCourseMode()).thenReturn(courseMode);
        when(courseMode.getCode()).thenReturn("ON_CAMPUS");
        when(programme.getLanguages()).thenReturn(Set.of());
        when(programme.getTuitionFeePeriod()).thenReturn(TuitionFeePeriod.UNKNOWN);
        when(intakes.findByProgrammeIdOrderByIntakeDateAsc(584L)).thenReturn(List.of());

        UniversityProgrammeResponse response = service().getPublishedProgramme("segi", "584");

        assertThat(response.id()).isEqualTo(584L);
        assertThat(response.slug()).isEqualTo("segi-bachelor-001");
        assertThat(response.nameZh()).isEqualTo("商务管理（荣誉）学士学位");
    }

    @Test
    void rejectsAProgrammeThatDoesNotBelongToTheRequestedUniversity() {
        when(university.getId()).thenReturn(9L);
        when(universities.findBySlugAndStatus("segi", CategoryStatus.PUBLISHED))
                .thenReturn(Optional.of(university));
        when(programmes.findPublishedDetailedByIdAndUniversityId(584L, 9L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().getPublishedProgramme("segi", "584"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void supportsAnExistingProgrammeSlugWithoutWeakeningUniversityOwnership() {
        when(university.getId()).thenReturn(9L);
        when(universities.findBySlugAndStatus("segi", CategoryStatus.PUBLISHED))
                .thenReturn(Optional.of(university));
        when(programmes.findPublishedDetailedBySlugAndUniversityId("segi-bachelor-001", 9L))
                .thenReturn(Optional.of(programme));
        when(programme.getId()).thenReturn(584L);
        when(programme.getProgrammeCode()).thenReturn("SEGI_BACHELOR_001");
        when(programme.getSlug()).thenReturn("segi-bachelor-001");
        when(programme.getSubjectCategory()).thenReturn(subjectCategory);
        when(subjectCategory.getCode()).thenReturn("BUSINESS_MANAGEMENT");
        when(programme.getLanguages()).thenReturn(Set.of());
        when(programme.getTuitionFeePeriod()).thenReturn(TuitionFeePeriod.UNKNOWN);
        when(intakes.findByProgrammeIdOrderByIntakeDateAsc(584L)).thenReturn(List.of());

        UniversityProgrammeResponse response = service().getPublishedProgramme(
                "segi",
                "segi-bachelor-001"
        );

        assertThat(response.id()).isEqualTo(584L);
    }

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
        UniversityDetailService service = service();

        PageResponse<UniversityProgrammeResponse> response = service.getPublishedProgrammes(
                "example-university",
                query
        );

        assertThat(response.items()).isEmpty();
    }

    private UniversityDetailService service() {
        org.mockito.Mockito.lenient().when(media.findUniversityImageUrls(org.mockito.ArgumentMatchers.any()))
                .thenReturn(java.util.Map.of());
        org.mockito.Mockito.lenient().when(media.findProgrammeImageUrls(org.mockito.ArgumentMatchers.any()))
                .thenReturn(java.util.Map.of());
        return new UniversityDetailService(
                universities,
                programmes,
                intakes,
                programmeQuery,
                criteriaFactory,
                filterCodeValidator,
                media
        );
    }
}
