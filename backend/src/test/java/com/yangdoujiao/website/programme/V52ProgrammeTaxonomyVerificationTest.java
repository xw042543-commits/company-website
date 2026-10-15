package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeSet;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class V52ProgrammeTaxonomyVerificationTest {
    @Test
    void verifiesEveryAuditedCodeAndPreservesColleaguesContentAndBasicInformation() throws IOException {
        JsonNode fixture;
        try (var stream = getClass().getResourceAsStream("/fixtures/v52-taxonomy-audit.json")) {
            if (stream == null) throw new IOException("Missing exhaustive taxonomy fixture");
            fixture = new ObjectMapper().readTree(stream);
        }
        JsonNode rows = fixture.get("records");
        int confirmed = fixture.get("summary").get("verified").asInt();
        int pending = fixture.get("summary").get("needsReview").asInt();
        assertThat(rows.size()).isEqualTo(2233);
        assertThat(confirmed + pending).isEqualTo(2233);

        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("programme_taxonomy_all_test")) {
            postgres.start();
            flyway(postgres, "51").migrate();
            JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));
            long malaysia = country(jdbc, "MY", "Malaysia");
            long uk = country(jdbc, "GB", "United Kingdom");
            Map<String, Long> universities = new HashMap<>();
            TreeSet<String> levels = new TreeSet<>();
            TreeSet<String> categories = new TreeSet<>();
            for (JsonNode row : rows) {
                String slug = row.get("universitySlug").asText();
                if (!universities.containsKey(slug)) universities.put(slug, university(jdbc, malaysia, slug, "Malaysia"));
                levels.add(row.get("studyLevelCode").asText());
                categories.add(row.get("categoryCode").asText());
                levels.add(row.get("current").get("studyLevelCode").asText());
                categories.add(row.get("current").get("categoryCode").asText());
            }
            Map<String, Long> levelIds = new HashMap<>();
            for (String code : levels) levelIds.put(code, jdbc.queryForObject(
                    "INSERT INTO study_levels(code,name_en,status) VALUES (?,?,'PUBLISHED') RETURNING id",
                    Long.class, code, code));
            Map<String, Long> categoryIds = new HashMap<>();
            for (String code : categories) categoryIds.put(code, jdbc.queryForObject(
                    "INSERT INTO subject_categories(code,name_en,status) VALUES (?,?,'PUBLISHED') RETURNING id",
                    Long.class, code, code));

            String archivedCode = null;
            for (JsonNode row : rows) {
                String code = row.get("programmeCode").asText();
                JsonNode previous = row.get("current");
                long id = jdbc.queryForObject("""
                        INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,
                            slug,name_zh,name_en,status,published_at,description_zh,description_en,
                            duration_months,tuition_min,tuition_currency,official_url,source_type,source_reference)
                        VALUES (?,?,?,?,?,?,?,'PUBLISHED',CURRENT_TIMESTAMP,'已审核介绍','Reviewed introduction',
                            36,12345,'MYR','https://example.test/official-fees','third_party','原有基本信息来源') RETURNING id
                        """, Long.class, code, universities.get(row.get("universitySlug").asText()),
                        categoryIds.get(previous.get("categoryCode").asText()),
                        levelIds.get(previous.get("studyLevelCode").asText()), code.toLowerCase(),
                        nullable(previous.get("nameZh")), nullable(previous.get("nameEn")));
                jdbc.update("""
                        INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,status,source_type)
                        VALUES (?,'CURRICULUM','官方课程','已有真实课程，保持不变','PUBLISHED','official')
                        """, id);
                if (archivedCode == null && row.get("verified").asBoolean()) {
                    archivedCode = code;
                    jdbc.update("UPDATE programmes SET status = 'ARCHIVED' WHERE id = ?", id);
                }
            }
            long extraMy = university(jdbc, malaysia, "later-my", "Malaysia");
            long extraUk = university(jdbc, uk, "outside-uk", "United Kingdom");
            long anyCategory = categoryIds.values().iterator().next();
            for (long university : new long[]{extraMy, extraUk}) {
                jdbc.update("""
                        INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_zh,status)
                        VALUES (?,?,?,?,'审核范围外专业','PUBLISHED')
                        """, "OUTSIDE_" + university, university, anyCategory, "outside-" + university);
            }
            flyway(postgres, "52").migrate();

            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes p JOIN universities u ON u.id = p.university_id
                    JOIN countries c ON c.id = u.country_id WHERE c.code = 'MY' AND p.status = 'PUBLISHED'
                    """, Integer.class)).isEqualTo(confirmed);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programmes WHERE status = 'DRAFT'", Integer.class)).isEqualTo(pending);
            assertThat(jdbc.queryForObject("SELECT status FROM programmes WHERE programme_code = ?",
                    String.class, archivedCode)).isEqualTo("ARCHIVED");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programmes WHERE programme_code LIKE 'OUTSIDE_%' AND status = 'PUBLISHED'",
                    Integer.class)).isEqualTo(2);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes WHERE description_zh = '已审核介绍'
                      AND description_en = 'Reviewed introduction' AND duration_months = 36
                      AND tuition_min = 12345 AND tuition_currency = 'MYR'
                      AND official_url = 'https://example.test/official-fees'
                      AND source_type = 'third_party' AND source_reference = '原有基本信息来源'
                    """, Integer.class)).isEqualTo(2233);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections WHERE body_zh = '已有真实课程，保持不变'
                      AND status = 'PUBLISHED' AND source_type = 'official'
                    """, Integer.class)).isEqualTo(2233);
            for (JsonNode row : rows) {
                if (!row.get("verified").asBoolean() || row.get("programmeCode").asText().equals(archivedCode)) continue;
                Map<String, Object> stored = jdbc.queryForMap("""
                        SELECT p.name_zh,p.name_en,s.code AS level,c.code AS category,p.taxonomy_source_type,
                               p.taxonomy_source_url,p.taxonomy_source_checked_at IS NOT NULL AS checked
                        FROM programmes p JOIN study_levels s ON s.id = p.study_level_id
                        JOIN subject_categories c ON c.id = p.subject_category_id WHERE p.programme_code = ?
                        """, row.get("programmeCode").asText());
                assertThat(stored).containsEntry("name_zh", row.get("nameZh").asText())
                        .containsEntry("name_en", row.get("nameEn").asText())
                        .containsEntry("level", row.get("studyLevelCode").asText())
                        .containsEntry("category", row.get("categoryCode").asText())
                        .containsEntry("taxonomy_source_type", "official")
                        .containsEntry("taxonomy_source_url", row.get("sourceUrl").asText())
                        .containsEntry("checked", true);
            }
            assertThat(jdbc.queryForObject("SELECT count(*) FROM search_sync_jobs WHERE status = 'PENDING'", Integer.class)).isEqualTo(20);
        }
    }

    private static String nullable(JsonNode node) { return node == null || node.isNull() ? null : node.asText(); }
    private static long country(JdbcTemplate jdbc, String code, String name) {
        return jdbc.queryForObject("INSERT INTO countries(code,name_en,continent_code) VALUES (?,?,'AS') RETURNING id",
                Long.class, code, name);
    }
    private static long university(JdbcTemplate jdbc, long country, String slug, String name) {
        return jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES (?,?,?,?,'PUBLISHED') RETURNING id",
                Long.class, slug, slug, name, country);
    }
    private static Flyway flyway(PostgreSQLContainer postgres, String target) {
        return Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .target(MigrationVersion.fromVersion(target)).load();
    }
}
