package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.CourseMode;
import com.yangdoujiao.website.catalog.CourseModeRepository;
import com.yangdoujiao.website.catalog.Language;
import com.yangdoujiao.website.catalog.LanguageRepository;
import com.yangdoujiao.website.catalog.StudyLevel;
import com.yangdoujiao.website.catalog.StudyLevelRepository;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class ProgrammeRelationsIntegrationTest {

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private ProgrammeIntakeRepository programmeIntakeRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private SubjectCategoryRepository subjectCategoryRepository;

    @Autowired
    private StudyLevelRepository studyLevelRepository;

    @Autowired
    private CourseModeRepository courseModeRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void readsLanguagesAndIntakesFromProgrammeRelations() {
        Programme programme = createProgramme();
        Language english = languageRepository.saveAndFlush(
                new Language("EN", "英语", "English", 10, CategoryStatus.PUBLISHED)
        );
        Language chinese = languageRepository.saveAndFlush(
                new Language("ZH", "中文", "Chinese", 20, CategoryStatus.PUBLISHED)
        );

        programme.addLanguage(english);
        programme.addLanguage(chinese);
        programmeRepository.saveAndFlush(programme);

        programmeIntakeRepository.saveAllAndFlush(List.of(
                new ProgrammeIntake(
                        programme,
                        LocalDate.of(2027, 9, 1),
                        "September 2027"
                ),
                new ProgrammeIntake(
                        programme,
                        LocalDate.of(2027, 2, 1),
                        "February 2027"
                )
        ));
        entityManager.clear();

        Programme stored = programmeRepository.findByProgrammeCode("UM_BSC_CS").orElseThrow();
        List<ProgrammeIntake> intakes = programmeIntakeRepository
                .findByProgrammeIdOrderByIntakeDateAsc(stored.getId());

        assertThat(stored.getLanguages())
                .extracting(Language::getCode)
                .containsExactlyInAnyOrder("EN", "ZH");
        assertThatThrownBy(() -> stored.getLanguages().clear())
                .isInstanceOf(UnsupportedOperationException.class);
        assertThat(intakes)
                .extracting(ProgrammeIntake::getIntakeDate)
                .containsExactly(
                        LocalDate.of(2027, 2, 1),
                        LocalDate.of(2027, 9, 1)
                );
        assertThat(intakes)
                .extracting(ProgrammeIntake::getDisplayText)
                .containsExactly("February 2027", "September 2027");
    }

    private Programme createProgramme() {
        University university = createUniversity();
        SubjectCategory subjectCategory = subjectCategoryRepository.saveAndFlush(
                new SubjectCategory(
                        "COMPUTER_SCIENCE_RELATIONS",
                        "计算机科学",
                        "Computer Science",
                        null,
                        10,
                        CategoryStatus.PUBLISHED
                )
        );
        StudyLevel studyLevel = studyLevelRepository.saveAndFlush(
                new StudyLevel("BACHELOR_RELATIONS", "本科", "Bachelor", 10, CategoryStatus.PUBLISHED)
        );
        CourseMode courseMode = courseModeRepository.saveAndFlush(
                new CourseMode("ON_CAMPUS_RELATIONS", "线下授课", "On campus", 10, CategoryStatus.PUBLISHED)
        );

        return programmeRepository.saveAndFlush(new Programme(
                "UM_BSC_CS",
                university,
                subjectCategory,
                studyLevel,
                courseMode,
                "bsc-computer-science-relations",
                "计算机科学理学士",
                "Bachelor of Computer Science",
                CategoryStatus.PUBLISHED
        ));
    }

    private University createUniversity() {
        // University 为兼容旧接口暂未开放写入构造器，因此先插入记录，再通过 Repository 获取托管实体。
        Long universityId = jdbcTemplate.queryForObject("""
                INSERT INTO universities (
                    name, slug, country, popular, university_code, name_zh, name_en, status
                )
                VALUES (
                    'University of Malaya', 'university-of-malaya-relations-test',
                    'Malaysia', TRUE, 'UM_RELATIONS', '马来亚大学',
                    'University of Malaya', 'PUBLISHED'
                )
                RETURNING id
                """, Long.class);

        return universityRepository.findById(universityId).orElseThrow();
    }
}
