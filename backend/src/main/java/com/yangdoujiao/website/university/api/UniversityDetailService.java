package com.yangdoujiao.website.university.api;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeIntake;
import com.yangdoujiao.website.programme.ProgrammeIntakeRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.search.v4.SearchFilterCodeValidator;
import com.yangdoujiao.website.search.v4.UniversitySearchCriteriaFactory;
import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;
import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityRepository;

@Service
public class UniversityDetailService {

    private final UniversityRepository universities;
    private final ProgrammeRepository programmes;
    private final ProgrammeIntakeRepository intakes;
    private final UniversityProgrammeQueryRepository programmeQuery;
    private final UniversitySearchCriteriaFactory criteriaFactory;
    private final SearchFilterCodeValidator filterCodeValidator;

    public UniversityDetailService(
            UniversityRepository universities,
            ProgrammeRepository programmes,
            ProgrammeIntakeRepository intakes,
            UniversityProgrammeQueryRepository programmeQuery,
            UniversitySearchCriteriaFactory criteriaFactory,
            SearchFilterCodeValidator filterCodeValidator
    ) {
        this.universities = universities;
        this.programmes = programmes;
        this.intakes = intakes;
        this.programmeQuery = programmeQuery;
        this.criteriaFactory = criteriaFactory;
        this.filterCodeValidator = filterCodeValidator;
    }

    @Transactional(readOnly = true)
    public UniversityDetailResponse getPublishedBySlug(String slug) {
        University university = universities.findBySlugAndStatus(slug, CategoryStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("University not found"));
        return UniversityDetailResponse.from(university);
    }

    @Transactional(readOnly = true)
    public PageResponse<UniversityProgrammeResponse> getPublishedProgrammes(
            String slug,
            UniversitySearchQuery query
    ) {
        University university = universities.findBySlugAndStatus(slug, CategoryStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("University not found"));
        var criteria = criteriaFactory.create(query);
        filterCodeValidator.validate(criteria);
        Page<Long> idPage = programmeQuery.findPageIds(university.getId(), criteria);
        if (idPage.isEmpty()) {
            return PageResponse.of(
                    List.of(),
                    criteria.page(),
                    criteria.pageSize(),
                    idPage.getTotalElements()
            );
        }

        List<Long> ids = idPage.getContent();
        Map<Long, Programme> programmeById = programmes
                .findPublishedDetailedByIdInAndUniversityId(ids, university.getId())
                .stream()
                .collect(Collectors.toMap(Programme::getId, Function.identity()));
        Map<Long, List<ProgrammeIntake>> intakesByProgrammeId = intakes
                .findAllByProgramme_IdInOrderByIntakeDateAsc(ids)
                .stream()
                .collect(Collectors.groupingBy(intake -> intake.getProgramme().getId()));

        List<UniversityProgrammeResponse> items = ids.stream()
                .map(programmeById::get)
                .filter(Objects::nonNull)
                .map(programme -> UniversityProgrammeResponse.from(
                        programme,
                        intakesByProgrammeId.getOrDefault(programme.getId(), List.of())
                ))
                .toList();
        return PageResponse.of(
                items,
                criteria.page(),
                criteria.pageSize(),
                idPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public UniversityProgrammeResponse getPublishedProgramme(String universitySlug, String programmeIdentifier) {
        University university = universities.findBySlugAndStatus(universitySlug, CategoryStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("University not found"));
        Programme programme = programmeIdentifier.matches("[1-9][0-9]*")
                ? programmes.findPublishedDetailedByUniversityIdAndId(university.getId(), Long.valueOf(programmeIdentifier))
                    .orElseThrow(() -> new ResourceNotFoundException("Programme not found"))
                : programmes.findPublishedDetailedByUniversityIdAndSlug(university.getId(), programmeIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Programme not found"));
        List<ProgrammeIntake> programmeIntakes = intakes
                .findAllByProgramme_IdInOrderByIntakeDateAsc(List.of(programme.getId()));
        return UniversityProgrammeResponse.from(programme, programmeIntakes);
    }
}
