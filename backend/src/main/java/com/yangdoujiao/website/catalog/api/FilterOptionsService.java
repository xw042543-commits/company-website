package com.yangdoujiao.website.catalog.api;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.CountryRepository;
import com.yangdoujiao.website.catalog.CourseModeRepository;
import com.yangdoujiao.website.catalog.LanguageRepository;
import com.yangdoujiao.website.catalog.StudyLevelRepository;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;

@Service
public class FilterOptionsService {

    private final CountryRepository countryRepository;
    private final SubjectCategoryRepository subjectCategoryRepository;
    private final StudyLevelRepository studyLevelRepository;
    private final CourseModeRepository courseModeRepository;
    private final LanguageRepository languageRepository;

    public FilterOptionsService(
            CountryRepository countryRepository,
            SubjectCategoryRepository subjectCategoryRepository,
            StudyLevelRepository studyLevelRepository,
            CourseModeRepository courseModeRepository,
            LanguageRepository languageRepository
    ) {
        this.countryRepository = countryRepository;
        this.subjectCategoryRepository = subjectCategoryRepository;
        this.studyLevelRepository = studyLevelRepository;
        this.courseModeRepository = courseModeRepository;
        this.languageRepository = languageRepository;
    }

    @Transactional(readOnly = true)
    public FilterOptionsResponse getPublishedOptions() {
        return new FilterOptionsResponse(
                countryRepository.findAllByOrderByCodeAsc().stream()
                        .map(country -> new FilterOptionResponse(
                                country.getCode(), country.getNameZh(), country.getNameEn()
                        ))
                        .toList(),
                subjectCategoryRepository
                        .findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)
                        .stream()
                        .map(category -> new FilterOptionResponse(
                                category.getCode(), category.getNameZh(), category.getNameEn()
                        ))
                        .toList(),
                studyLevelRepository
                        .findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)
                        .stream()
                        .map(level -> new FilterOptionResponse(
                                level.getCode(), level.getNameZh(), level.getNameEn()
                        ))
                        .toList(),
                courseModeRepository
                        .findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)
                        .stream()
                        .map(mode -> new FilterOptionResponse(
                                mode.getCode(), mode.getNameZh(), mode.getNameEn()
                        ))
                        .toList(),
                languageRepository
                        .findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)
                        .stream()
                        .map(language -> new FilterOptionResponse(
                                language.getCode(), language.getNameZh(), language.getNameEn()
                        ))
                        .toList()
        );
    }
}
