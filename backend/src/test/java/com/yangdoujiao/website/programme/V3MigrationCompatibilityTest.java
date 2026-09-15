package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

class V3MigrationCompatibilityTest {

    @Test
    void upgradesPopulatedV2DatabaseWithoutChangingLegacyUniversity() {
        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("company_website_v3_test")) {
            postgres.start();

            Flyway v2 = flywayFor(postgres, "2");
            v2.migrate();

            JdbcTemplate jdbcTemplate = new JdbcTemplate(new DriverManagerDataSource(
                    postgres.getJdbcUrl(),
                    postgres.getUsername(),
                    postgres.getPassword()
            ));
            jdbcTemplate.update("""
                    INSERT INTO universities (name, slug, country, popular)
                    VALUES ('University of Malaya', 'university-of-malaya', 'Malaysia', TRUE)
                    """);

            Flyway v3 = flywayForLatestVersion(postgres);
            v3.migrate();

            assertThat(v3.info().current().getVersion().getVersion()).isEqualTo("3");
            assertThat(jdbcTemplate.queryForMap("""
                    SELECT name, slug, country, popular, status
                    FROM universities
                    WHERE slug = 'university-of-malaya'
                    """))
                    .containsExactlyInAnyOrderEntriesOf(Map.of(
                            "name", "University of Malaya",
                            "slug", "university-of-malaya",
                            "country", "Malaysia",
                            "popular", true,
                            "status", "DRAFT"
                    ));
        }
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
