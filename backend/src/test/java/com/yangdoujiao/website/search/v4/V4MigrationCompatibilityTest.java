package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

class V4MigrationCompatibilityTest {

    @Test
    void upgradesPopulatedV3DatabaseWithoutChangingLegacyProgramme() {
        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("company_website_v4_compatibility_test")) {
            postgres.start();

            Flyway v3 = flywayFor(postgres, "3");
            v3.migrate();

            JdbcTemplate jdbcTemplate = jdbcTemplateFor(postgres);
            Long programmeId = insertV3Programme(jdbcTemplate);

            Flyway v4 = flywayForLatestVersion(postgres);
            v4.migrate();

            assertThat(v4.info().current().getVersion().getVersion()).isEqualTo("4");
            Map<String, Object> storedProgramme = jdbcTemplate.queryForMap("""
                    SELECT programme_code, slug, name_en, tuition_fee_period,
                           tuition_total_rmb_min, tuition_total_rmb_max
                    FROM programmes
                    WHERE id = ?
                    """, programmeId);
            assertThat(storedProgramme)
                    .containsEntry("programme_code", "LEGACY_PROGRAMME")
                    .containsEntry("slug", "legacy-programme")
                    .containsEntry("name_en", "Legacy Programme")
                    .containsEntry("tuition_fee_period", "UNKNOWN")
                    .containsEntry("tuition_total_rmb_min", null)
                    .containsEntry("tuition_total_rmb_max", null);
        }
    }

    private Long insertV3Programme(JdbcTemplate jdbcTemplate) {
        Long universityId = jdbcTemplate.queryForObject("""
                INSERT INTO universities (name, slug, country, university_code)
                VALUES ('Legacy University', 'legacy-university', 'Testland', 'LEGACY_UNIVERSITY')
                RETURNING id
                """, Long.class);
        Long subjectCategoryId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (code, name_en)
                VALUES ('LEGACY_CATEGORY', 'Legacy Category')
                RETURNING id
                """, Long.class);

        return jdbcTemplate.queryForObject("""
                INSERT INTO programmes (
                    programme_code, university_id, subject_category_id,
                    slug, name_en, tuition_min, tuition_max, tuition_currency
                )
                VALUES (
                    'LEGACY_PROGRAMME', ?, ?, 'legacy-programme', 'Legacy Programme',
                    10000.00, 12000.00, 'MYR'
                )
                RETURNING id
                """, Long.class, universityId, subjectCategoryId);
    }

    private JdbcTemplate jdbcTemplateFor(PostgreSQLContainer postgres) {
        return new JdbcTemplate(new DriverManagerDataSource(
                postgres.getJdbcUrl(),
                postgres.getUsername(),
                postgres.getPassword()
        ));
    }

    private Flyway flywayFor(PostgreSQLContainer postgres, String targetVersion) {
        return Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .target(MigrationVersion.fromVersion(targetVersion))
                .load();
    }

    private Flyway flywayForLatestVersion(PostgreSQLContainer postgres) {
        return Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .load();
    }
}
