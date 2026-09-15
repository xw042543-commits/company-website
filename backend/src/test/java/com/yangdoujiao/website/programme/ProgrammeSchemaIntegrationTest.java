package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class ProgrammeSchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayCreatesProgrammeTables() {
        assertThat(existingTables(
                "study_levels",
                "course_modes",
                "languages",
                "programmes",
                "programme_languages",
                "programme_intakes"
        )).containsExactlyInAnyOrder(
                "study_levels",
                "course_modes",
                "languages",
                "programmes",
                "programme_languages",
                "programme_intakes"
        );
    }

    @Test
    void v3KeepsLegacyUniversityColumns() {
        assertThat(existingColumns("universities")).contains(
                "id",
                "name",
                "slug",
                "country",
                "popular",
                "created_at"
        );
    }

    @Test
    void acceptsValidDictionaryAndProgrammeRelations() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long languageId = insertLanguage("EN", "英语", "English");
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                "计算机科学理学士",
                "Bachelor of Computer Science"
        );

        jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, ?)
                """, programmeId, languageId);
        jdbcTemplate.update("""
                INSERT INTO programme_intakes (programme_id, intake_date, display_text)
                VALUES (?, DATE '2027-02-01', 'February 2027')
                """, programmeId);

        assertThat(jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM programmes p
                JOIN universities u ON u.id = p.university_id
                JOIN subject_categories sc ON sc.id = p.subject_category_id
                JOIN study_levels sl ON sl.id = p.study_level_id
                JOIN course_modes cm ON cm.id = p.course_mode_id
                JOIN programme_languages pl ON pl.programme_id = p.id
                JOIN languages l ON l.id = pl.language_id
                JOIN programme_intakes pi ON pi.programme_id = p.id
                WHERE p.programme_code = 'UM_BSC_CS'
                  AND u.university_code = 'UM'
                  AND sc.code = 'COMPUTER_SCIENCE'
                  AND sl.code = 'BACHELOR'
                  AND cm.code = 'ON_CAMPUS'
                  AND l.code = 'EN'
                  AND pi.display_text = 'February 2027'
                """, Integer.class)).isEqualTo(1);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsDuplicateDictionaryCode(String tableName) {
        insertDictionary(tableName, "BACHELOR", "本科", "Bachelor", 0, "DRAFT");

        assertThatThrownBy(() -> insertDictionary(
                tableName,
                "BACHELOR",
                "另一个名称",
                "Another name",
                1,
                "DRAFT"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsDictionaryWithoutAnyName(String tableName) {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO %s (code, name_zh, name_en, status)
                VALUES ('BACHELOR', '   ', NULL, 'DRAFT')
                """.formatted(tableName)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsNegativeSortOrder(String tableName) {
        assertThatThrownBy(() -> insertDictionary(
                tableName,
                "BACHELOR",
                "本科",
                "Bachelor",
                -1,
                "DRAFT"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsInvalidDictionaryStatus(String tableName) {
        assertThatThrownBy(() -> insertDictionary(
                tableName,
                "BACHELOR",
                "本科",
                "Bachelor",
                0,
                "UNKNOWN"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDuplicateProgrammeCode() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> insertProgramme(
                "UM_BSC_CS",
                "bsc-software-engineering",
                dependencies,
                null,
                "Bachelor of Software Engineering"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDuplicateProgrammeSlugWithinUniversity() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> insertProgramme(
                "UM_BSC_CS_ALT",
                "bsc-computer-science",
                dependencies,
                null,
                "Alternative Computer Science Programme"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1})
    void rejectsNonPositiveDuration(int durationMonths) {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, duration_months
                )
                VALUES ('UM_INVALID_DURATION', ?, ?, 'invalid-duration',
                        'Invalid Duration', ?)
                """, dependencies.universityId(), dependencies.subjectCategoryId(), durationMonths))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"tuition_min", "tuition_max", "tuition_rmb_min", "tuition_rmb_max"})
    void rejectsNegativeTuition(String columnName) {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> jdbcTemplate.update("""
                UPDATE programmes
                SET %s = -0.01
                WHERE id = ?
                """.formatted(columnName), programmeId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsTuitionMinimumAboveMaximum() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_min, tuition_max, tuition_currency
                )
                VALUES ('UM_INVALID_RANGE', ?, ?, 'invalid-range',
                        'Invalid Tuition Range', 50000, 40000, 'MYR')
                """, dependencies.universityId(), dependencies.subjectCategoryId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsTuitionWithoutCurrency() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_min
                )
                VALUES ('UM_MISSING_CURRENCY', ?, ?, 'missing-currency',
                        'Missing Currency', 40000)
                """, dependencies.universityId(), dependencies.subjectCategoryId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsRmbTuitionWithoutExchangeRateAndDate() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_rmb_min, exchange_rate_date
                )
                VALUES ('UM_MISSING_RATE', ?, ?, 'missing-rate',
                        'Missing Exchange Rate', 70000, DATE '2026-09-15')
                """, dependencies.universityId(), dependencies.subjectCategoryId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsRmbTuitionWithoutExchangeRateDate() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_rmb_min, exchange_rate
                )
                VALUES ('UM_MISSING_RATE_DATE', ?, ?, 'missing-rate-date',
                        'Missing Exchange Rate Date', 70000, 1.70000000)
                """, dependencies.universityId(), dependencies.subjectCategoryId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDuplicateProgrammeLanguage() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );
        Long languageId = insertLanguage("EN", "英语", "English");
        jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, ?)
                """, programmeId, languageId);

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, ?)
                """, programmeId, languageId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsIntakeWithoutDisplayText() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programme_intakes (programme_id, intake_date, display_text)
                VALUES (?, DATE '2027-02-01', '   ')
                """, programmeId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsInvalidDictionaryCode(String tableName) {
        assertThatThrownBy(() -> insertDictionary(
                tableName,
                "invalid-code",
                "无效代码",
                "Invalid code",
                0,
                "DRAFT"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"study_levels", "course_modes", "languages"})
    void rejectsOverlongDictionaryCode(String tableName) {
        assertThatThrownBy(() -> insertDictionary(
                tableName,
                "A".repeat(65),
                "超长代码",
                "Overlong code",
                0,
                "DRAFT"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsInvalidProgrammeCode() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> insertProgramme(
                "invalid-code",
                "invalid-code",
                dependencies,
                null,
                "Invalid code"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsOverlongProgrammeCode() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> insertProgramme(
                "A".repeat(65),
                "overlong-code",
                dependencies,
                null,
                "Overlong code"
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsInvalidTuitionCurrency() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_min, tuition_currency
                )
                VALUES ('UM_INVALID_CURRENCY', ?, ?, 'invalid-currency',
                        'Invalid Currency', 40000, 'myr')
                """, dependencies.universityId(), dependencies.subjectCategoryId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "university_id",
            "subject_category_id",
            "study_level_id",
            "course_mode_id"
    })
    void rejectsMissingProgrammeForeignKey(String columnName) {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> jdbcTemplate.update("""
                UPDATE programmes
                SET %s = 9999999999
                WHERE id = ?
                """.formatted(columnName), programmeId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsMissingProgrammeLanguageProgrammeForeignKey() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long languageId = insertLanguage("EN", "英语", "English");

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (9999999999, ?)
                """, languageId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsMissingProgrammeLanguageLanguageForeignKey() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, 9999999999)
                """, programmeId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsMissingProgrammeIntakeForeignKey() {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO programme_intakes (programme_id, intake_date, display_text)
                VALUES (9999999999, DATE '2027-02-01', 'February 2027')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "universities",
            "subject_categories",
            "study_levels",
            "course_modes"
    })
    void rejectsDeletingReferencedProgrammeDependency(String tableName) {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );

        Long dependencyId = switch (tableName) {
            case "universities" -> dependencies.universityId();
            case "subject_categories" -> dependencies.subjectCategoryId();
            case "study_levels" -> dependencies.studyLevelId();
            case "course_modes" -> dependencies.courseModeId();
            default -> throw new IllegalArgumentException("Unknown dependency table: " + tableName);
        };

        assertThatThrownBy(() -> jdbcTemplate.update(
                "DELETE FROM %s WHERE id = ?".formatted(tableName),
                dependencyId
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDeletingReferencedLanguage() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );
        Long languageId = insertLanguage("EN", "英语", "English");
        jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, ?)
                """, programmeId, languageId);

        assertThatThrownBy(() -> jdbcTemplate.update(
                "DELETE FROM languages WHERE id = ?",
                languageId
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deletingProgrammeCascadesRelationsButKeepsLanguage() {
        ProgrammeDependencies dependencies = insertProgrammeDependencies();
        Long programmeId = insertProgramme(
                "UM_BSC_CS",
                "bsc-computer-science",
                dependencies,
                null,
                "Bachelor of Computer Science"
        );
        Long languageId = insertLanguage("EN", "英语", "English");
        jdbcTemplate.update("""
                INSERT INTO programme_languages (programme_id, language_id)
                VALUES (?, ?)
                """, programmeId, languageId);
        jdbcTemplate.update("""
                INSERT INTO programme_intakes (programme_id, intake_date, display_text)
                VALUES (?, DATE '2027-02-01', 'February 2027')
                """, programmeId);

        jdbcTemplate.update("DELETE FROM programmes WHERE id = ?", programmeId);

        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM programme_languages WHERE programme_id = ?",
                Integer.class,
                programmeId
        )).isZero();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM programme_intakes WHERE programme_id = ?",
                Integer.class,
                programmeId
        )).isZero();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM languages WHERE id = ?",
                Integer.class,
                languageId
        )).isEqualTo(1);
    }

    private ProgrammeDependencies insertProgrammeDependencies() {
        Long countryId = jdbcTemplate.queryForObject("""
                INSERT INTO countries (code, name_zh, name_en, continent_code)
                VALUES ('MY', '马来西亚', 'Malaysia', 'ASIA')
                RETURNING id
                """, Long.class);
        Long subjectCategoryId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (code, name_zh, name_en, status)
                VALUES ('COMPUTER_SCIENCE', '计算机科学', 'Computer Science', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        Long studyLevelId = insertDictionary(
                "study_levels", "BACHELOR", "本科", "Bachelor", 10, "PUBLISHED"
        );
        Long courseModeId = insertDictionary(
                "course_modes", "ON_CAMPUS", "线下授课", "On campus", 10, "PUBLISHED"
        );
        Long universityId = jdbcTemplate.queryForObject("""
                INSERT INTO universities (
                    name, slug, country, popular,
                    university_code, name_en, country_id, status
                )
                VALUES (
                    'University of Malaya', 'university-of-malaya', 'Malaysia', TRUE,
                    'UM', 'University of Malaya', ?, 'PUBLISHED'
                )
                RETURNING id
                """, Long.class, countryId);

        return new ProgrammeDependencies(
                universityId,
                subjectCategoryId,
                studyLevelId,
                courseModeId
        );
    }

    private Long insertLanguage(String code, String nameZh, String nameEn) {
        return insertDictionary("languages", code, nameZh, nameEn, 10, "PUBLISHED");
    }

    private Long insertDictionary(
            String tableName,
            String code,
            String nameZh,
            String nameEn,
            int sortOrder,
            String status
    ) {
        return jdbcTemplate.queryForObject("""
                INSERT INTO %s (code, name_zh, name_en, sort_order, status)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """.formatted(tableName),
                Long.class,
                code,
                nameZh,
                nameEn,
                sortOrder,
                status);
    }

    private Long insertProgramme(
            String programmeCode,
            String slug,
            ProgrammeDependencies dependencies,
            String nameZh,
            String nameEn
    ) {
        return jdbcTemplate.queryForObject("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    study_level_id, course_mode_id, slug, name_zh, name_en,
                    duration_months, duration_display,
                    tuition_min, tuition_max, tuition_currency, tuition_display,
                    tuition_rmb_min, tuition_rmb_max, exchange_rate, exchange_rate_date,
                    status
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    36, '3 years',
                    40000, 50000, 'MYR', 'MYR 40,000 - 50,000',
                    68000, 85000, 1.70000000, DATE '2026-09-15',
                    'PUBLISHED'
                )
                RETURNING id
                """,
                Long.class,
                programmeCode,
                dependencies.universityId(),
                dependencies.subjectCategoryId(),
                dependencies.studyLevelId(),
                dependencies.courseModeId(),
                slug,
                nameZh,
                nameEn);
    }

    private List<String> existingTables(String... tableNames) {
        return jdbcTemplate.queryForList("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = ANY (?::text[])
                """, String.class, (Object) tableNames);
    }

    private List<String> existingColumns(String tableName) {
        return jdbcTemplate.queryForList("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                """, String.class, tableName);
    }

    private record ProgrammeDependencies(
            Long universityId,
            Long subjectCategoryId,
            Long studyLevelId,
            Long courseModeId
    ) {
    }
}
