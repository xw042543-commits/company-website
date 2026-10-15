package com.yangdoujiao.website.admin;
import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockMultipartFile;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class AdminImportIntegrationTest {
    @Autowired AdminImportService service; @Autowired AdminImportRepository repository; @Autowired JdbcTemplate jdbc; @Autowired MockMvc mvc;
    long actor;String prefix;Set<String> addedCountries=new HashSet<>();
    @BeforeEach void setup(){for(String country:List.of("MY","SG")){if(jdbc.queryForObject("SELECT COUNT(*) FROM countries WHERE code=?",Long.class,country)==0){jdbc.update("INSERT INTO countries(code,name_zh,name_en,continent_code) VALUES (?,?,?, 'ASIA')",country,country,country);addedCountries.add(country);}}prefix="IM"+UUID.randomUUID().toString().replace("-","").substring(0,12).toUpperCase();actor=jdbc.queryForObject("INSERT INTO user_accounts(full_name,normalized_email,password_hash,status,role,agreement_version,privacy_version) VALUES ('导入管理员',?,'hash','ACTIVE','ADMIN','v1','v1') RETURNING id",Long.class,prefix.toLowerCase()+"@example.test");jdbc.update("INSERT INTO subject_categories(code,name_zh,status) VALUES (?, '导入测试分类','PUBLISHED')",prefix+"CAT");jdbc.update("INSERT INTO study_levels(code,name_zh,status) VALUES (?, '本科','PUBLISHED')",prefix+"LEVEL");}
    @AfterEach void cleanup(){
        jdbc.update("DELETE FROM catalog_import_batches WHERE uploaded_by_user_id=?",actor);
        jdbc.update("DELETE FROM catalog_entity_aliases WHERE entity_type='PROGRAMME' AND entity_id IN (SELECT id FROM programmes WHERE programme_code LIKE ?)",prefix+"%");
        jdbc.update("DELETE FROM catalog_entity_aliases WHERE entity_type='UNIVERSITY' AND entity_id IN (SELECT id FROM universities WHERE university_code LIKE ?)",prefix+"%");
        jdbc.update("DELETE FROM search_sync_jobs WHERE university_id IN (SELECT id FROM universities WHERE university_code LIKE ?)",prefix+"%");
        jdbc.update("DELETE FROM programmes WHERE programme_code LIKE ?",prefix+"%");jdbc.update("DELETE FROM universities WHERE university_code LIKE ?",prefix+"%");
        jdbc.update("DELETE FROM subject_categories WHERE code=?",prefix+"CAT");jdbc.update("DELETE FROM study_levels WHERE code=?",prefix+"LEVEL");jdbc.update("DELETE FROM user_accounts WHERE id=?",actor);
        for(String country:addedCountries)jdbc.update("DELETE FROM countries WHERE code=?",country);
    }
    @Test void uploadIsIsolatedUntilPublishAndRetryIsIdempotent()throws Exception{
        var upload=service.upload(EntityType.UNIVERSITY,"院校.xlsx",workbook(EntityType.UNIVERSITY,List.of(university(prefix))),actor);var rows=service.rows(upload.batch().id());
        assertThat(upload.batch().draftRows()).isEqualTo(1);assertThat(countUniversities(prefix)).isZero();
        var result=service.publish(upload.batch().id(),List.of(rows.getFirst().id()));assertThat(result.publishedCount()).isEqualTo(1);assertThat(countUniversities(prefix)).isEqualTo(1);
        assertThat(service.publish(upload.batch().id(),List.of(rows.getFirst().id())).publishedCount()).isZero();assertThat(countUniversities(prefix)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM search_sync_jobs WHERE university_id=?",Long.class,service.rows(upload.batch().id()).getFirst().publishedRecordId())).isGreaterThan(0);
    }
    @Test void internalDuplicatesConflictsErrorsAndEditsAreSeparated()throws Exception{
        var first=university(prefix);var duplicate=new HashMap<>(first);duplicate.put("nameEn","  "+first.get("nameEn").toString().toUpperCase()+"  ");var conflict=new HashMap<>(first);conflict.put("countryCode","SG");var bad=university(prefix+"B");bad.put("countryCode","ZZ");
        var upload=service.upload(EntityType.UNIVERSITY,"院校.xlsx",workbook(EntityType.UNIVERSITY,List.of(first,duplicate,conflict,bad)),actor);
        assertThat(upload.batch().draftRows()).isEqualTo(1);assertThat(upload.batch().exactDuplicateRows()).isEqualTo(1);assertThat(upload.batch().conflictRows()).isEqualTo(1);assertThat(upload.batch().invalidRows()).isEqualTo(1);
        var rows=service.rows(upload.batch().id());var fixed=university(prefix+"C");assertThat(service.edit(upload.batch().id(),rows.getLast().id(),fixed).draftStatus()).isEqualTo("DRAFT");
        service.remove(upload.batch().id(),List.of(rows.getFirst().id()));assertThat(service.rows(upload.batch().id()).getFirst().draftStatus()).isEqualTo("REMOVED");assertThat(countUniversities(prefix)).isZero();
    }
    @Test void rechecksPublicationAndPreservesWholeSelectionWhenNewDuplicateAppears()throws Exception{
        var data=university(prefix);var first=service.upload(EntityType.UNIVERSITY,"A.xlsx",workbook(EntityType.UNIVERSITY,List.of(data,university(prefix+"B"))),actor);
        var second=service.upload(EntityType.UNIVERSITY,"B.xlsx",workbook(EntityType.UNIVERSITY,List.of(data)),actor);service.publish(second.batch().id(),List.of(service.rows(second.batch().id()).getFirst().id()));
        var result=service.publish(first.batch().id(),service.rows(first.batch().id()).stream().map(ImportRow::id).toList());assertThat(result.publishedCount()).isZero();assertThat(countUniversities(prefix+"B")).isZero();assertThat(service.rows(first.batch().id()).getFirst().classification()).isEqualTo(Classification.EXACT_DUPLICATE);
    }
    @Test void databaseErrorRollsBackEverySelectedRow()throws Exception{
        var upload=service.upload(EntityType.UNIVERSITY,"事务.xlsx",workbook(EntityType.UNIVERSITY,List.of(university(prefix),university(prefix+"B"))),actor);
        String function="reject_import_"+prefix.toLowerCase();
        jdbc.execute("CREATE FUNCTION "+function+"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.university_code='"+prefix+"B' THEN RAISE EXCEPTION 'test rollback'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER "+function+" BEFORE INSERT ON universities FOR EACH ROW EXECUTE FUNCTION "+function+"()");
        try{var ids=service.rows(upload.batch().id()).stream().map(ImportRow::id).toList();mvc.perform(post("/api/v1/admin/imports/"+upload.batch().id()+"/publish").with(user(principal(UserAccountRole.ADMIN))).with(csrf()).contentType("application/json").content("{\"rowIds\":"+ids+"}")).andExpect(status().isConflict());assertThat(service.batch(upload.batch().id()).failedRows()).isEqualTo(2);assertThat(service.batch(upload.batch().id()).failureReason()).contains("回滚");assertThat(countUniversities(prefix)).isZero();assertThat(countUniversities(prefix+"B")).isZero();assertThat(service.rows(upload.batch().id())).allMatch(r->r.draftStatus().equals("DRAFT"));}
        finally{jdbc.execute("DROP TRIGGER "+function+" ON universities");jdbc.execute("DROP FUNCTION "+function+"()");}
    }
    @Test void formulaErrorSurvivesReprocessingUntilExplicitEdit()throws Exception{
        byte[] file;
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(workbook(EntityType.UNIVERSITY,List.of(university(prefix)))))){book.getSheetAt(0).getRow(1).getCell(2).setCellFormula("1+1");var out=new ByteArrayOutputStream();book.write(out);file=out.toByteArray();}
        var upload=service.upload(EntityType.UNIVERSITY,"公式.xlsx",file,actor);assertThat(upload.batch().invalidRows()).isEqualTo(1);
        service.reprocess(upload.batch().id());assertThat(service.rows(upload.batch().id()).getFirst().classification()).isEqualTo(Classification.INVALID);
        assertThat(service.edit(upload.batch().id(),service.rows(upload.batch().id()).getFirst().id(),university(prefix)).draftStatus()).isEqualTo("DRAFT");
    }
    @Test void concurrentPublicationsInsertOnlyOneUniversity()throws Exception{
        byte[] bytes=workbook(EntityType.UNIVERSITY,List.of(university(prefix)));var one=service.upload(EntityType.UNIVERSITY,"A.xlsx",bytes,actor);var two=service.upload(EntityType.UNIVERSITY,"B.xlsx",bytes,actor);
        try(var executor=Executors.newFixedThreadPool(2)){var start=new CountDownLatch(1);var futures=new ArrayList<Future<Integer>>();for(var batch:List.of(one.batch(),two.batch()))futures.add(executor.submit(()->{start.await();return service.publish(batch.id(),service.rows(batch.id()).stream().map(ImportRow::id).toList()).publishedCount();}));start.countDown();assertThat(futures.get(0).get(30,TimeUnit.SECONDS)+futures.get(1).get(30,TimeUnit.SECONDS)).isEqualTo(1);}assertThat(countUniversities(prefix)).isEqualTo(1);
    }
    @Test void programmesResolveRelationsAndKeepCampusAndAliases()throws Exception{
        var u=service.upload(EntityType.UNIVERSITY,"U.xlsx",workbook(EntityType.UNIVERSITY,List.of(university(prefix))),actor);service.publish(u.batch().id(),List.of(service.rows(u.batch().id()).getFirst().id()));
        String category=prefix+"CAT";String level=prefix+"LEVEL";
        var p=new HashMap<String,Object>(Map.of("programmeCode",prefix+"P","universityCode",prefix,"slug",prefix.toLowerCase()+"-p","nameZh","计算机科学"+prefix,"categoryCode",category,"studyLevelCode",level,"campus","吉隆坡","aliases","计算机别名"+prefix));
        var uploaded=service.upload(EntityType.PROGRAMME,"P.xlsx",workbook(EntityType.PROGRAMME,List.of(p)),actor);assertThat(uploaded.batch().draftRows()).isEqualTo(1);service.publish(uploaded.batch().id(),List.of(service.rows(uploaded.batch().id()).getFirst().id()));
        assertThat(jdbc.queryForObject("SELECT campus FROM programmes WHERE programme_code=?",String.class,prefix+"P")).isEqualTo("吉隆坡");
        var alias=new HashMap<>(p);alias.put("programmeCode",prefix+"Q");alias.put("slug",prefix.toLowerCase()+"-q");alias.put("nameZh","计算机别名"+prefix);alias.put("aliases","");assertThat(service.upload(EntityType.PROGRAMME,"alias.xlsx",workbook(EntityType.PROGRAMME,List.of(alias)),actor).batch().draftRows()).isZero();
        var other=new HashMap<>(p);other.put("programmeCode",prefix+"R");other.put("slug",prefix.toLowerCase()+"-r");other.put("campus","槟城");assertThat(service.upload(EntityType.PROGRAMME,"campus.xlsx",workbook(EntityType.PROGRAMME,List.of(other)),actor).batch().draftRows()).isEqualTo(1);
    }
    @Test void adminAuthorizationCsrfAndMalformedFilesAreEnforced()throws Exception{
        mvc.perform(get("/api/v1/admin/imports")).andExpect(status().isUnauthorized());mvc.perform(get("/api/v1/admin/imports").with(user(principal(UserAccountRole.USER)))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/imports/templates/UNIVERSITY").with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isOk()).andExpect(header().string("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        var file=new MockMultipartFile("file","invalid.xlsx","application/octet-stream",new byte[]{1,2,3});mvc.perform(multipart("/api/v1/admin/imports").file(file).param("type","UNIVERSITY").with(user(principal(UserAccountRole.ADMIN)))).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/v1/admin/imports").file(file).param("type","UNIVERSITY").with(user(principal(UserAccountRole.USER))).with(csrf())).andExpect(status().isForbidden());
        var valid=new MockMultipartFile("file","admin.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",workbook(EntityType.UNIVERSITY,List.of(university(prefix))));
        mvc.perform(multipart("/api/v1/admin/imports").file(valid).param("type","UNIVERSITY").with(user(principal(UserAccountRole.ADMIN))).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.batch.draftRows").value(1));
        var result=service.upload(EntityType.UNIVERSITY,"invalid.xlsx",new byte[]{1,2,3},actor);assertThat(result.batch().status()).isEqualTo("FAILED");assertThat(result.batch().failureReason()).isNotBlank();
    }
    private UserPrincipal principal(UserAccountRole role){var account=UserAccount.external("Test","v1","v1");ReflectionTestUtils.setField(account,"id",actor);ReflectionTestUtils.setField(account,"role",role);return UserPrincipal.from(account);}
    private long countUniversities(String code){return jdbc.queryForObject("SELECT COUNT(*) FROM universities WHERE university_code=?",Long.class,code);}
    private Map<String,Object> university(String code){return new HashMap<>(Map.of("universityCode",code,"slug",code.toLowerCase(),"nameZh","导入测试大学"+UUID.nameUUIDFromBytes(code.getBytes()),"nameEn","Import University "+UUID.nameUUIDFromBytes(code.getBytes()),"countryCode","MY"));}
    private byte[] workbook(EntityType type,List<Map<String,Object>> rows)throws Exception{
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(service.template(type)))){var sheet=book.getSheet("导入数据");int number=1;for(var data:rows){var row=sheet.createRow(number++);var columns=AdminImportExcel.columns(type);for(int i=0;i<columns.size();i++)row.createCell(i).setCellValue(Objects.toString(data.get(columns.get(i).key()),""));}var out=new ByteArrayOutputStream();book.write(out);return out.toByteArray();}
    }
}
