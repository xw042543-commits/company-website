package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

class V39MalaysiaProgrammeTaxonomyAuditTest {

    private static final Pattern VERIFIED_ROW = Pattern.compile(
            "(?m)^    \\('([^']+)', '([^']+)', '((?:[^']|'')*)', '((?:[^']|'')*)', "
                    + "'([^']+)', '([^']+)', '([^']+)', '([^']+)', '(true|false)'\\)[,;]$");

    @Test
    void publishesOnlyBilingualOfficialProgrammesAndHidesUnverifiedMalaysiaRecords() throws IOException {
        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("malaysia_taxonomy_audit_test")) {
            postgres.start();
            flyway(postgres, "38").migrate();
            JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));

            List<VerifiedProgramme> rows = verifiedRows();
            List<String[]> audited = auditedRows();
            assertThat(audited).hasSize(2233);
            assertThat(rows).hasSize(301);
            assertThat(rows.stream().filter(VerifiedProgramme::isNew)).hasSize(42);
            assertThat(rows.stream().filter(row -> !row.isNew())).hasSize(259);

            Long malaysiaId = country(jdbc, "MY", "Malaysia", "AS");
            Long ukId = country(jdbc, "GB", "United Kingdom", "EU");
            Map<String, Long> universityIds = new HashMap<>();
            for (String slug : audited.stream().map(row -> row[0]).collect(java.util.stream.Collectors.toSet())) {
                universityIds.put(slug, university(jdbc, malaysiaId, slug, slug));
            }
            Long unreviewedId = university(jdbc, malaysiaId, "unreviewed-my", "Unreviewed Malaysia University");
            Long ukUniversityId = university(jdbc, ukId, "unreviewed-uk", "Unreviewed UK University");

            Set<String> levels = new HashSet<>();
            Set<String> categories = new HashSet<>();
            rows.forEach(row -> {
                levels.add(row.level());
                categories.add(row.category());
            });
            Map<String, Long> levelIds = new HashMap<>();
            for (String level : levels) {
                levelIds.put(level, jdbc.queryForObject(
                        "INSERT INTO study_levels(code, name_en, status) VALUES (?, ?, 'PUBLISHED') RETURNING id",
                        Long.class, level, level));
            }
            Map<String, Long> categoryIds = new HashMap<>();
            for (String category : categories) {
                categoryIds.put(category, jdbc.queryForObject(
                        "INSERT INTO subject_categories(code, name_en, status) VALUES (?, ?, 'PUBLISHED') RETURNING id",
                        Long.class, category, category));
            }

            for (VerifiedProgramme row : rows) {
                if (!row.isNew()) {
                    jdbc.update("""
                            INSERT INTO programmes(
                                programme_code, university_id, subject_category_id, study_level_id,
                                slug, name_zh, name_en, status, published_at
                            ) VALUES (?, ?, ?, ?, ?, '错误名称', 'CGPA 3.0', 'PUBLISHED', CURRENT_TIMESTAMP)
                            """, row.code(), universityIds.get(row.universitySlug()),
                            categoryIds.get(row.category()), levelIds.get(row.level()),
                            row.code().toLowerCase().replace('_', '-'));
                }
            }
            Long defaultCategory = categoryIds.values().iterator().next();
            Long defaultLevel = levelIds.values().iterator().next();
            Set<String> verifiedCodes = rows.stream().map(VerifiedProgramme::code).collect(java.util.stream.Collectors.toSet());
            for (String[] auditedRow : audited) {
                if (!verifiedCodes.contains(auditedRow[1])) {
                    programme(jdbc, universityIds.get(auditedRow[0]), defaultCategory, defaultLevel,
                            auditedRow[1], "Unverified imported title");
                }
            }
            programme(jdbc, unreviewedId, defaultCategory, defaultLevel, "MY_UNREVIEWED_001", "CGPA 3.0");
            programme(jdbc, ukUniversityId, defaultCategory, defaultLevel, "GB_UNREVIEWED_001", "Unreviewed UK degree");
            jdbc.update("""
                    UPDATE programmes SET description_zh = '已审核的原有介绍',
                        duration_months = 36, tuition_min = 10000, tuition_currency = 'MYR'
                    """);

            flyway(postgres, null).migrate();

            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes programme
                    JOIN universities university ON university.id = programme.university_id
                    JOIN countries country ON country.id = university.country_id
                    WHERE country.code = 'MY' AND programme.status = 'PUBLISHED'
                    """, Integer.class)).isEqualTo(302);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes programme
                    JOIN universities university ON university.id = programme.university_id
                    JOIN countries country ON country.id = university.country_id
                    WHERE country.code = 'MY' AND programme.status = 'PUBLISHED'
                      AND programme.programme_code <> 'MY_UNREVIEWED_001'
                      AND (programme.source_type <> 'official'
                           OR programme.source_url NOT LIKE 'https://%'
                           OR programme.source_checked_at IS NULL
                           OR NULLIF(BTRIM(programme.name_zh), '') IS NULL
                           OR NULLIF(BTRIM(programme.name_en), '') IS NULL)
                    """, Integer.class)).isZero();
            assertThat(jdbc.queryForObject(
                    "SELECT status FROM programmes WHERE programme_code = 'MY_UNREVIEWED_001'",
                    String.class)).isEqualTo("PUBLISHED");
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes programme
                    JOIN universities university ON university.id = programme.university_id
                    JOIN countries country ON country.id = university.country_id
                    WHERE country.code = 'MY' AND programme.status = 'DRAFT'
                    """, Integer.class)).isEqualTo(1974);
            assertThat(jdbc.queryForObject(
                    "SELECT status FROM programmes WHERE programme_code = 'GB_UNREVIEWED_001'",
                    String.class)).isEqualTo("PUBLISHED");
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM search_sync_jobs job
                    JOIN universities university ON university.id = job.university_id
                    JOIN countries country ON country.id = university.country_id
                    WHERE country.code = 'MY' AND job.status = 'PENDING'
                    """, Integer.class)).isEqualTo(21);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes
                    WHERE description_zh = '已审核的原有介绍' AND duration_months = 36
                      AND tuition_min = 10000 AND tuition_currency = 'MYR'
                    """, Integer.class)).isEqualTo(2235);
        }
    }

    private static void programme(JdbcTemplate jdbc, Long universityId, Long categoryId, Long levelId,
                                  String code, String name) {
        jdbc.update("""
                INSERT INTO programmes(
                    programme_code, university_id, subject_category_id, study_level_id,
                    slug, name_en, status, published_at
                ) VALUES (?, ?, ?, ?, LOWER(?), ?, 'PUBLISHED', CURRENT_TIMESTAMP)
                """, code, universityId, categoryId, levelId, code, name);
    }

    private static Long country(JdbcTemplate jdbc, String code, String name, String continent) {
        return jdbc.queryForObject("""
                INSERT INTO countries(code, name_en, continent_code) VALUES (?, ?, ?) RETURNING id
                """, Long.class, code, name, continent);
    }

    private static Long university(JdbcTemplate jdbc, Long countryId, String slug, String name) {
        return jdbc.queryForObject("""
                INSERT INTO universities(name, slug, country, country_id, status)
                VALUES (?, ?, ?, ?, 'PUBLISHED') RETURNING id
                """, Long.class, name, slug, slug.equals("unreviewed-uk") ? "United Kingdom" : "Malaysia", countryId);
    }

    private static List<VerifiedProgramme> verifiedRows() throws IOException {
        String migration;
        try (var stream = V39MalaysiaProgrammeTaxonomyAuditTest.class.getResourceAsStream(
                "/db/migration/V39__audit_malaysia_programme_taxonomy.sql")) {
            if (stream == null) throw new IOException("V39 migration resource is missing");
            migration = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        List<VerifiedProgramme> rows = new ArrayList<>();
        Matcher matcher = VERIFIED_ROW.matcher(migration);
        while (matcher.find()) {
            rows.add(new VerifiedProgramme(matcher.group(1), matcher.group(2), unquote(matcher.group(3)),
                    unquote(matcher.group(4)), matcher.group(5), matcher.group(6),
                    matcher.group(7), Boolean.parseBoolean(matcher.group(9))));
        }
        return rows;
    }

    private static List<String[]> auditedRows() throws IOException {
        try (var stream = V39MalaysiaProgrammeTaxonomyAuditTest.class.getResourceAsStream(
                "/db/migration/V39__audit_malaysia_programme_taxonomy.sql")) {
            if (stream == null) throw new IOException("V39 migration resource is missing");
            String migration = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            Matcher matcher = Pattern.compile("(?m)^    \\('([^']+)', '([^']+)'\\)[,;]$").matcher(migration);
            List<String[]> rows = new ArrayList<>();
            while (matcher.find()) rows.add(new String[]{matcher.group(1), matcher.group(2)});
            return rows;
        }
    }

    private static String unquote(String value) {
        return value.replace("''", "'");
    }

    private static Flyway flyway(PostgreSQLContainer postgres, String target) {
        var configuration = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        if (target != null) configuration.target(MigrationVersion.fromVersion(target));
        return configuration.load();
    }

    private record VerifiedProgramme(
            String universitySlug,
            String code,
            String nameZh,
            String nameEn,
            String level,
            String category,
            String sourceUrl,
            boolean isNew
    ) {}
}
