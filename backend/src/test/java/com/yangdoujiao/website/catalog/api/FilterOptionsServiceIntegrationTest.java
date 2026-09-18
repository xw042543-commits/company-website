package com.yangdoujiao.website.catalog.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.Country;
import com.yangdoujiao.website.catalog.CountryRepository;
import com.yangdoujiao.website.catalog.CourseMode;
import com.yangdoujiao.website.catalog.CourseModeRepository;
import com.yangdoujiao.website.catalog.Language;
import com.yangdoujiao.website.catalog.LanguageRepository;
import com.yangdoujiao.website.catalog.StudyLevel;
import com.yangdoujiao.website.catalog.StudyLevelRepository;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class FilterOptionsServiceIntegrationTest {

    @Autowired
    private FilterOptionsService service;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private SubjectCategoryRepository subjectCategoryRepository;

    @Autowired
    private StudyLevelRepository studyLevelRepository;

    @Autowired
    private CourseModeRepository courseModeRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @Test
    void returnsCountriesByCodeAndOnlyPublishedCatalogOptionsInStableBusinessOrder() {
        countryRepository.saveAll(List.of(
                new Country("MY", "马来西亚", "Malaysia", "ASIA"),
                new Country("AU", "澳大利亚", "Australia", "OCEANIA")
        ));

        subjectCategoryRepository.saveAll(List.of(
                new SubjectCategory("ZZ_DRAFT", "草稿学科", "Draft subject", null, 0, CategoryStatus.DRAFT),
                new SubjectCategory("BUSINESS", "商业与管理", "Business and Management", null, 20, CategoryStatus.PUBLISHED),
                new SubjectCategory("ACCOUNTING", "会计", "Accounting", null, 20, CategoryStatus.PUBLISHED),
                new SubjectCategory("ENGINEERING", "工程", "Engineering", null, 10, CategoryStatus.PUBLISHED),
                new SubjectCategory("AA_ARCHIVED", "归档学科", "Archived subject", null, 0, CategoryStatus.ARCHIVED)
        ));

        studyLevelRepository.saveAll(List.of(
                new StudyLevel("ZZ_DRAFT", "草稿学历", "Draft level", 0, CategoryStatus.DRAFT),
                new StudyLevel("MASTER", "硕士", "Master", 20, CategoryStatus.PUBLISHED),
                new StudyLevel("BACHELOR", "本科", "Bachelor", 10, CategoryStatus.PUBLISHED),
                new StudyLevel("DIPLOMA", "文凭", "Diploma", 20, CategoryStatus.PUBLISHED),
                new StudyLevel("AA_ARCHIVED", "归档学历", "Archived level", 0, CategoryStatus.ARCHIVED)
        ));

        courseModeRepository.saveAll(List.of(
                new CourseMode("ZZ_DRAFT", "草稿模式", "Draft mode", 0, CategoryStatus.DRAFT),
                new CourseMode("ONLINE", "线上授课", "Online", 20, CategoryStatus.PUBLISHED),
                new CourseMode("HYBRID", "混合授课", "Hybrid", 20, CategoryStatus.PUBLISHED),
                new CourseMode("ON_CAMPUS", "线下授课", "On campus", 10, CategoryStatus.PUBLISHED),
                new CourseMode("AA_ARCHIVED", "归档模式", "Archived mode", 0, CategoryStatus.ARCHIVED)
        ));

        languageRepository.saveAll(List.of(
                new Language("ZZ_DRAFT", "草稿语言", "Draft language", 0, CategoryStatus.DRAFT),
                new Language("ZH", "中文", "Chinese", 20, CategoryStatus.PUBLISHED),
                new Language("MS", "马来语", "Malay", 20, CategoryStatus.PUBLISHED),
                new Language("EN", "英语", "English", 10, CategoryStatus.PUBLISHED),
                new Language("AA_ARCHIVED", "归档语言", "Archived language", 0, CategoryStatus.ARCHIVED)
        ));

        FilterOptionsResponse response = service.getPublishedOptions();

        assertThat(response.countries()).containsExactly(
                new FilterOptionResponse("AU", "澳大利亚", "Australia"),
                new FilterOptionResponse("MY", "马来西亚", "Malaysia")
        );
        assertThat(response.subjectCategories()).containsExactly(
                new FilterOptionResponse("ENGINEERING", "工程", "Engineering"),
                new FilterOptionResponse("ACCOUNTING", "会计", "Accounting"),
                new FilterOptionResponse("BUSINESS", "商业与管理", "Business and Management")
        );
        assertThat(response.studyLevels()).containsExactly(
                new FilterOptionResponse("BACHELOR", "本科", "Bachelor"),
                new FilterOptionResponse("DIPLOMA", "文凭", "Diploma"),
                new FilterOptionResponse("MASTER", "硕士", "Master")
        );
        assertThat(response.courseModes()).containsExactly(
                new FilterOptionResponse("ON_CAMPUS", "线下授课", "On campus"),
                new FilterOptionResponse("HYBRID", "混合授课", "Hybrid"),
                new FilterOptionResponse("ONLINE", "线上授课", "Online")
        );
        assertThat(response.languages()).containsExactly(
                new FilterOptionResponse("EN", "英语", "English"),
                new FilterOptionResponse("MS", "马来语", "Malay"),
                new FilterOptionResponse("ZH", "中文", "Chinese")
        );
    }
}
