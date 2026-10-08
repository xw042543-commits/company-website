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

            Flyway v3 = flywayFor(postgres, "3");
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

            flywayFor(postgres, "10").migrate();
            Long accountId = jdbcTemplate.queryForObject("""
                    INSERT INTO user_accounts (
                        full_name, normalized_email, password_hash, status, agreement_version, privacy_version
                    ) VALUES ('Legacy adviser', 'legacy-adviser@example.test', 'hash', 'ACTIVE', 'terms-v1', 'privacy-v1')
                    RETURNING id
                    """, Long.class);
            Long enquiryId = jdbcTemplate.queryForObject("""
                    INSERT INTO consultation_enquiries (
                        reference_code, name, contact, locale, privacy_consent, privacy_notice_version, created_at
                    ) VALUES (gen_random_uuid(), 'Legacy enquiry', 'legacy-contact', 'zh', TRUE, 'privacy-v1',
                              '2026-01-01T10:00:00Z')
                    RETURNING id
                    """, Long.class);

            Flyway latest = Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .load();
            latest.migrate();

            assertThat(latest.info().current().getVersion().getVersion()).isEqualTo("15");
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT role FROM user_accounts WHERE id = ?", String.class, accountId)).isEqualTo("USER");
            assertThat(jdbcTemplate.queryForMap("""
                    SELECT status, version, status_updated_at = created_at AS timestamp_preserved,
                           status_updated_by_user_id IS NULL AS no_updater
                    FROM consultation_enquiries WHERE id = ?
                    """, enquiryId)).containsExactlyInAnyOrderEntriesOf(Map.of(
                    "status", "NEW", "version", 0L, "timestamp_preserved", true, "no_updater", true
            ));
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*) FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'user_external_identities'
                      AND column_name IN ('display_name', 'avatar_url')
                    """, Integer.class)).isEqualTo(2);
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM universities WHERE slug = 'university-of-malaya'
                    """, Integer.class)).isEqualTo(1);
            assertThat(jdbcTemplate.queryForList("""
                    SELECT table_name FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name IN (
                        'user_accounts', 'user_verification_tokens', 'password_reset_tokens',
                        'auth_rate_limit_buckets', 'spring_session', 'spring_session_attributes',
                        'user_external_identities'
                    )
                    """, String.class)).containsExactlyInAnyOrder(
                    "user_accounts", "user_verification_tokens", "password_reset_tokens",
                    "auth_rate_limit_buckets", "spring_session", "spring_session_attributes",
                    "user_external_identities"
            );
        }
    }

    private Flyway flywayFor(PostgreSQLContainer postgres, String targetVersion) {
        return Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .target(MigrationVersion.fromVersion(targetVersion))
                .load();
    }

}
