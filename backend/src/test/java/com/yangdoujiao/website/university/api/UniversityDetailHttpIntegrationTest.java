package com.yangdoujiao.website.university.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class UniversityDetailHttpIntegrationTest {

    private static final String UNIVERSITY_SLUG = "detail-published-university";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    @BeforeEach
    void createPublishedUniversity() {
        deleteFixtures();
        Long countryId = jdbc.queryForObject("""
                INSERT INTO countries(code, name_zh, name_en, continent_code)
                VALUES ('XZ', '测试国', 'Exampleland', 'TEST')
                RETURNING id
                """, Long.class);
        jdbc.update("""
                INSERT INTO universities(
                    name, slug, country, popular, university_code,
                    name_zh, name_en, city_zh, city_en,
                    description_zh, description_en, country_id,
                    status, published_at
                )
                VALUES (?, ?, ?, TRUE, 'DETAIL_PUBLISHED', ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', CURRENT_TIMESTAMP)
                """,
                "Published Example University",
                UNIVERSITY_SLUG,
                "Exampleland",
                "已发布示例大学",
                "Published Example University",
                "示例城",
                "Example City",
                "用于院校详情集成测试。",
                "Used by the university detail integration test.",
                countryId
        );
    }

    @AfterEach
    void deleteFixtures() {
        jdbc.update("DELETE FROM programmes WHERE programme_code LIKE 'DETAIL_%'");
        jdbc.update("DELETE FROM languages WHERE code LIKE 'DETAIL_%'");
        jdbc.update("DELETE FROM course_modes WHERE code LIKE 'DETAIL_%'");
        jdbc.update("DELETE FROM study_levels WHERE code LIKE 'DETAIL_%'");
        jdbc.update("DELETE FROM subject_categories WHERE code LIKE 'DETAIL_%'");
        jdbc.update("DELETE FROM universities WHERE university_code = 'DETAIL_PUBLISHED'");
        jdbc.update("DELETE FROM countries WHERE code IN ('XZ', 'YY')");
    }

    @Test
    void returnsPublishedUniversityDetailsBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/universities/{slug}", UNIVERSITY_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(UNIVERSITY_SLUG))
                .andExpect(jsonPath("$.nameZh").value("已发布示例大学"))
                .andExpect(jsonPath("$.nameEn").value("Published Example University"))
                .andExpect(jsonPath("$.countryCode").value("XZ"))
                .andExpect(jsonPath("$.countryNameZh").value("测试国"))
                .andExpect(jsonPath("$.countryNameEn").value("Exampleland"))
                .andExpect(jsonPath("$.cityZh").value("示例城"))
                .andExpect(jsonPath("$.cityEn").value("Example City"))
                .andExpect(jsonPath("$.descriptionZh").value("用于院校详情集成测试。"))
                .andExpect(jsonPath("$.descriptionEn").value("Used by the university detail integration test."))
                .andExpect(jsonPath("$.popular").value(true));
    }

    @Test
    void returnsEmptyProgrammePageForPublishedUniversityWithoutProgrammes() throws Exception {
        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(12))
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void returnsPublishedProgrammeDetailsFromPostgres() throws Exception {
        createPublishedProgramme();

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.items[0].slug").value("msc-data-science"))
                .andExpect(jsonPath("$.items[0].nameZh").value("数据科学硕士"))
                .andExpect(jsonPath("$.items[0].nameEn").value("MSc Data Science"))
                .andExpect(jsonPath("$.items[0].categoryCode").value("DETAIL_COMPUTING"))
                .andExpect(jsonPath("$.items[0].studyLevelCode").value("DETAIL_MASTER"))
                .andExpect(jsonPath("$.items[0].courseModeCode").value("DETAIL_ON_CAMPUS"))
                .andExpect(jsonPath("$.items[0].languageCodes[0]").value("DETAIL_EN"))
                .andExpect(jsonPath("$.items[0].durationMonths").value(12))
                .andExpect(jsonPath("$.items[0].tuitionCurrency").value("GBP"))
                .andExpect(jsonPath("$.items[0].tuitionFeePeriod").value("TOTAL_PROGRAM"))
                .andExpect(jsonPath("$.items[0].tuitionTotalRmbMin").value(200000))
                .andExpect(jsonPath("$.items[0].tuitionTotalRmbMax").value(236000))
                .andExpect(jsonPath("$.items[0].intakeMonths[0]").value("2027-01"))
                .andExpect(jsonPath("$.items[0].intakeMonths[1]").value("2027-09"))
                .andExpect(jsonPath("$.items[0].intakeDisplayTexts[0]").value("January 2027"))
                .andExpect(jsonPath("$.items[0].intakeDisplayTexts[1]").value("September 2027"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(12))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void returnsOnePublishedProgrammeByDatabaseIdAndLegacySlug() throws Exception {
        Long programmeId = createPublishedProgramme();

        mockMvc.perform(get(
                        "/api/v1/universities/{slug}/programmes/{programmeIdentifier}",
                        UNIVERSITY_SLUG,
                        programmeId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(programmeId))
                .andExpect(jsonPath("$.programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.slug").value("msc-data-science"))
                .andExpect(jsonPath("$.nameEn").value("MSc Data Science"));

        mockMvc.perform(get(
                        "/api/v1/universities/{slug}/programmes/{programmeIdentifier}",
                        UNIVERSITY_SLUG,
                        "msc-data-science"
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(programmeId));
    }

    @Test
    void returnsNotFoundForUnknownProgrammeIdentifier() throws Exception {
        createPublishedProgramme();

        mockMvc.perform(get(
                        "/api/v1/universities/{slug}/programmes/{programmeIdentifier}",
                        UNIVERSITY_SLUG,
                        999999999
                ))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void appliesCategoryLevelModeAndLanguageToTheSameProgramme() throws Exception {
        createPublishedProgramme();
        createAlternativePublishedProgramme();

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("category", "DETAIL_COMPUTING")
                        .queryParam("level", "DETAIL_MASTER")
                        .queryParam("mode", "DETAIL_ON_CAMPUS")
                        .queryParam("language", "DETAIL_EN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void filtersProgrammesByEnglishNameKeyword() throws Exception {
        createPublishedProgramme();
        createAlternativePublishedProgramme();

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("q", "  data  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void combinesDurationIntakeAndOverlappingTuitionRange() throws Exception {
        createPublishedProgramme();
        createAlternativePublishedProgramme();

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("duration", "12")
                        .queryParam("intake", "2027-09")
                        .queryParam("tuitionMin", "210000")
                        .queryParam("tuitionMax", "220000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void returnsNoProgrammesWhenCountryFilterDoesNotMatchUniversity() throws Exception {
        createPublishedProgramme();
        jdbc.update("""
                INSERT INTO countries(code, name_zh, name_en, continent_code)
                VALUES ('YY', '其他测试国', 'Other Exampleland', 'TEST')
                """);

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("country", "YY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void hidesDraftUniversityFromPublicDetailEndpoints() throws Exception {
        jdbc.update(
                "UPDATE universities SET status = 'DRAFT', published_at = NULL WHERE university_code = 'DETAIL_PUBLISHED'"
        );

        mockMvc.perform(get("/api/v1/universities/{slug}", UNIVERSITY_SLUG))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void returnsStableSecondProgrammePage() throws Exception {
        createPublishedProgramme();
        createAlternativePublishedProgramme();

        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("page", "2")
                        .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].programmeCode").value("DETAIL_MSC_DATA"))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.pageSize").value(1))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void rejectsPageWhenRequestedOffsetWouldOverflow() throws Exception {
        mockMvc.perform(get("/api/v1/universities/{slug}/programmes", UNIVERSITY_SLUG)
                        .queryParam("page", "2147483647")
                        .queryParam("size", "48"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.page").value("is too large for requested size"));
    }

    private Long createPublishedProgramme() {
        Long universityId = jdbc.queryForObject(
                "SELECT id FROM universities WHERE university_code = 'DETAIL_PUBLISHED'",
                Long.class
        );
        Long categoryId = jdbc.queryForObject("""
                INSERT INTO subject_categories(code, name_zh, name_en, status)
                VALUES ('DETAIL_COMPUTING', '计算机', 'Computing', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long levelId = jdbc.queryForObject("""
                INSERT INTO study_levels(code, name_zh, name_en, status)
                VALUES ('DETAIL_MASTER', '硕士', 'Master', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long modeId = jdbc.queryForObject("""
                INSERT INTO course_modes(code, name_zh, name_en, status)
                VALUES ('DETAIL_ON_CAMPUS', '校园授课', 'On campus', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long languageId = jdbc.queryForObject("""
                INSERT INTO languages(code, name_zh, name_en, status)
                VALUES ('DETAIL_EN', '英语', 'English', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long programmeId = jdbc.queryForObject("""
                INSERT INTO programmes(
                    programme_code, university_id, subject_category_id,
                    study_level_id, course_mode_id, slug, name_zh, name_en,
                    description_zh, description_en, duration_months, duration_display,
                    tuition_min, tuition_max, tuition_currency, tuition_display,
                    tuition_rmb_min, tuition_rmb_max, exchange_rate, exchange_rate_date,
                    tuition_fee_period, tuition_total_rmb_min, tuition_total_rmb_max,
                    status, published_at
                )
                VALUES (
                    'DETAIL_MSC_DATA', ?, ?, ?, ?, 'msc-data-science',
                    '数据科学硕士', 'MSc Data Science', '课程中文介绍', 'Programme description',
                    12, '1 year', 22000, 26000, 'GBP', 'GBP 22,000–26,000',
                    200000, 236000, 9.07692308, DATE '2026-09-18',
                    'TOTAL_PROGRAM', 200000, 236000, 'PUBLISHED', CURRENT_TIMESTAMP
                )
                RETURNING id
                """, Long.class, universityId, categoryId, levelId, modeId);
        jdbc.update(
                "INSERT INTO programme_languages(programme_id, language_id) VALUES (?, ?)",
                programmeId,
                languageId
        );
        jdbc.update("""
                INSERT INTO programme_intakes(programme_id, intake_date, display_text)
                VALUES (?, DATE '2027-09-01', 'September 2027'),
                       (?, DATE '2027-01-01', 'January 2027')
                """, programmeId, programmeId);
        return programmeId;
    }

    private void createAlternativePublishedProgramme() {
        Long universityId = jdbc.queryForObject(
                "SELECT id FROM universities WHERE university_code = 'DETAIL_PUBLISHED'",
                Long.class
        );
        Long categoryId = jdbc.queryForObject("""
                INSERT INTO subject_categories(code, name_en, status)
                VALUES ('DETAIL_BUSINESS', 'Business', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long levelId = jdbc.queryForObject("""
                INSERT INTO study_levels(code, name_en, status)
                VALUES ('DETAIL_BACHELOR', 'Bachelor', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long modeId = jdbc.queryForObject("""
                INSERT INTO course_modes(code, name_en, status)
                VALUES ('DETAIL_ONLINE', 'Online', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long languageId = jdbc.queryForObject("""
                INSERT INTO languages(code, name_en, status)
                VALUES ('DETAIL_FR', 'French', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long programmeId = jdbc.queryForObject("""
                INSERT INTO programmes(
                    programme_code, university_id, subject_category_id,
                    study_level_id, course_mode_id, slug, name_en, status, published_at
                )
                VALUES (
                    'DETAIL_BBA', ?, ?, ?, ?, 'bba',
                    'Bachelor of Business Administration', 'PUBLISHED', CURRENT_TIMESTAMP
                )
                RETURNING id
                """, Long.class, universityId, categoryId, levelId, modeId);
        jdbc.update(
                "INSERT INTO programme_languages(programme_id, language_id) VALUES (?, ?)",
                programmeId,
                languageId
        );
    }
}
