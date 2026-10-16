package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

class V64OfficialCourseModulesTest {
    @Test
    void backsUpAndVerifiesEveryReviewedProgrammeWithoutChangingOtherData() throws Exception {
        JsonNode audit;
        try (var in = getClass().getResourceAsStream("/fixtures/official-course-modules-v64.json")) {
            audit = new ObjectMapper().readTree(in);
        }
        int total = audit.get("records").size();
        int verified = 0; int modules = 0;
        try (var pg = new AuditDatabase()) {
            pg.start(); migrate(pg, "52");
            var jdbc = new JdbcTemplate(new SingleConnectionDataSource(pg.getJdbcUrl(), pg.getUsername(), pg.getPassword(), true));
            long country = jdbc.queryForObject("INSERT INTO countries(code,name_en,continent_code) VALUES ('MY','Malaysia','AS') RETURNING id", Long.class);
            long subject = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,status) VALUES ('MODULE_AUDIT','Module audit','PUBLISHED') RETURNING id", Long.class);
            Map<String,Long> universities = new HashMap<>();
            Map<String,Long> levels = new HashMap<>();
            for (JsonNode row : audit.get("records")) {
                String slug = row.get("universitySlug").asText();
                if (!universities.containsKey(slug)) universities.put(slug,jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES (?,?,'Malaysia',?,'PUBLISHED') RETURNING id",Long.class,slug,slug,country));
                String code=row.get("programmeCode").asText();
                long id=programme(jdbc,universities.get(slug),subject,code);
                if(row.get("status").asText().equals("VERIFIED")) {
                    var owner=row.get("ownership");String level=owner.get("studyLevelCode").asText();
                    if(!levels.containsKey(level))levels.put(level,jdbc.queryForObject("INSERT INTO study_levels(code,name_en,status) VALUES (?,?,'PUBLISHED') RETURNING id",Long.class,level,level));
                    jdbc.update("UPDATE programmes SET name_zh=?,name_en=?,study_level_id=? WHERE id=?",owner.get("programmeNameZh").asText(),owner.get("programmeNameEn").isNull()?null:owner.get("programmeNameEn").asText(),levels.get(level),id);
                }
                jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,source_type,status) VALUES (?,'CURRICULUM','旧课程',?,'ai_generated','PUBLISHED')",id,"旧课程原文-"+code);
                jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,source_type,source_url,status) VALUES (?,'CAREER_OPPORTUNITIES','职业信息','已有真实职业信息','official','https://example.test/career','PUBLISHED')",id);
                if (row.get("status").asText().equals("VERIFIED")) { verified++; modules+=row.get("modules").size(); }
            }
            long foreignCountry=jdbc.queryForObject("INSERT INTO countries(code,name_en,continent_code) VALUES ('GB','United Kingdom','EU') RETURNING id",Long.class);
            long foreignUniversity=jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status) VALUES ('Foreign','outside-gb','United Kingdom',?,'PUBLISHED') RETURNING id",Long.class,foreignCountry);
            long foreign=programme(jdbc,foreignUniversity,subject,"OUTSIDE_GB");
            long newProgramme=programme(jdbc,universities.values().iterator().next(),subject,"OUTSIDE_NEW_MY");
            for (long id : new long[]{foreign,newProgramme}) jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_en,body_en,status) VALUES (?,'CURRICULUM','Existing curriculum','Keep this curriculum','PUBLISHED')",id);
            migrate(pg,"63");
            var previousCourseIdentifiers=jdbc.queryForList("SELECT id,course_code,programme_id FROM catalog_courses ORDER BY id");
            long previousMaximumCourseId=jdbc.queryForObject("SELECT COALESCE(MAX(id),0) FROM catalog_courses",Long.class);
            JsonNode identityRow=null;
            for(JsonNode row:audit.get("records"))if(row.get("status").asText().equals("VERIFIED")){identityRow=row;break;}
            String identityCode=identityRow.get("programmeCode").asText();
            jdbc.update("UPDATE programmes SET name_en='Changed programme after verification' WHERE programme_code=?",identityCode);
            assertThatThrownBy(()->migrate(pg,"64")).hasStackTraceContaining("Programme name or study level changed since source verification");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups",Integer.class)).isEqualTo(total);
            jdbc.update("UPDATE programmes SET name_en=? WHERE programme_code=?",identityRow.get("ownership").get("programmeNameEn").isNull()?null:identityRow.get("ownership").get("programmeNameEn").asText(),identityCode);
            String previousModules=jdbc.queryForObject("SELECT s.course_modules::text FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM'",String.class,identityCode);
            jdbc.update("UPDATE programme_detail_sections s SET course_modules=jsonb_set(s.course_modules,'{0,nameZh}','\"New translation saved after collection\"'::jsonb) FROM programmes p WHERE p.id=s.programme_id AND p.programme_code=? AND s.section_type='CURRICULUM'",identityCode);
            assertThatThrownBy(()->migrate(pg,"64")).hasStackTraceContaining("Course data changed since collection snapshot");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups",Integer.class)).isEqualTo(total);
            jdbc.update("UPDATE programme_detail_sections s SET course_modules=?::jsonb FROM programmes p WHERE p.id=s.programme_id AND p.programme_code=? AND s.section_type='CURRICULUM'",previousModules,identityCode);
            String previousBody=jdbc.queryForObject("SELECT s.body_zh FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM'",String.class,identityCode);
            jdbc.update("UPDATE programme_detail_sections s SET body_zh=COALESCE(s.body_zh,'')||E'\\n【后台维护课程】\\nStaff reference' FROM programmes p WHERE p.id=s.programme_id AND p.programme_code=? AND s.section_type='CURRICULUM'",identityCode);
            assertThatThrownBy(()->migrate(pg,"64")).hasStackTraceContaining("Staff-managed course content requires reconciliation");
            jdbc.update("UPDATE programme_detail_sections s SET body_zh=? FROM programmes p WHERE p.id=s.programme_id AND p.programme_code=? AND s.section_type='CURRICULUM'",previousBody,identityCode);
            migrate(pg,"64");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups",Integer.class)).isEqualTo(total*2);
            assertThat(jdbc.queryForList("SELECT id,course_code,programme_id FROM catalog_courses WHERE id<=? ORDER BY id",previousMaximumCourseId)).isEqualTo(previousCourseIdentifiers);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups WHERE backup_batch='official-modules-20261015' AND section_data->>'body_zh' LIKE '旧课程原文-%' AND section_data->>'status'='PUBLISHED' AND section_data->>'source_type'='ai_generated'",Integer.class)).isEqualTo(total);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE curriculum_review_status='VERIFIED' AND status='PUBLISHED' AND source_type='official' AND body_zh IS NOT NULL",Integer.class)).isEqualTo(verified);
            assertThat(jdbc.queryForObject("SELECT coalesce(sum(jsonb_array_length(course_modules)),0)::int FROM programme_detail_sections WHERE curriculum_review_status='VERIFIED'",Integer.class)).isEqualTo(modules);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE curriculum_review_status='PENDING' AND status='ARCHIVED' AND body_zh LIKE '旧课程原文-%'",Integer.class)).isEqualTo(total-verified);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programmes WHERE tuition_min=12345 AND duration_months=36 AND status='PUBLISHED'",Integer.class)).isEqualTo(total+2);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE section_type='CAREER_OPPORTUNITIES' AND body_zh='已有真实职业信息' AND source_type='official' AND status='PUBLISHED'",Integer.class)).isEqualTo(total);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE body_en='Keep this curriculum' AND status='PUBLISHED' AND curriculum_review_status IS NULL",Integer.class)).isEqualTo(2);
            for(JsonNode row:audit.get("records")) {
                if(!row.get("status").asText().equals("VERIFIED"))continue;
                String stored=jdbc.queryForObject("SELECT s.course_modules::text FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM'",String.class,row.get("programmeCode").asText());
                assertThat(new ObjectMapper().readTree(stored)).isEqualTo(row.get("modules"));
                var names=jdbc.queryForMap("SELECT name_zh,name_en FROM programmes WHERE programme_code=?",row.get("programmeCode").asText());
                assertThat(names.get("name_zh")).isEqualTo(row.get("ownership").get("programmeNameZh").asText());
                assertThat(names.get("name_en")).isEqualTo(row.get("ownership").get("programmeNameEn").isNull()?null:row.get("ownership").get("programmeNameEn").asText());
            }

            var verification = new java.util.LinkedHashMap<String,Object>();
            verification.put("environment","isolated_local_postgresql");
            verification.put("productionWrites",0);
            verification.put("verifiedAt",java.time.OffsetDateTime.now().toString());
            verification.put("reviewedProgrammes",total);
            verification.put("backupSnapshots",total*2);
            verification.put("previousCatalogCourseIdentifiersPreserved",previousCourseIdentifiers.size());
            verification.put("changedIdentityImportRejected",true);
            verification.put("changedCourseContentImportRejected",true);
            verification.put("staffManagedContentImportRejected",true);
            verification.put("verifiedProgrammeSections",verified);
            verification.put("archivedProgrammeSections",total-verified);
            verification.put("officialModuleAssociations",modules);
            verification.put("fullJsonReadBackVerifiedProgrammes",verified);
            verification.put("modulesWithoutChinese",jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections s CROSS JOIN LATERAL jsonb_array_elements(s.course_modules) m WHERE s.curriculum_review_status='VERIFIED' AND NOT (m->>'nameZh' ~ '[一-鿿]')",Integer.class));
            verification.put("modulesWithoutOriginalEvidence",jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections s CROSS JOIN LATERAL jsonb_array_elements(s.course_modules) m WHERE s.curriculum_review_status='VERIFIED' AND position(m->>'nameEn' in m->>'evidence')=0",Integer.class));
            verification.put("untouchedOtherProgrammeFields",total+2);
            verification.put("untouchedCareerSections",total);
            verification.put("untouchedUnreviewedSections",2);

            // Legacy text cannot replace official modules; programme identity changes retire old associations.
            var firstCodes = new java.util.ArrayList<String>();
            for (JsonNode row : audit.get("records")) if (row.get("status").asText().equals("VERIFIED")) firstCodes.add(row.get("programmeCode").asText());
            jdbc.update("UPDATE programme_detail_sections s SET body_zh='Edited curriculum text' FROM programmes p WHERE p.id=s.programme_id AND p.programme_code=? AND s.section_type='CURRICULUM'",firstCodes.get(0));
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections WHERE body_zh='Edited curriculum text' AND status='PUBLISHED' AND curriculum_review_status='VERIFIED' AND jsonb_array_length(course_modules)>0",Integer.class)).isEqualTo(1);
            jdbc.update("UPDATE programmes SET campus='Different campus' WHERE programme_code=?",firstCodes.get(1));
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM' AND s.status='ARCHIVED' AND s.curriculum_review_status='PENDING'",Integer.class,firstCodes.get(1))).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_curriculum_backups",Integer.class)).isEqualTo(total*2+1);
            jdbc.update("UPDATE programmes SET tuition_min=54321 WHERE programme_code=?",firstCodes.get(2));
            assertThat(jdbc.queryForObject("SELECT count(*) FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id WHERE p.programme_code=? AND s.section_type='CURRICULUM' AND s.status='PUBLISHED' AND s.curriculum_review_status='VERIFIED'",Integer.class,firstCodes.get(2))).isEqualTo(1);
            verification.put("guardRegressionChecks",Map.of("legacyTextEditDoesNotReplaceOfficialModules",true,"campusChange",true,"tuitionEditRetainsCourses",true));
            String reportFile=System.getenv("MODULE_AUDIT_REPORT_PATH");
            if(reportFile!=null)java.nio.file.Files.writeString(java.nio.file.Path.of(reportFile),new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(verification)+"\n",java.nio.charset.StandardCharsets.UTF_8);
        }
    }
    /** Optional isolated local database; CI continues to use a fresh Testcontainer by default. */
    private static final class AuditDatabase implements AutoCloseable {
        private final String external = System.getenv("MODULE_AUDIT_JDBC_URL");
        private PostgreSQLContainer container;
        void start() {
            if (external != null && !external.matches("jdbc:postgresql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/course_module_[a-z0-9_]+")) throw new IllegalArgumentException("Only an explicitly isolated local course_module_ database is allowed");
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
