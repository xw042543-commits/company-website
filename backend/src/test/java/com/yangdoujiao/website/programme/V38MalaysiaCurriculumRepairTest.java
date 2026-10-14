package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

class V38MalaysiaCurriculumRepairTest {

    private static final Pattern REPAIR_ROW = Pattern.compile("(?m)^    \\('(um|taylor)', '([^']+)', '");

    @Test
    void replacesEveryReviewedCurriculumWithValidatedOfficialCourseTitles() throws IOException {
        try (PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("malaysia_curriculum_repair_test")) {
            postgres.start();
            flyway(postgres, "37").migrate();
            JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));

            Long countryId = jdbc.queryForObject("""
                    INSERT INTO countries(code, name_en, continent_code)
                    VALUES ('MY', 'Malaysia', 'AS') RETURNING id
                    """, Long.class);
            Long subjectId = jdbc.queryForObject("""
                    INSERT INTO subject_categories(code, name_en, status)
                    VALUES ('REPAIR_TEST', 'Repair test', 'PUBLISHED') RETURNING id
                    """, Long.class);
            Long umId = university(jdbc, countryId, "um", "University of Malaya");
            Long taylorId = university(jdbc, countryId, "taylor", "Taylor's University");

            List<String[]> repairs = repairRows();
            assertThat(repairs).hasSize(101);
            for (String[] repair : repairs) {
                Long universityId = repair[0].equals("um") ? umId : taylorId;
                Long programmeId = jdbc.queryForObject("""
                        INSERT INTO programmes(
                            programme_code, university_id, subject_category_id, slug,
                            name_en, official_url, status
                        ) VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED') RETURNING id
                        """, Long.class, repair[1], universityId, subjectId,
                        repair[1].toLowerCase().replace('_', '-'), repair[1],
                        "https://example.test/" + repair[1].toLowerCase());
                jdbc.update("""
                        INSERT INTO programme_detail_sections(
                            programme_id, section_type, title_en, body_en,
                            source_url, source_checked_at, status
                        ) VALUES (?, 'CURRICULUM', 'Programme Structure',
                                  E'Year 1\\nMinimum average of 65%',
                                  'https://example.test/incorrect', CURRENT_TIMESTAMP, 'PUBLISHED')
                        """, programmeId);
            }
            Long unreviewedMalaysiaId = university(jdbc, countryId, "unreviewed-my", "Unreviewed Malaysia University");
            Long unreviewedMalaysiaProgramme = programme(jdbc, unreviewedMalaysiaId, subjectId, "MY_UNREVIEWED_001");
            contaminatedCurriculum(jdbc, unreviewedMalaysiaProgramme);
            Long ukCountryId = jdbc.queryForObject("""
                    INSERT INTO countries(code, name_en, continent_code)
                    VALUES ('GB', 'United Kingdom', 'EU') RETURNING id
                    """, Long.class);
            Long ukUniversityId = university(jdbc, ukCountryId, "unreviewed-uk", "Unreviewed UK University");
            jdbc.update("UPDATE universities SET country = 'United Kingdom' WHERE id = ?", ukUniversityId);
            Long ukProgramme = programme(jdbc, ukUniversityId, subjectId, "GB_UNREVIEWED_001");
            contaminatedCurriculum(jdbc, ukProgramme);

            flyway(postgres, "38").migrate();

            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections section
                    JOIN programmes programme ON programme.id = section.programme_id
                    JOIN universities university ON university.id = programme.university_id
                    WHERE university.slug IN ('um', 'taylor')
                    """, Integer.class)).isEqualTo(101);
            assertThat(jdbc.queryForObject("""
                    SELECT sum(array_length(regexp_split_to_array(section.body_en, E'\\n'), 1))
                    FROM programme_detail_sections section
                    JOIN programmes programme ON programme.id = section.programme_id
                    JOIN universities university ON university.id = programme.university_id
                    WHERE university.slug IN ('um', 'taylor')
                    """, Integer.class)).isEqualTo(5156);
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM programme_detail_sections section
                    JOIN programmes programme ON programme.id = section.programme_id
                    JOIN universities university ON university.id = programme.university_id
                    WHERE university.slug IN ('um', 'taylor')
                      AND (
                       section.status <> 'PUBLISHED'
                       OR section.source_url NOT LIKE 'https://%'
                       OR section.body_en ~* '(^|\\n)(note|next\\s*:|year\\s*[0-9]+|choose|students?|elective courses?|speciali[sz]ation elective|programme course elective|faculty open elective|kursus elektif|pilih)'
                       OR section.body_en ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|[0-9]+\\s*%)'
                      )
                    """, Integer.class)).isZero();
            assertThat(jdbc.queryForObject("""
                    SELECT status FROM programme_detail_sections WHERE programme_id = ?
                    """, String.class, unreviewedMalaysiaProgramme)).isEqualTo("ARCHIVED");
            assertThat(jdbc.queryForObject("""
                    SELECT status FROM programme_detail_sections WHERE programme_id = ?
                    """, String.class, ukProgramme)).isEqualTo("PUBLISHED");
        }
    }

    private static Long programme(JdbcTemplate jdbc, Long universityId, Long subjectId, String code) {
        return jdbc.queryForObject("""
                INSERT INTO programmes(programme_code, university_id, subject_category_id, slug, name_en, status)
                VALUES (?, ?, ?, LOWER(?), ?, 'PUBLISHED') RETURNING id
                """, Long.class, code, universityId, subjectId, code, code);
    }

    private static void contaminatedCurriculum(JdbcTemplate jdbc, Long programmeId) {
        jdbc.update("""
                INSERT INTO programme_detail_sections(programme_id, section_type, title_en, body_en, status)
                VALUES (?, 'CURRICULUM', 'Programme Structure', E'Year 1\\nMinimum average of 65%', 'PUBLISHED')
                """, programmeId);
    }

    private static Long university(JdbcTemplate jdbc, Long countryId, String slug, String name) {
        return jdbc.queryForObject("""
                INSERT INTO universities(name, slug, country, country_id, status)
                VALUES (?, ?, 'Malaysia', ?, 'PUBLISHED') RETURNING id
                """, Long.class, name, slug, countryId);
    }

    private static List<String[]> repairRows() throws IOException {
        String migration;
        try (var stream = V38MalaysiaCurriculumRepairTest.class.getResourceAsStream(
                "/db/migration/V38__repair_malaysia_official_curricula.sql")) {
            if (stream == null) throw new IOException("V38 migration resource is missing");
            migration = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        List<String[]> rows = new ArrayList<>();
        Matcher matcher = REPAIR_ROW.matcher(migration);
        while (matcher.find()) rows.add(new String[]{matcher.group(1), matcher.group(2)});
        return rows;
    }

    private static Flyway flyway(PostgreSQLContainer postgres, String target) {
        var configuration = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        if (target != null) configuration.target(MigrationVersion.fromVersion(target));
        return configuration.load();
    }
}
