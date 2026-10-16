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

            flywayFor(postgres, "16").migrate();
            Long universityId = jdbcTemplate.queryForObject(
                    "SELECT id FROM universities WHERE slug = 'university-of-malaya'", Long.class);
            Long subjectId = jdbcTemplate.queryForObject("""
                    INSERT INTO subject_categories(code, name_en) VALUES ('LEGACY', 'Legacy subject') RETURNING id
                    """, Long.class);
            Long programmeId = jdbcTemplate.queryForObject("""
                    INSERT INTO programmes(programme_code, university_id, subject_category_id, slug, name_en, official_url)
                    VALUES ('LEGACY', ?, ?, 'legacy-programme', 'Legacy programme', 'https://example.test/programme')
                    RETURNING id
                    """, Long.class, universityId, subjectId);
            jdbcTemplate.update("""
                    INSERT INTO programme_detail_sections(programme_id, section_type, title_en, body_en)
                    VALUES (?, 'ADMISSIONS', 'Legacy admissions', 'Preserved admission requirements')
                    """, programmeId);
            jdbcTemplate.update("""
                    INSERT INTO programme_media(programme_id, kind, asset_url, source_url)
                    VALUES (?, 'COURSE_IMAGE', 'https://example.test/course.jpg', 'https://example.test/programme')
                    """, programmeId);
            jdbcTemplate.update("""
                    INSERT INTO university_media(university_id, kind, asset_url, source_url)
                    VALUES (?, 'LOGO', 'https://example.test/logo.jpg', 'https://example.test')
                    """, universityId);
            jdbcTemplate.update("""
                    INSERT INTO miniapp_programme_favorites(user_account_id, programme_id) VALUES (?, ?)
                    """, accountId, programmeId);
            jdbcTemplate.update("""
                    INSERT INTO miniapp_study_plans(user_account_id, goal, country, education)
                    VALUES (?, 'MASTERS', 'Malaysia', 'Bachelor')
                    """, accountId);
            jdbcTemplate.update("UPDATE consultation_enquiries SET user_account_id = ? WHERE id = ?", accountId, enquiryId);

            flywayFor(postgres, "20").migrate();
            Long legacyPostId = jdbcTemplate.queryForObject("""
                    INSERT INTO community_posts(author_account_id,body,status,published_at)
                    VALUES (?, 'Legacy campus conversation', 'PUBLISHED', NOW()) RETURNING id
                    """, Long.class, accountId);
            Long publishableUniversityId = jdbcTemplate.queryForObject("""
                    INSERT INTO universities(name,slug,country,status)
                    VALUES ('Publishable university', 'publishable-university', 'Malaysia', 'DRAFT')
                    RETURNING id
                    """, Long.class);
            Long publishableProgrammeId = jdbcTemplate.queryForObject("""
                    INSERT INTO programmes(
                        programme_code,university_id,subject_category_id,slug,name_en,official_url,status
                    ) VALUES ('PUBLISHABLE', ?, ?, 'publishable-programme', 'Computer Science',
                              'https://example.test/publishable-programme', 'PUBLISHED')
                    RETURNING id
                    """, Long.class, publishableUniversityId, subjectId);
            jdbcTemplate.update("""
                    INSERT INTO programme_detail_sections(
                        programme_id, section_type, title_en, body_en, sort_order, source_url, status
                    ) VALUES (?, 'CAREER_OPPORTUNITIES', 'Verified careers',
                              'Verified programme-specific career evidence', 30,
                              'https://example.test/official-careers', 'PUBLISHED')
                    """, publishableProgrammeId);

            Flyway latest = Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .load();
            latest.migrate();

            assertThat(latest.info().current().getVersion().getVersion()).isEqualTo("67");
            assertThat(latest.info().applied()).hasSize(67);
            assertThat(java.util.Arrays.stream(latest.info().applied())
                    .map(migration -> migration.getVersion().getVersion()).toList())
                    .containsExactlyElementsOf(java.util.stream.IntStream.rangeClosed(1, 67)
                            .mapToObj(Integer::toString).toList());
            assertThat(jdbcTemplate.queryForList("""
                    SELECT table_name FROM information_schema.tables WHERE table_schema='public'
                      AND table_name IN ('planning_evidence','planning_rule_sets','planning_fees',
                        'planning_sessions','planning_profiles','planning_runs','planning_saved_plans')
                    """,String.class)).containsExactlyInAnyOrder("planning_evidence","planning_rule_sets","planning_fees",
                            "planning_sessions","planning_profiles","planning_runs","planning_saved_plans");
            // Legacy catalogue rows remain unverified; migrations never manufacture admissions proof.
            assertThat(jdbcTemplate.queryForObject("SELECT count(*) FROM planning_evidence",Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT is_nullable FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='planning_sessions' AND column_name='last_activity_at'
                    """,String.class)).isEqualTo("NO");
            assertThat(jdbcTemplate.queryForMap("""
                    SELECT status, published_at IS NOT NULL AS has_published_at
                    FROM universities WHERE id = ?
                    """, publishableUniversityId)).containsExactlyInAnyOrderEntriesOf(Map.of(
                    "status", "PUBLISHED", "has_published_at", true
            ));
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections
                    WHERE programme_id = ? AND status = 'PUBLISHED'
                      AND section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
                    """, Integer.class, publishableProgrammeId)).isEqualTo(2);
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections
                    WHERE programme_id = ? AND status = 'ARCHIVED'
                      AND section_type = 'CURRICULUM' AND source_url IS NULL
                    """, Integer.class, publishableProgrammeId)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT body_en FROM programme_detail_sections
                    WHERE programme_id = ? AND section_type = 'CAREER_OPPORTUNITIES'
                    """, String.class, publishableProgrammeId)).isEqualTo("Verified programme-specific career evidence");
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*) FROM programmes p
                    WHERE p.status = 'PUBLISHED'
                      AND (NULLIF(BTRIM(p.description_zh), '') IS NULL
                           OR NULLIF(BTRIM(p.description_en), '') IS NULL)
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections s
                    WHERE s.section_type IN ('CURRICULUM', 'COURSE_STRUCTURE')
                      AND s.status = 'PUBLISHED'
                      AND NULLIF(BTRIM(s.source_url), '') IS NULL
                      AND (s.source_type <> 'ai_generated'
                           OR s.body_zh NOT LIKE '参考学习领域，非官方课程表%')
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT count(*)
                    FROM programme_detail_sections s
                    JOIN programmes p ON p.id = s.programme_id
                    JOIN universities u ON u.id = p.university_id
                    JOIN countries c ON c.id = u.country_id
                    WHERE c.code = 'MY'
                      AND s.section_type IN ('CURRICULUM', 'COURSE_STRUCTURE')
                      AND s.status = 'PUBLISHED'
                      AND (
                        s.body_en ~* '(^|\\n)(note([ :]|$)|next\\s*:|year\\s*[0-9]+([ :]|$)|semester\\s*[0-9]+([ :]|$)|choose([ :]|$)|students?([ :]|$)|elective courses?([ :0-9(]|$)|speciali[sz]ation elective([ :0-9(]|$)|programme course elective([ :#]|$)|faculty open elective([ :]|$)|kursus elektif([ :]|$)|pilih([ :]|$))'
                        OR s.body_en ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|[0-9]+\\s*%)'
                      )
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT status FROM universities WHERE id = ?
                    """, String.class, universityId)).isEqualTo("DRAFT");
            assertThat(jdbcTemplate.queryForMap("""
                    SELECT body,title,category,university_id FROM community_posts WHERE id = ?
                    """, legacyPostId)).containsEntry("body", "Legacy campus conversation")
                    .containsEntry("title", null).containsEntry("category", "GENERAL").containsEntry("university_id", null);
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT official_url FROM programmes WHERE id = ?", String.class, programmeId))
                    .isEqualTo("https://example.test/programme");
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT body_en FROM programme_detail_sections WHERE programme_id = ?", String.class, programmeId))
                    .isEqualTo("Preserved admission requirements");
            for (String table : java.util.List.of("programme_media", "university_media",
                    "miniapp_programme_favorites", "miniapp_study_plans")) {
                assertThat(jdbcTemplate.queryForObject("SELECT count(*) FROM " + table, Integer.class)).isOne();
            }
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT user_account_id FROM consultation_enquiries WHERE id = ?", Long.class, enquiryId))
                    .isEqualTo(accountId);
            assertThat(jdbcTemplate.queryForList("""
                    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
                      AND table_name LIKE 'community_%'
                    """, String.class)).contains("community_posts", "community_comments", "community_idempotency_records");
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
