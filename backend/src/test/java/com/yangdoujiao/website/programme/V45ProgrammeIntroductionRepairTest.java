package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Statement;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

class V45ProgrammeIntroductionRepairTest {

    @Test
    void repairsEveryPublishedIntroductionAndRecordsProvenance() throws IOException {
        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("programme_introduction_repair_test")) {
            postgres.start();
            flyway(postgres, "44").migrate();
            JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));
            seedAuditedPublishedProgrammes(jdbc);
            flyway(postgres, null).migrate();

            assertThat(jdbc.queryForObject(
                    "SELECT count(*) FROM programmes WHERE status = 'PUBLISHED'", Integer.class))
                    .isEqualTo(2233);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes
                    WHERE status = 'PUBLISHED'
                      AND description_source_type = 'official'
                      AND description_source_url LIKE 'https://%'
                      AND description_source_checked_at IS NOT NULL
                    """, Integer.class)).isEqualTo(101);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes
                    WHERE status = 'PUBLISHED'
                      AND description_source_type = 'ai_generated'
                      AND description_source_url IS NULL
                      AND description_source_checked_at IS NOT NULL
                    """, Integer.class)).isEqualTo(2132);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programmes
                    WHERE status = 'PUBLISHED'
                      AND (
                        NULLIF(BTRIM(description_zh), '') IS NULL
                        OR description_zh LIKE '%帮助学生建立系统的专业知识、分析方法与实践能力%'
                        OR description_zh LIKE '%专业介绍资料正在整理中%'
                        OR description_zh !~ '[一-龥]'
                        OR description_source_type IS NULL
                        OR description_source_checked_at IS NULL
                      )
                    """, Integer.class)).isZero();
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM (
                      SELECT regexp_replace(description_zh, '[[:space:]]+', '', 'g')
                      FROM programmes
                      WHERE status = 'PUBLISHED'
                      GROUP BY regexp_replace(description_zh, '[[:space:]]+', '', 'g')
                      HAVING count(*) > 1
                    ) duplicates
                    """, Integer.class)).isZero();
        }
    }

    private static void seedAuditedPublishedProgrammes(JdbcTemplate jdbc) throws IOException {
        String migration;
        try (var stream = V45ProgrammeIntroductionRepairTest.class.getResourceAsStream(
                "/db/migration/V45__repair_published_programme_introductions.sql")) {
            if (stream == null) throw new IOException("V45 migration resource is missing");
            migration = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        int tableStart = migration.indexOf("CREATE TEMP TABLE programme_introduction_repairs");
        int insertStart = migration.indexOf("INSERT INTO programme_introduction_repairs VALUES");
        int insertEnd = migration.indexOf(";\n\nDO $$", insertStart);
        assertThat(tableStart).isGreaterThanOrEqualTo(0);
        assertThat(insertStart).isGreaterThan(tableStart);
        assertThat(insertEnd).isGreaterThan(insertStart);

        Long countryId = jdbc.queryForObject("""
                INSERT INTO countries(code, name_en, continent_code)
                VALUES ('MY', 'Malaysia', 'AS') RETURNING id
                """, Long.class);
        Long subjectId = jdbc.queryForObject("""
                INSERT INTO subject_categories(code, name_en, status)
                VALUES ('INTRODUCTION_TEST', 'Introduction test', 'PUBLISHED') RETURNING id
                """, Long.class);
        String createTable = migration.substring(tableStart, insertStart)
                .replace("CREATE TEMP TABLE", "CREATE TABLE")
                .replace(" ON COMMIT DROP;", ";");
        String insertRows = migration.substring(insertStart, insertEnd + 1);
        jdbc.execute((ConnectionCallback<Void>) connection -> {
            try (Statement statement = connection.createStatement()) {
                statement.execute(createTable);
                statement.execute(insertRows);
                statement.executeUpdate("""
                        INSERT INTO universities(name, slug, country, country_id, status)
                        SELECT university_slug, university_slug, 'Malaysia', %d, 'PUBLISHED'
                        FROM programme_introduction_repairs
                        GROUP BY university_slug
                        """.formatted(countryId));
                statement.executeUpdate("""
                        INSERT INTO programmes(
                          programme_code, university_id, subject_category_id, slug,
                          name_en, description_zh, status
                        )
                        SELECT repair.programme_code, university.id, %d,
                               LOWER(repair.programme_code), repair.programme_code,
                               repair.previous_description_zh, 'PUBLISHED'
                        FROM programme_introduction_repairs repair
                        JOIN universities university ON university.slug = repair.university_slug
                        """.formatted(subjectId));
                statement.execute("DROP TABLE programme_introduction_repairs");
            }
            return null;
        });
    }

    private static Flyway flyway(PostgreSQLContainer postgres, String target) {
        var configuration = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        if (target != null) configuration.target(MigrationVersion.fromVersion(target));
        return configuration.load();
    }
}
