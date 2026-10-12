package com.yangdoujiao.website.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class ProgrammeCatalogRepositoryIntegrationTest {

    @Autowired
    private StudyLevelRepository studyLevelRepository;

    @Autowired
    private CourseModeRepository courseModeRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void savesAndFindsStudyLevelByStableCode() {
        studyLevelRepository.saveAndFlush(new StudyLevel(
                "BACHELOR",
                "本科",
                "Bachelor",
                10,
                CategoryStatus.PUBLISHED
        ));
        entityManager.clear();

        StudyLevel stored = studyLevelRepository.findByCode("BACHELOR").orElseThrow();

        assertThat(stored.getId()).isNotNull();
        assertThat(stored.getNameZh()).isEqualTo("本科");
        assertThat(stored.getNameEn()).isEqualTo("Bachelor");
        assertThat(stored.getSortOrder()).isEqualTo(10);
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.PUBLISHED);
        assertThat(stored.getCreatedAt()).isNotNull();
        assertThat(stored.getUpdatedAt()).isNotNull();
    }

    @Test
    void savesAndFindsCourseModeByStableCode() {
        courseModeRepository.saveAndFlush(new CourseMode(
                "ON_CAMPUS",
                "线下授课",
                "On campus",
                20,
                CategoryStatus.PUBLISHED
        ));
        entityManager.clear();

        CourseMode stored = courseModeRepository.findByCode("ON_CAMPUS").orElseThrow();

        assertThat(stored.getId()).isNotNull();
        assertThat(stored.getNameZh()).isEqualTo("线下授课");
        assertThat(stored.getNameEn()).isEqualTo("On campus");
        assertThat(stored.getSortOrder()).isEqualTo(20);
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.PUBLISHED);
        assertThat(stored.getCreatedAt()).isNotNull();
        assertThat(stored.getUpdatedAt()).isNotNull();
    }

    @Test
    void savesAndFindsLanguageByStableCode() {
        languageRepository.saveAndFlush(new Language(
                "EN",
                "英语",
                "English",
                30,
                CategoryStatus.PUBLISHED
        ));
        entityManager.clear();

        Language stored = languageRepository.findByCode("EN").orElseThrow();

        assertThat(stored.getId()).isNotNull();
        assertThat(stored.getNameZh()).isEqualTo("英语");
        assertThat(stored.getNameEn()).isEqualTo("English");
        assertThat(stored.getSortOrder()).isEqualTo(30);
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.PUBLISHED);
        assertThat(stored.getCreatedAt()).isNotNull();
        assertThat(stored.getUpdatedAt()).isNotNull();
    }
}
