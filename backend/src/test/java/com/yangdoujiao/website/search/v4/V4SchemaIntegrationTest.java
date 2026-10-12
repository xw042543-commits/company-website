package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

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
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.programme.TuitionFeePeriod;
import com.yangdoujiao.website.search.v4.alias.SearchAlias;
import com.yangdoujiao.website.search.v4.alias.SearchAliasRepository;
import com.yangdoujiao.website.search.v4.alias.SearchAliasStatus;
import com.yangdoujiao.website.search.v4.alias.SearchAliasTargetType;
import com.yangdoujiao.website.search.v4.sync.SearchSyncJob;
import com.yangdoujiao.website.search.v4.sync.SearchSyncJobRepository;
import com.yangdoujiao.website.search.v4.sync.SearchSyncJobStatus;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class V4SchemaIntegrationTest {

    private static final AtomicInteger FIXTURE_SEQUENCE = new AtomicInteger();

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SearchAliasRepository searchAliasRepository;

    @Autowired
    private SearchSyncJobRepository searchSyncJobRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void v4CreatesProgrammeTuitionColumnsAndSearchSupportTables() {
        assertThat(existingColumns("programmes")).contains(
                "tuition_fee_period",
                "tuition_total_rmb_min",
                "tuition_total_rmb_max"
        );
        assertThat(existingTables("search_aliases", "search_sync_jobs"))
                .containsExactlyInAnyOrder("search_aliases", "search_sync_jobs");
    }

    @ParameterizedTest
    @ValueSource(strings = {"tuition_total_rmb_min", "tuition_total_rmb_max"})
    void rejectsNegativeTotalProgrammeTuition(String columnName) {
        Long programmeId = insertProgrammeFixture();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                UPDATE programmes
                SET %s = -0.01
                WHERE id = ?
                """.formatted(columnName), programmeId))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_programmes_" + columnName);
    }

    @Test
    void rejectsTotalProgrammeTuitionMinimumAboveMaximum() {
        Long programmeId = insertProgrammeFixture();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                UPDATE programmes
                SET tuition_total_rmb_min = 300000,
                    tuition_total_rmb_max = 200000
                WHERE id = ?
                """, programmeId))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_programmes_tuition_total_rmb_range");
    }

    @Test
    void rejectsInvalidTuitionFeePeriod() {
        Long programmeId = insertProgrammeFixture();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                UPDATE programmes
                SET tuition_fee_period = 'PER_MONTH'
                WHERE id = ?
                """, programmeId))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_programmes_tuition_fee_period");
    }

    @Test
    void rejectsDuplicateAliasTargetButAllowsConflictToRemainVisible() {
        insertAlias("UK", "uk", "en", "COUNTRY", "GB", "PUBLISHED");
        insertAlias("UK conflict", "uk", "en", "COUNTRY", "UK", "PUBLISHED");

        assertThat(jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM search_aliases
                WHERE normalized_alias = 'uk'
                  AND status = 'PUBLISHED'
                """, Integer.class)).isEqualTo(2);

        assertThatThrownBy(() -> insertAlias(
                "United Kingdom",
                "uk",
                "en",
                "COUNTRY",
                "GB",
                "PUBLISHED"
        ))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("uk_search_aliases_normalized_target");
    }

    @ParameterizedTest
    @ValueSource(strings = {"SCHOOL", "CATEGORY"})
    void rejectsInvalidAliasTargetType(String targetType) {
        assertThatThrownBy(() -> insertAlias(
                "Invalid target",
                "invalid target " + targetType.toLowerCase(),
                "en",
                targetType,
                "INVALID",
                "DRAFT"
        ))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_search_aliases_target_type");
    }

    @ParameterizedTest
    @ValueSource(strings = {"READY", "COMPLETED"})
    void rejectsInvalidSyncJobStatus(String status) {
        long universityId = insertUniversityFixture();

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO search_sync_jobs (university_id, status)
                VALUES (?, ?)
                """, universityId, status))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("ck_search_sync_jobs_status");
    }

    @Test
    void readsLegacyProgrammeThroughV4JpaMapping() {
        Long programmeId = insertProgrammeFixture();
        entityManager.clear();

        Programme programme = programmeRepository.findById(programmeId).orElseThrow();

        assertThat(programme.getTuitionFeePeriod()).isEqualTo(TuitionFeePeriod.UNKNOWN);
        assertThat(programme.getTuitionTotalRmbMin()).isNull();
        assertThat(programme.getTuitionTotalRmbMax()).isNull();
    }

    @Test
    void persistsAliasAndReturnsEveryPublishedConflict() {
        searchAliasRepository.saveAndFlush(new SearchAlias(
                "UK",
                "uk",
                "en",
                SearchAliasTargetType.COUNTRY,
                "GB",
                SearchAliasStatus.PUBLISHED
        ));
        searchAliasRepository.saveAndFlush(new SearchAlias(
                "UK conflict",
                "uk",
                "en",
                SearchAliasTargetType.COUNTRY,
                "UK",
                SearchAliasStatus.PUBLISHED
        ));
        searchAliasRepository.saveAndFlush(new SearchAlias(
                "UK draft",
                "uk",
                "en",
                SearchAliasTargetType.COUNTRY,
                "DRAFT_TARGET",
                SearchAliasStatus.DRAFT
        ));
        entityManager.clear();

        List<SearchAlias> aliases = searchAliasRepository.findAllByNormalizedAliasAndStatus(
                "uk",
                SearchAliasStatus.PUBLISHED
        );

        assertThat(aliases)
                .extracting(SearchAlias::getTargetCode)
                .containsExactlyInAnyOrder("GB", "UK");
    }

    @Test
    void persistsPendingSearchSyncJob() {
        long universityId = insertUniversityFixture();
        Instant availableAt = Instant.parse("2026-09-17T03:00:00Z");

        SearchSyncJob saved = searchSyncJobRepository.saveAndFlush(
                new SearchSyncJob(universityId, availableAt)
        );
        entityManager.clear();

        SearchSyncJob stored = searchSyncJobRepository.findById(saved.getId()).orElseThrow();
        assertThat(stored.getUniversityId()).isEqualTo(universityId);
        assertThat(stored.getStatus()).isEqualTo(SearchSyncJobStatus.PENDING);
        assertThat(stored.getAttemptCount()).isZero();
        assertThat(stored.getAvailableAt()).isEqualTo(availableAt);
        assertThat(stored.getLockedAt()).isNull();
        assertThat(stored.getLastError()).isNull();
    }

    private List<String> existingColumns(String tableName) {
        return jdbcTemplate.queryForList("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                """, String.class, tableName);
    }

    private List<String> existingTables(String... tableNames) {
        return jdbcTemplate.queryForList("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = ANY (?)
                """, String.class, (Object) tableNames);
    }

    private Long insertProgrammeFixture() {
        int fixtureId = FIXTURE_SEQUENCE.incrementAndGet();
        long universityId = insertUniversityFixture();
        Long subjectCategoryId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (code, name_en)
                VALUES (?, ?)
                RETURNING id
                """, Long.class, "V4_CATEGORY_" + fixtureId, "V4 Category " + fixtureId);

        return jdbcTemplate.queryForObject("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id, slug, name_en
                )
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """, Long.class,
                "V4_PROGRAMME_" + fixtureId,
                universityId,
                subjectCategoryId,
                "v4-programme-" + fixtureId,
                "V4 Programme " + fixtureId);
    }

    private long insertUniversityFixture() {
        int fixtureId = FIXTURE_SEQUENCE.incrementAndGet();
        return jdbcTemplate.queryForObject("""
                INSERT INTO universities (name, slug, country, university_code)
                VALUES (?, ?, 'Testland', ?)
                RETURNING id
                """, Long.class,
                "V4 University " + fixtureId,
                "v4-university-" + fixtureId,
                "V4_UNIVERSITY_" + fixtureId);
    }

    private void insertAlias(
            String alias,
            String normalizedAlias,
            String language,
            String targetType,
            String targetCode,
            String status
    ) {
        jdbcTemplate.update("""
                INSERT INTO search_aliases (
                    alias, normalized_alias, language, target_type, target_code, status
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """, alias, normalizedAlias, language, targetType, targetCode, status);
    }
}
