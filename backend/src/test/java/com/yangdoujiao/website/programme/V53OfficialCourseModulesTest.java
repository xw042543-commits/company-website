package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.HashMap;
import java.util.Map;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class V53OfficialCourseModulesTest {
    @Test
    void backsUpAndVerifiesEveryReviewedProgrammeWithoutChangingOtherData() throws Exception {
        JsonNode audit;
        try (var in = getClass().getResourceAsStream("/fixtures/official-course-modules.json")) {
            audit = new ObjectMapper().readTree(in);
        }
        int total = audit.get("records").size();
        int verified = 0; int modules = 0;
        try (var pg = new AuditDatabase()) {
            pg.start(); migrate(pg, "51");
            var jdbc = new JdbcTemplate(new SingleConnectionDataSource(pg.getJdbcUrl(), pg.getUsername(), pg.getPassword(), true));
            long country = jdbc.queryForObject("INSERT INTO countries(code,name_en,continent_code) VALUES ('MY','Malaysia','AS') RETURNING id", Long.class);
            long subject = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,status) VALUES ('MODULE_AUDIT','Module audit','PUBLISHED') RETURNING id", Long.class);
            Map<String,Long> universities = new HashMap<>();
            for (JsonNode row : audit.get("records")) {
                String slug = row.get("universitySlug").asText();
                if (!universities.containsKey(slug)) universities.put(slug,jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES (?,?,'Malaysia',?,'PUBLISHED') RETURNING id",Long.class,slug,slug,country));
                String code=row.get("programmeCode").asText();
                long id=programme(jdbc,universities.get(slug),subject,code);
                jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,source_type,status) VALUES (?,'CURRICULUM','旧课程',?,'ai_generated','PUBLISHED')",id,"旧课程原文-"+code);
                jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,source_type,source_url,status) VALUES (?,'CAREER_OPPORTUNITIES','职业信息','已有真实职业信息','official','https://example.test/career','PUBLISHED')",id);
                if (row.get("status").asText().equals("VERIFIED")) { verified++; modules+=row.get("modules").size(); }
            }
            long foreignCountry=jdbc.queryForObject("INSERT INTO countries(code,name_en,continent_code) VALUES ('GB','United Kingdom','EU') RETURNING id",Long.class);
            long foreignUniversity=jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES ('Foreign','outside-gb','United Kingdom',?,'PUBLISHED') RETURNING id",Long.class,foreignCountry);
            long foreign=programme(jdbc,foreignUniversity,subject,"OUTSIDE_GB");
            long newProgramme=programme(jdbc,universities.values().iterator().next(),subject,"OUTSIDE_NEW_MY");
            for (long id : new long[]{foreign,newProgramme}) jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_en,body_en,status) VALUES (?,'CURRICULUM','Existing curriculum','Keep this curriculum','PUBLISHED')",id);
            migrate(pg,"53");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups",Integer.class)).isEqualTo(total);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups WHERE section_data->>'body_zh' LIKE '旧课程原文-%' AND section_data->>'status'='PUBLISHED' AND section_data->>'source_type'='ai_generated'",Integer.class)).isEqualTo(total);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE curriculum_review_status='VERIFIED' AND status='PUBLISHED' AND source_type='official' AND body_zh IS NOT NULL",Integer.class)).isEqualTo(verified);
            assertThat(jdbc.queryForObject("SELECT coalesce(sum(jsonb_array_length(course_modules)),0)::int FROM programme_detail_sections WHERE curriculum_review_status='VERIFIED'",Integer.class)).isEqualTo(modules);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE curriculum_review_status='PENDING' AND status='ARCHIVED' AND body_zh LIKE '旧课程原文-%'",Integer.class)).isEqualTo(total-verified);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programmes WHERE name_zh='原专业名称' AND name_en='Original programme' AND tuition_min=12345 AND duration_months=36 AND status='PUBLISHED'",Integer.class)).isEqualTo(total+2);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE section_type='CAREER_OPPORTUNITIES' AND body_zh='已有真实职业信息' AND source_type='official' AND status='PUBLISHED'",Integer.class)).isEqualTo(total);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE body_en='Keep this curriculum' AND status='PUBLISHED' AND curriculum_review_status IS NULL",Integer.class)).isEqualTo(2);
            for(JsonNode row:audit.get("records")) {
                if(!row.get("status").asText().equals("VERIFIED"))continue;
                String stored=jdbc.queryForObject("SELECT s.course_modules::text FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM'",String.class,row.get("programmeCode").asText());
                assertThat(new ObjectMapper().readTree(stored)).isEqualTo(row.get("modules"));
            }
        }
    }
    /** Optional isolated local database; CI continues to use a fresh Testcontainer by default. */
    private static final class AuditDatabase implements AutoCloseable {
        private final String external = System.getenv("MODULE_AUDIT_JDBC_URL");
        private PostgreSQLContainer container;
        void start() {
            if (external == null) { container = new PostgreSQLContainer("postgres:17.11"); container.start(); }
        }
        String getJdbcUrl() { return external == null ? container.getJdbcUrl() : external; }
        String getUsername() { return external == null ? container.getUsername() : "postgres"; }
        String getPassword() { return external == null ? container.getPassword() : ""; }
        public void close() { if (container != null) container.close(); }
    }
    private static long programme(JdbcTemplate jdbc,long university,long subject,String code) {
        return jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_zh,name_en,tuition_min,tuition_currency,duration_months,status) VALUES (?,?,?,?,'原专业名称','Original programme',12345,'MYR',36,'PUBLISHED') RETURNING id",Long.class,code,university,subject,code.toLowerCase());
    }
    private static void migrate(AuditDatabase pg,String target) {
        Flyway.configure().dataSource(pg.getJdbcUrl(),pg.getUsername(),pg.getPassword()).target(MigrationVersion.fromVersion(target)).load().migrate();
    }
}
