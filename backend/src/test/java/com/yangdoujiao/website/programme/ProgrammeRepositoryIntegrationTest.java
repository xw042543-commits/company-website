package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

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
class ProgrammeRepositoryIntegrationTest {

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private SubjectCategoryRepository subjectCategoryRepository;

    @Autowired
    private StudyLevelRepository studyLevelRepository;

    @Autowired
    private CourseModeRepository courseModeRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void savesAndFindsProgrammeByStableIdentifiers() {
        University university = createUniversity();
        SubjectCategory subjectCategory = subjectCategoryRepository.saveAndFlush(
                new SubjectCategory(
                        "COMPUTER_SCIENCE",
                        "计算机科学",
                        "Computer Science",
                        null,
                        10,
                        CategoryStatus.PUBLISHED
                )
        );
        StudyLevel studyLevel = studyLevelRepository.saveAndFlush(
                new StudyLevel("BACHELOR", "本科", "Bachelor", 10, CategoryStatus.PUBLISHED)
        );
        CourseMode courseMode = courseModeRepository.saveAndFlush(
                new CourseMode("ON_CAMPUS", "线下授课", "On campus", 10, CategoryStatus.PUBLISHED)
        );

        programmeRepository.saveAndFlush(new Programme(
                "UM_BSC_CS",
                university,
                subjectCategory,
                studyLevel,
                courseMode,
                "bsc-computer-science",
                "计算机科学理学士",
                "Bachelor of Computer Science",
                CategoryStatus.PUBLISHED
        ));
        entityManager.clear();

        Programme stored = programmeRepository.findByProgrammeCode("UM_BSC_CS").orElseThrow();

        assertThat(stored.getUniversity().getUniversityCode()).isEqualTo("UM");
        assertThat(stored.getSubjectCategory().getCode()).isEqualTo("COMPUTER_SCIENCE");
        assertThat(stored.getStudyLevel().getCode()).isEqualTo("BACHELOR");
        assertThat(stored.getCourseMode().getCode()).isEqualTo("ON_CAMPUS");
        assertThat(stored.getNameZh()).isEqualTo("计算机科学理学士");
        assertThat(stored.getNameEn()).isEqualTo("Bachelor of Computer Science");
        assertThat(stored.getSlug()).isEqualTo("bsc-computer-science");
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.PUBLISHED);
        assertThat(stored.getCreatedAt()).isNotNull();
        assertThat(stored.getUpdatedAt()).isNotNull();

        assertThat(programmeRepository.findByUniversityIdAndSlug(
                university.getId(),
                "bsc-computer-science"
        )).containsSame(stored);
    }

    private University createUniversity() {
        // University 为兼容旧接口暂未开放写入构造器，因此先插入记录，再通过 Repository 获取托管实体。
        Long universityId = jdbcTemplate.queryForObject("""
                INSERT INTO universities (
                    name, slug, country, popular, university_code, name_zh, name_en, status
                )
                VALUES (
                    'University of Malaya', 'university-of-malaya-programme-test',
                    'Malaysia', TRUE, 'UM', '马来亚大学', 'University of Malaya', 'PUBLISHED'
                )
                RETURNING id
                """, Long.class);

        return universityRepository.findById(universityId).orElseThrow();
    }
}
