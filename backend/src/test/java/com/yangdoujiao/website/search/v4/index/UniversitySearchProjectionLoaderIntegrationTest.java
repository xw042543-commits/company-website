package com.yangdoujiao.website.search.v4.index;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.elasticsearch.core.convert.MappingElasticsearchConverter;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.index.MappingBuilder;
import org.springframework.data.elasticsearch.core.mapping.SimpleElasticsearchMappingContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

@DataJpaTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({UniversitySearchProjectionLoader.class, UniversitySearchProjectionLoaderIntegrationTest.CacheConfiguration.class})
@Testcontainers
class UniversitySearchProjectionLoaderIntegrationTest {

    @TestConfiguration(proxyBeanMethods = false)
    static class CacheConfiguration {
        @Bean
        CacheManager cacheManager() {
            return new NoOpCacheManager();
        }
    }

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.11")
            .withDatabaseName("search_projection_test");

    @Autowired
    private UniversitySearchProjectionLoader loader;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    void rebuildsOnlyPublishedProgrammesWithStableLanguagesMonthsAndSourceTuition() {
        long university = university("PUBLISHED", true);
        long category = category();
        long first = programme(university, category, "FIRST", "PUBLISHED", "测试专业", null);
        long second = programme(university, category, "SECOND", "PUBLISHED", null, "Second programme");
        programme(university, category, "DRAFT_PROGRAMME", "DRAFT", null, "Draft programme");
        long level = jdbc.queryForObject("""
                INSERT INTO study_levels (code, name_en, status) VALUES ('MASTER', 'Master', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        long mode = jdbc.queryForObject("""
                INSERT INTO course_modes (code, name_en, status) VALUES ('ONLINE', 'Online', 'PUBLISHED')
                RETURNING id
                """, Long.class);
        jdbc.update("""
                UPDATE programmes SET study_level_id = ?, course_mode_id = ?, duration_months = 24,
                    duration_display = '2 years', tuition_display = 'Total RMB 120,000–150,000',
                    tuition_fee_period = 'TOTAL_PROGRAM', tuition_total_rmb_min = 120000,
                    tuition_total_rmb_max = 150000, tuition_rmb_min = 60000, tuition_rmb_max = 75000,
                    exchange_rate = 1, exchange_rate_date = '2026-09-17',
                    description_en = 'Full introduction must not be indexed'
                WHERE id = ?
                """, level, mode, first);
        long zh = language("ZH");
        long en = language("EN");
        jdbc.update("INSERT INTO programme_languages VALUES (?, ?), (?, ?), (?, ?)", first, zh, first, en, second, en);
        intake(first, "2028-09-20", "September 2028, second intake");
        intake(first, "2028-02-01", "February 2028");
        intake(first, "2028-09-01", "September 2028");
        intake(first, null, "Date to be announced");
        intake(second, "2029-01-15", "January 2029");
        Statistics statistics = resetStatistics();

        var document = loader.loadPublishedUniversity(university).orElseThrow();

        assertThat(document.getId()).isEqualTo(university);
        assertThat(document.getUniversityCode()).isEqualTo("TEST_UNIVERSITY");
        assertThat(document.getSlug()).isEqualTo("test-university");
        assertThat(document.getNameZh()).isNull();
        assertThat(document.getNameEn()).isEqualTo("Test university");
        assertThat(document.getCountryCode()).isEqualTo("MY");
        assertThat(document.getCountryNameZh()).isNull();
        assertThat(document.getCountryNameEn()).isEqualTo("Malaysia");
        assertThat(document.getCityZh()).isNull();
        assertThat(document.getCityEn()).isNull();
        assertThat(document.isPopular()).isTrue();
        assertThat(document.getProgrammes()).extracting(ProgrammeSearchDocument::getId)
                .containsExactly(first, second);
        ProgrammeSearchDocument projected = document.getProgrammes().getFirst();
        assertThat(projected.getProgrammeCode()).isEqualTo("FIRST");
        assertThat(projected.getNameZh()).isEqualTo("测试专业");
        assertThat(projected.getNameEn()).isNull();
        assertThat(projected.getCategoryCode()).isEqualTo("TEST_CATEGORY");
        assertThat(projected.getStudyLevelCode()).isEqualTo("MASTER");
        assertThat(projected.getCourseModeCode()).isEqualTo("ONLINE");
        assertThat(projected.getLanguageCodes()).containsExactly("EN", "ZH");
        assertThat(projected.getIntakeMonths()).containsExactly("2028-02", "2028-09");
        assertThat(projected.getIntakeDisplayTexts()).containsExactly(
                "February 2028", "September 2028", "September 2028, second intake", "Date to be announced");
        assertThat(projected.getDurationMonths()).isEqualTo(24);
        assertThat(projected.getDurationDisplay()).isEqualTo("2 years");
        assertThat(projected.getTuitionTotalRmbMin()).isEqualByComparingTo("120000");
        assertThat(projected.getTuitionTotalRmbMax()).isEqualByComparingTo("150000");
        assertThat(projected.getTuitionDisplay()).isEqualTo("Total RMB 120,000–150,000");
        ProgrammeSearchDocument untranslated = document.getProgrammes().get(1);
        assertThat(untranslated.getNameZh()).isNull();
        assertThat(untranslated.getNameEn()).isEqualTo("Second programme");
        assertThat(untranslated.getLanguageCodes()).containsExactly("EN");
        assertThat(untranslated.getIntakeMonths()).containsExactly("2029-01");
        assertThat(untranslated.getStudyLevelCode()).isNull();
        assertThat(untranslated.getCourseModeCode()).isNull();
        assertThat(untranslated.getDurationMonths()).isNull();
        assertThat(untranslated.getTuitionTotalRmbMin()).isNull();
        assertThat(untranslated.getTuitionTotalRmbMax()).isNull();
        assertThat(statistics.getPrepareStatementCount()).as("university/country + programmes/relations + all intakes").isEqualTo(3);
        assertThat(statistics.getEntityFetchCount()).isZero();
        assertThat(statistics.getCollectionFetchCount()).isZero();
        assertThatThrownBy(() -> document.getProgrammes().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> projected.getLanguageCodes().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> projected.getIntakeMonths().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> projected.getIntakeDisplayTexts().clear()).isInstanceOf(UnsupportedOperationException.class);

        MappingElasticsearchConverter converter = converter();
        Document source = Document.create();
        converter.write(document, source);
        assertThat(source.toJson()).doesNotContain("descriptionZh", "descriptionEn", "Full introduction", "tuitionRmbMin");
        assertThat(converter.read(UniversityProgrammeSearchDocument.class, source))
                .usingRecursiveComparison().withComparatorForType(BigDecimal::compareTo, BigDecimal.class)
                .isEqualTo(document);
    }

    @Test
    void generatesNestedMappingWithExactNamesAndTypedFilterFieldsWithoutElasticsearch() {
        MappingElasticsearchConverter converter = converter();
        Document mapping = Document.parse(new MappingBuilder(converter)
                .buildPropertyMapping(UniversityProgrammeSearchDocument.class));
        Map<?, ?> properties = (Map<?, ?>) mapping.get("properties");
        Map<?, ?> nested = (Map<?, ?>) properties.get("programmes");
        assertThat(nested.get("type")).isEqualTo("nested");
        Map<?, ?> programmeProperties = (Map<?, ?>) nested.get("properties");
        for (String name : new String[]{"nameZh", "nameEn"}) {
            Map<?, ?> nameField = (Map<?, ?>) programmeProperties.get(name);
            assertThat(nameField.get("type")).isEqualTo("text");
            Map<?, ?> exact = (Map<?, ?>) ((Map<?, ?>) nameField.get("fields")).get("keyword");
            assertThat(exact.get("type")).isEqualTo("keyword");
        }
        for (String field : new String[]{"programmeCode", "categoryCode", "studyLevelCode", "courseModeCode", "languageCodes", "intakeMonths"}) {
            assertThat(((Map<?, ?>) programmeProperties.get(field)).get("type")).isEqualTo("keyword");
        }
        assertThat(((Map<?, ?>) properties.get("id")).get("type")).isEqualTo("keyword");
        assertThat(((Map<?, ?>) properties.get("popular")).get("type")).isEqualTo("boolean");
        assertThat(((Map<?, ?>) programmeProperties.get("durationMonths")).get("type")).isEqualTo("integer");
        for (String field : new String[]{"tuitionTotalRmbMin", "tuitionTotalRmbMax"}) {
            Map<?, ?> amount = (Map<?, ?>) programmeProperties.get(field);
            assertThat(amount.get("type")).isEqualTo("scaled_float");
            assertThat(((Number) amount.get("scaling_factor")).intValue()).isEqualTo(100);
        }
    }

    @Test
    void queryCountRemainsThreeForManyProgrammesWithDistinctRelations() {
        long university = university("PUBLISHED", false);
        long category = category();
        long en = language("EN");
        for (int index = 0; index < 12; index++) {
            long programme = programme(university, category, "PROGRAMME_" + index, "PUBLISHED", null, "Programme " + index);
            long level = jdbc.queryForObject("INSERT INTO study_levels (code, name_en) VALUES (?, ?) RETURNING id",
                    Long.class, "LEVEL_" + index, "Level " + index);
            long mode = jdbc.queryForObject("INSERT INTO course_modes (code, name_en) VALUES (?, ?) RETURNING id",
                    Long.class, "MODE_" + index, "Mode " + index);
            jdbc.update("UPDATE programmes SET study_level_id = ?, course_mode_id = ? WHERE id = ?", level, mode, programme);
            jdbc.update("INSERT INTO programme_languages VALUES (?, ?)", programme, en);
            intake(programme, "2028-02-01", "February 2028");
        }
        Statistics statistics = resetStatistics();

        var document = loader.loadPublishedUniversity(university).orElseThrow();

        assertThat(document.getProgrammes()).hasSize(12).allSatisfy(programme -> {
            assertThat(programme.getStudyLevelCode()).startsWith("LEVEL_");
            assertThat(programme.getCourseModeCode()).startsWith("MODE_");
            assertThat(programme.getLanguageCodes()).containsExactly("EN");
            assertThat(programme.getIntakeMonths()).containsExactly("2028-02");
        });
        assertThat(document.getCountryCode()).isNull();
        assertThat(document.getCountryNameZh()).isNull();
        assertThat(document.getCountryNameEn()).isNull();
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(3);
        assertThat(statistics.getEntityFetchCount()).isZero();
        assertThat(statistics.getCollectionFetchCount()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"DRAFT", "ARCHIVED"})
    void excludesUnpublishedUniversityEvenWhenItsProgrammeIsPublished(String status) {
        long university = university(status, false);
        programme(university, category(), "PUBLIC_PROGRAMME", "PUBLISHED", null, "Public programme");
        Statistics statistics = resetStatistics();

        assertThat(loader.loadPublishedUniversity(university)).isEmpty();
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(1);
    }

    @Test
    void excludesUniversityWithNoPublishedProgrammes() {
        long university = university("PUBLISHED", false);
        programme(university, category(), "DRAFT_ONLY", "DRAFT", null, "Draft only");
        Statistics statistics = resetStatistics();

        assertThat(loader.loadPublishedUniversity(university)).isEmpty();
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(2);
    }

    @Test
    void excludesMissingUniversity() {
        assertThat(loader.loadPublishedUniversity(Long.MAX_VALUE)).isEmpty();
    }

    @Test
    void keepsUnknownIntakesLanguagesAndTuitionEmptyEvenWhenLegacyTuitionExists() {
        long university = university("PUBLISHED", false);
        long programme = programme(university, category(), "LEGACY", "PUBLISHED", null, "Legacy programme");
        jdbc.update("""
                UPDATE programmes SET tuition_rmb_min = 10000, tuition_rmb_max = 20000,
                    exchange_rate = 1, exchange_rate_date = '2026-09-17' WHERE id = ?
                """, programme);
        resetStatistics();

        var document = loader.loadPublishedUniversity(university).orElseThrow().getProgrammes().getFirst();

        assertThat(document.getLanguageCodes()).isEmpty();
        assertThat(document.getIntakeMonths()).isEmpty();
        assertThat(document.getIntakeDisplayTexts()).isEmpty();
        assertThat(document.getTuitionTotalRmbMin()).isNull();
        assertThat(document.getTuitionTotalRmbMax()).isNull();
        assertThat(document.getTuitionDisplay()).isNull();
    }

    private Statistics resetStatistics() {
        entityManager.flush();
        entityManager.clear();
        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        return statistics;
    }

    private MappingElasticsearchConverter converter() {
        ElasticsearchCustomConversions conversions = new ElasticsearchCustomConversions(List.of());
        SimpleElasticsearchMappingContext context = new SimpleElasticsearchMappingContext();
        context.setSimpleTypeHolder(conversions.getSimpleTypeHolder());
        MappingElasticsearchConverter converter = new MappingElasticsearchConverter(context);
        converter.setConversions(conversions);
        converter.afterPropertiesSet();
        return converter;
    }

    private long university(String status, boolean withCountry) {
        Long country = withCountry ? jdbc.queryForObject("""
                INSERT INTO countries (code, name_en, continent_code) VALUES ('MY', 'Malaysia', 'ASIA') RETURNING id
                """, Long.class) : null;
        return jdbc.queryForObject("""
                INSERT INTO universities (name, slug, country, university_code, name_en, status, popular, country_id)
                VALUES ('Legacy university name', 'test-university', 'Legacy country', 'TEST_UNIVERSITY',
                    'Test university', ?, true, ?) RETURNING id
                """, Long.class, status, country);
    }

    private long category() {
        return jdbc.queryForObject("""
                INSERT INTO subject_categories (code, name_en, status)
                VALUES ('TEST_CATEGORY', 'Test category', 'PUBLISHED') RETURNING id
                """, Long.class);
    }

    private long programme(long university, long category, String code, String status, String zh, String en) {
        return jdbc.queryForObject("""
                INSERT INTO programmes (university_id, subject_category_id, programme_code, slug, name_zh, name_en, status)
                VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
                """, Long.class, university, category, code, code.toLowerCase(java.util.Locale.ROOT), zh, en, status);
    }

    private long language(String code) {
        return jdbc.queryForObject("INSERT INTO languages (code, name_en, status) VALUES (?, ?, 'PUBLISHED') RETURNING id",
                Long.class, code, code);
    }

    private void intake(long programme, String date, String display) {
        jdbc.update("INSERT INTO programme_intakes (programme_id, intake_date, display_text) VALUES (?, CAST(? AS DATE), ?)",
                programme, date, display);
    }
}
