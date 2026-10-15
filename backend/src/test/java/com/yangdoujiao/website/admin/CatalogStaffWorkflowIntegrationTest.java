package com.yangdoujiao.website.admin;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import java.io.*;
import java.util.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.catalog.CatalogVisibilityRepository;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class CatalogStaffWorkflowIntegrationTest {
    @Autowired JdbcTemplate jdbc; @Autowired AdminCatalogService catalog; @Autowired AdminImportService imports;
    @Autowired AdminCourseService courses; @Autowired CatalogLifecycleService lifecycle;
    @Autowired CatalogIdentityService identities; @Autowired CatalogVisibilityRepository visibility; @Autowired MockMvc mvc;
    long actor,uni,programme,category,level;String suffix;
    @BeforeEach void setup(){
        suffix=UUID.randomUUID().toString().replace("-","").substring(0,12).toUpperCase(Locale.ROOT);
        jdbc.update("INSERT INTO countries(code,name_zh,name_en,continent_code) VALUES ('MY','马来西亚','Malaysia','ASIA') ON CONFLICT DO NOTHING");
        actor=jdbc.queryForObject("INSERT INTO user_accounts(full_name,normalized_email,password_hash,status,role,agreement_version,privacy_version) VALUES ('一线管理员',?,'hash','ACTIVE','ADMIN','v1','v1') RETURNING id",Long.class,suffix+"@test.example");
        category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_zh,status) VALUES (?,?,'PUBLISHED') RETURNING id",Long.class,"CAT_"+suffix,"测试学科"+suffix);
        level=jdbc.queryForObject("INSERT INTO study_levels(code,name_zh,status) VALUES (?,?,'PUBLISHED') RETURNING id",Long.class,"LEVEL_"+suffix,"测试学历"+suffix);
        uni=catalog.createUniversity(new UniversityInput(null,null,"测试院校"+suffix,"Staff University "+suffix,"MY",null,null,null,null,null,null)).id();
        programme=catalog.createProgramme(new ProgrammeInput(null,uni,null,"计算机科学"+suffix,"Computer Science "+suffix,category,level,null,null,null,null,null,null,null,null,null,null,null,null,null,null)).id();
    }
    @Test void chineseTemplatesHaveExamplesDropdownsAndNoRequiredCodes()throws Exception{
        for(var type:EntityType.values())try(var book=new XSSFWorkbook(new ByteArrayInputStream(imports.template(type)))){
            assertThat((Object)book.getSheet("填写示例（不会导入）").getRow(1)).isNotNull();
            assertThat((java.util.List<?>)book.getSheet("导入数据").getDataValidations()).isNotEmpty();
            assertThat(AdminImportExcel.columns(type).stream().filter(c->c.key().equals(type==EntityType.UNIVERSITY?"universityCode":type==EntityType.PROGRAMME?"programmeCode":"courseCode")).findFirst().orElseThrow().title()).doesNotContain("*");
        }
    }
    @Test void previewGeneratesStableCodesAndResolvesChineseParentsBeforePublishing()throws Exception{
        Map<String,Object> p=new HashMap<>(Map.of("nameZh","新专业"+suffix,"universityCode","测试院校"+suffix,"categoryCode","测试学科"+suffix,"studyLevelCode","测试学历"+suffix));
        var uploaded=imports.upload(EntityType.PROGRAMME,"专业.xlsx",workbook(EntityType.PROGRAMME,List.of(p)),actor);
        assertThat(uploaded.batch().draftRows()).isEqualTo(1);var row=imports.rows(uploaded.batch().id()).getFirst();String code=row.payload().get("programmeCode").toString();assertThat(code).startsWith("P_");
        imports.reprocess(uploaded.batch().id());assertThat(imports.rows(uploaded.batch().id()).getFirst().payload().get("programmeCode")).isEqualTo(code);
        var edited=new HashMap<>(row.payload());edited.put("programmeCode","");assertThat(imports.edit(uploaded.batch().id(),row.id(),edited).payload().get("programmeCode")).isEqualTo(code);
        assertThat(imports.publish(uploaded.batch().id(),List.of(row.id())).publishedCount()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT programme_code FROM programmes WHERE id=?",String.class,imports.rows(uploaded.batch().id()).getFirst().publishedRecordId())).isEqualTo(code);
        var repeat=imports.upload(EntityType.PROGRAMME,"再次.xlsx",workbook(EntityType.PROGRAMME,List.of(p)),actor);assertThat(repeat.batch().draftRows()).isZero();assertThat(imports.rows(repeat.batch().id()).getFirst().payload().get("programmeCode")).isEqualTo(code);
    }
    @Test void courseImportKeepsInternalAndOfficialCodesSeparateAndDetectsDuplicates()throws Exception{
        var data=Map.<String,Object>of("programmeCode",catalog.programme(programme).programmeCode(),"nameZh","程序设计基础","nameEn","Programming Fundamentals","officialCode","Cs101","sourceType","学校官网","sourceUrl","https://example.edu/modules/cs101");
        var batch=imports.upload(EntityType.COURSE,"课程.xlsx",workbook(EntityType.COURSE,List.of(data,data)),actor);
        assertThat(batch.batch().draftRows()).isEqualTo(1);assertThat(batch.batch().exactDuplicateRows()).isEqualTo(1);
        var row=imports.rows(batch.batch().id()).getFirst();imports.publish(batch.batch().id(),List.of(row.id()));
        var course=courses.get(imports.rows(batch.batch().id()).getFirst().publishedRecordId());assertThat(course.courseCode()).startsWith("C_").isNotEqualTo("Cs101");assertThat(course.officialCode()).isEqualTo("Cs101");
        assertThat(jdbc.queryForObject("SELECT course_modules->0->>'courseCode' FROM programme_detail_sections WHERE programme_id=? AND section_type='CURRICULUM'",String.class,programme)).isEqualTo("Cs101");
    }
    @Test void collectorUpdatesKeepInternalCodesAndOfficialEvidence() {
        String module="[{\"nameZh\":\"数据库系统\",\"nameEn\":\"Database Systems\",\"courseCode\":\"DB101\",\"credits\":\"3\",\"evidence\":\"Official module table\",\"sourceUrl\":\"https://example.edu/courses\",\"sourceCheckedAt\":\"2026-10-15T00:00:00Z\"}]";
        jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,body_zh,status,source_type,course_modules,curriculum_review_status) VALUES (?,'CURRICULUM','课程','官方课程','PUBLISHED','official',?::jsonb,'VERIFIED')",programme,module);
        var course=courses.all().stream().filter(c->c.programmeId()==programme).findFirst().orElseThrow();
        jdbc.update("UPDATE programme_detail_sections SET course_modules=?::jsonb WHERE programme_id=?",module,programme);
        assertThat(courses.get(course.id()).courseCode()).isEqualTo(course.courseCode());
        var updated=courses.save(course.id(),new AdminCourseService.CourseInput(course.courseCode(),programme,"数据库系统",course.nameEn(),course.officialCode(),"关系模型与查询",course.sourceUrl(),"official",1));
        assertThat(updated.moduleData()).containsEntry("credits","3").containsEntry("evidence","Official module table");
    }
    @Test void trashAndRestorePreservePreviousStatusHistoryAndVisibility(){
        catalog.setProgrammeStatus(programme,false);
        lifecycle.execute(actor,selection(EntityType.UNIVERSITY,uni,"TRASH","确认"));
        assertThat(visibility.hiddenUniversities()).contains(Long.toString(uni));
        assertThat(visibility.hiddenProgrammes()).contains(Long.toString(programme));
        assertThat(catalog.universities("", "TRASH", "",1,100).items()).anyMatch(u->u.id()==uni);
        assertThat(catalog.universities("", "", "",1,100).items()).noneMatch(u->u.id()==uni);
        assertThatThrownBy(()->catalog.setUniversityStatus(uni,true)).hasMessageContaining("回收站");
        lifecycle.execute(actor,selection(EntityType.UNIVERSITY,uni,"RESTORE","确认"));
        assertThat(catalog.university(uni).status()).isEqualTo("PUBLISHED");assertThat(catalog.programme(programme).status()).isEqualTo("ARCHIVED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_operation_audit WHERE actor_id=?",Long.class,actor)).isEqualTo(2);
    }
    @Test void permanentDeleteRequiresFreshAdvancedPermissionConfirmationAndNoBusinessLinks(){
        lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"TRASH","确认"));
        assertThatThrownBy(()->lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"PURGE","永久删除"))).hasMessageContaining("高级管理员");
        jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES (?,'test owner')",actor);
        assertThatThrownBy(()->lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"PURGE","确认"))).hasMessageContaining("永久删除");
        jdbc.update("INSERT INTO student_applications(id,reference,user_account_id,adviser_id,programme_id) VALUES (?,?,?, ?,?)",UUID.randomUUID(),"STAFF_"+suffix,actor,actor,programme);
        var impact=lifecycle.preview(actor,selection(EntityType.PROGRAMME,programme,"PURGE",null)).getFirst();assertThat(impact.associations().get("用户申请")).isEqualTo(1);assertThat(impact.canPermanentlyDelete()).isFalse();
        assertThatThrownBy(()->lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"PURGE","永久删除"))).hasMessageContaining("关联");
        assertThat(catalog.programme(programme)).isNotNull();
    }
    @Test void unlinkedPurgeRetainsAuditAndRetiresCode(){
        var code=catalog.programme(programme).programmeCode();jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES (?,'test owner')",actor);
        lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"TRASH","确认"));lifecycle.execute(actor,selection(EntityType.PROGRAMME,programme,"PURGE","永久删除"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM programmes WHERE id=?",Long.class,programme)).isZero();assertThat(visibility.hiddenProgrammes()).contains(Long.toString(programme));
        assertThatThrownBy(()->identities.code("PROGRAMME",code)).hasMessageContaining("不能重复使用");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_operation_audit WHERE entity_id=? AND entity_type='PROGRAMME' AND operation='PURGE'",Long.class,programme)).isEqualTo(1);
        lifecycle.execute(actor,selection(EntityType.UNIVERSITY,uni,"TRASH","确认"));
        lifecycle.execute(actor,selection(EntityType.UNIVERSITY,uni,"PURGE","永久删除"));
        assertThat(visibility.hiddenUniversities()).contains(Long.toString(uni));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM universities WHERE id=?",Long.class,uni)).isZero();
    }
    @Test void coursesDisappearAndRestoreWithoutLosingModuleMetadata(){
        var c=courses.save(null,new AdminCourseService.CourseInput(null,programme,"算法设计","Algorithm Design","ALG101","算法分析","https://example.edu/algorithms","official",1));
        lifecycle.execute(actor,selection(EntityType.COURSE,c.id(),"TRASH","确认"));
        assertThat(jdbc.queryForObject("SELECT jsonb_array_length(course_modules) FROM programme_detail_sections WHERE programme_id=? AND section_type='CURRICULUM'",Integer.class,programme)).isZero();
        lifecycle.execute(actor,selection(EntityType.COURSE,c.id(),"RESTORE","确认"));
        assertThat(courses.get(c.id()).courseCode()).isEqualTo(c.courseCode());assertThat(jdbc.queryForObject("SELECT course_modules->0->>'courseCode' FROM programme_detail_sections WHERE programme_id=? AND section_type='CURRICULUM'",String.class,programme)).isEqualTo("ALG101");
        jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES (?,'test owner')",actor);
        lifecycle.execute(actor,selection(EntityType.COURSE,c.id(),"TRASH","确认"));
        lifecycle.execute(actor,selection(EntityType.COURSE,c.id(),"PURGE","永久删除"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_courses WHERE id=?",Long.class,c.id())).isZero();
    }
    @Test void emptyOrWrongCourseAssociationsAndUnverifiedOfficialModulesAreRejected()throws Exception{
        var input=Map.<String,Object>of("nameZh","课程","programmeCode","找不到的专业");var bad=imports.upload(EntityType.COURSE,"错误.xlsx",workbook(EntityType.COURSE,List.of(input)),actor);assertThat(bad.batch().invalidRows()).isEqualTo(1);assertThat(imports.rows(bad.batch().id()).getFirst().errorMessage()).contains("所属专业");
        assertThatThrownBy(()->courses.save(null,new AdminCourseService.CourseInput(null,programme,"未经核实课程","",null,"",null,"official",0))).hasMessageContaining("来源链接");
    }
    @Test void adminAndUserRoutesAndCsrfAreEnforced()throws Exception{
        mvc.perform(get("/api/v1/admin/catalog/courses")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/catalog/courses").with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isOk()).andExpect(jsonPath("$.items").isArray());
        mvc.perform(get("/api/v1/admin/catalog/courses").param("programmeId",Long.toString(programme)).with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(get("/api/v1/admin/catalog/courses").with(user(principal(UserAccountRole.USER)))).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/admin/catalog/lifecycle").with(user(principal(UserAccountRole.ADMIN))).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/catalog/lifecycle/capabilities").with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isOk()).andExpect(jsonPath("$.permanentDelete").value(false));
        jdbc.update("UPDATE user_accounts SET role='USER' WHERE id=?",actor);
        mvc.perform(get("/api/v1/admin/catalog/lifecycle/capabilities").with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isForbidden());
    }
    @Test void concurrentCodeAllocationUsesIndependentUniqueReservations()throws Exception{
        var generated=java.util.concurrent.ConcurrentHashMap.<String>newKeySet();
        try(var pool=java.util.concurrent.Executors.newFixedThreadPool(4)){
            var tasks=new ArrayList<java.util.concurrent.Future<?>>();
            for(int i=0;i<4;i++)tasks.add(pool.submit(()->{for(int n=0;n<25;n++){String code=identities.code("COURSE",null);assertThat(generated.add(code)).isTrue();assertThat(code).matches("C_[A-F0-9]{32}");}}));
            try{for(var task:tasks)task.get(30,java.util.concurrent.TimeUnit.SECONDS);assertThat(generated).hasSize(100);}
            finally{pool.submit(()->{for(String code:generated)jdbc.update("DELETE FROM catalog_code_reservations WHERE entity_type='COURSE' AND code=?",code);}).get(30,java.util.concurrent.TimeUnit.SECONDS);}
        }
    }

    private CatalogLifecycleService.Selection selection(EntityType type,long id,String action,String confirmation){return new CatalogLifecycleService.Selection(type,List.of(id),action,confirmation);}
    private UserPrincipal principal(UserAccountRole role){var account=UserAccount.external("Test","v1","v1");ReflectionTestUtils.setField(account,"id",actor);ReflectionTestUtils.setField(account,"role",role);return UserPrincipal.from(account);}
    private byte[] workbook(EntityType type,List<Map<String,Object>> data)throws Exception{try(var book=new XSSFWorkbook(new ByteArrayInputStream(imports.template(type)))){var sheet=book.getSheet("导入数据");int row=1;for(var p:data){var r=sheet.createRow(row++);int col=0;for(var field:AdminImportExcel.columns(type))r.createCell(col++).setCellValue(Objects.toString(p.get(field.key()),""));}var out=new ByteArrayOutputStream();book.write(out);return out.toByteArray();}}
}
