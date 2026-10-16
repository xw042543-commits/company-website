package com.yangdoujiao.website.planningagent.catalog;

import static org.assertj.core.api.Assertions.*;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.planningagent.tools.PlanningProgrammeLookup;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import org.springframework.test.util.ReflectionTestUtils;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class PlanningProgrammeLookupIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired jakarta.persistence.EntityManager entityManager;
    @Test void httpRequiresAdminAndReturnsValidatedReadOnlyResults() throws Exception {
        String url="/api/v1/admin/planning/programme-lookup";
        long id=programme("MASTER");
        long actor=jdbc.queryForObject("INSERT INTO user_accounts(full_name,normalized_email,password_hash,status,role,agreement_version,privacy_version) VALUES ('Lookup admin',?,'hash','ACTIVE','ADMIN','v1','v1') RETURNING id",Long.class,key+"@example.test");
        var account=UserAccount.external("Lookup admin","v1","v1");
        ReflectionTestUtils.setField(account,"id",actor);
        ReflectionTestUtils.setField(account,"role",UserAccountRole.ADMIN);
        var admin=UserPrincipal.from(account);
        mvc.perform(get(url)).andExpect(status().isUnauthorized());
        mvc.perform(get(url).with(user("student").roles("USER"))).andExpect(status().isForbidden());
        mvc.perform(get(url).param("keyword",key).with(user(admin)))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
            .andExpect(jsonPath("$.items[0].programmeId").value(id))
            .andExpect(jsonPath("$.items[0].usableForAssessment").value(false));
        for(String page:List.of("-1","1001","abc")) mvc.perform(get(url).param("page",page).with(user(admin))).andExpect(status().isBadRequest());
        mvc.perform(get(url).param("level","PHD").with(user(admin))).andExpect(status().isBadRequest());
        jdbc.update("UPDATE user_accounts SET role='USER' WHERE id=?",actor);
        entityManager.clear();
        mvc.perform(get(url).with(user(admin))).andExpect(status().isForbidden());
    }
    @Autowired JdbcTemplate jdbc;
    @Autowired PlanningProgrammeLookup lookup;
    private String key;
    private long school;
    private long category;
    @BeforeEach void seed() {
        key="Lookup"+UUID.randomUUID().toString().replace("-", "");
        jdbc.update("INSERT INTO countries(code,name_en,continent_code) VALUES('MY','Malaysia','ASIA') ON CONFLICT(code) DO NOTHING");
        school=jdbc.queryForObject("INSERT INTO universities(name,name_zh,slug,country,country_id,status) SELECT ?,?,?,'Malaysia',id,'PUBLISHED' FROM countries WHERE code='MY' RETURNING id",Long.class,key,"示例查询大学",key);
        category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,name_zh) VALUES(?,'Computing','计算机') RETURNING id",Long.class,key.toUpperCase());
    }
    private long programme(String level) {
        jdbc.update("INSERT INTO study_levels(code,name_en,status) VALUES(?,?,'PUBLISHED') ON CONFLICT(code) DO NOTHING",level,level);
        String code="P_"+UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,slug,name_zh,name_en,status) SELECT ?,?,?,id,?,'计算机专业','Computer Science','PUBLISHED' FROM study_levels WHERE code=? RETURNING id",Long.class,code,school,category,code,level);
    }
    @Test void searchesWithoutStudentProfileOrLevelAndSupportsBothNamesAndCategory() {
        List<Long> ids=List.of(programme("FOUNDATION"),programme("BACHELOR"),programme("MASTER"),programme("DOCTOR"));
        assertThat(lookup.search(key,null,0).items()).extracting(PlanningProgrammeLookup.Item::programmeId).containsExactlyElementsOf(ids);
        assertThat(lookup.search(key.toLowerCase()+" computer",null,0).items()).hasSize(4);
        assertThat(lookup.search(key+" Computing",null,0).items()).hasSize(4);
        assertThat(lookup.search(key+" 计算机", "MASTER",0).items()).extracting(PlanningProgrammeLookup.Item::programmeId).containsExactly(ids.get(2));
        assertThat(lookup.search("示例查询大学", "DOCTOR",0).items()).extracting(PlanningProgrammeLookup.Item::programmeId).containsExactly(ids.get(3));
    }
    @Test void filtersBeforePagingAndRechecksPublication() {
        List<Long> ids=new ArrayList<>(); for(int n=0;n<21;n++) ids.add(programme("MASTER"));
        long hidden=programme("MASTER"); jdbc.update("UPDATE programmes SET status='DRAFT' WHERE id=?",hidden);
        programme("DIPLOMA");
        var first=lookup.search(key,null,0); assertThat(first.items()).extracting(PlanningProgrammeLookup.Item::programmeId).containsExactlyElementsOf(ids.subList(0,20));
        assertThat(first.hasNext()).isTrue();
        var last=lookup.search(key,"",1); assertThat(last.items()).extracting(PlanningProgrammeLookup.Item::programmeId).containsExactly(ids.get(20)); assertThat(last.hasNext()).isFalse();
        jdbc.update("UPDATE universities SET status='DRAFT' WHERE id=?",school);
        assertThat(lookup.search(key,null,0).items()).isEmpty();
    }
    @Test void excludesForeignCountryAndTreatsSqlAndWildcardsAsLiteralText() {
        programme("MASTER");
        for(String keyword:List.of(key+"%",key+"_",key+"' OR 1=1 --")) assertThat(lookup.search(keyword,null,0).items()).isEmpty();
        jdbc.update("INSERT INTO countries(code,name_en,continent_code) VALUES('SG','Singapore','ASIA') ON CONFLICT(code) DO NOTHING");
        jdbc.update("UPDATE universities SET country_id=(SELECT id FROM countries WHERE code='SG') WHERE id=?",school);
        assertThat(lookup.search(key,null,0).items()).isEmpty();
    }
    @Test void preservesRawPublishedMaterialAndNeverPromotesItToVerifiedFacts() {
        long id=programme("MASTER");
        jdbc.update("UPDATE programmes SET official_url='https://example.edu/course',source_type='official',source_reference='Catalogue',source_checked_at=NOW(),tuition_min=10000,tuition_max=20000,tuition_currency='MYR' WHERE id=?",id);
        jdbc.update("INSERT INTO programme_detail_sections(programme_id,section_type,title_en,body_zh,source_type,source_url,status) VALUES(?,'ADMISSIONS','Admissions','雅思 6.5','ai_generated','https://example.edu/admissions','PUBLISHED')",id);
        jdbc.update("UPDATE programme_detail_sections SET source_reference='Admissions prospectus' WHERE programme_id=?",id);
        long before=jdbc.queryForObject("SELECT count(*) FROM planning_evidence",Long.class);
        var item=lookup.search(key,null,0).items().getFirst();
        assertThat(item.catalogueSource().reference()).isEqualTo("Catalogue"); assertThat(item.catalogueSource().checkedAt()).isNotNull();
        assertThat(item.catalogueSource().url()).isEqualTo("https://example.edu/course");
        assertThat(item.admissionsSource().url()).isEqualTo("https://example.edu/admissions");
        assertThat(item.admissionsSource().reference()).isEqualTo("Admissions prospectus");
        assertThat(item.admissionsZh()).isEqualTo("雅思 6.5"); assertThat(item.admissionsStatus()).isEqualTo("AI_GENERATED_UNVERIFIED");
        assertThat(item.feesStatus()).isEqualTo("REVIEW_REQUIRED"); assertThat(item.tuitionMin()).isEqualByComparingTo("10000");
        assertThat(item.tuitionMax()).isEqualByComparingTo("20000"); assertThat(item.usableForAssessment()).isFalse();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_evidence",Long.class)).isEqualTo(before);
        jdbc.update("UPDATE programme_detail_sections SET source_type='official' WHERE programme_id=?",id);
        assertThat(lookup.search(key,null,0).items().getFirst().admissionsStatus()).isEqualTo("REVIEW_REQUIRED");
        jdbc.update("UPDATE programme_detail_sections SET status='DRAFT' WHERE programme_id=?",id);
        assertThat(lookup.search(key,null,0).items().getFirst().admissionsZh()).isNull();
        assertThat(lookup.search(key,null,0).items().getFirst().admissionsStatus()).isEqualTo("MISSING");
    }
    @ParameterizedTest @ValueSource(strings={"PHD","DIPLOMA","MASTER' OR 1=1"," MASTER "})
    void rejectsUnsupportedLevel(String level) { assertThatIllegalArgumentException().isThrownBy(()->lookup.search(key,level,0)); }
    @Test void validatesBoundsAndMissingMaterialStaysMissing() {
        assertThatIllegalArgumentException().isThrownBy(()->lookup.search("x".repeat(201),null,0));
        assertThatIllegalArgumentException().isThrownBy(()->lookup.search(key,null,-1));
        assertThatIllegalArgumentException().isThrownBy(()->lookup.search(key,null,1001));
        programme("MASTER"); var item=lookup.search("  "+key+"  ",null,0).items().getFirst();
        assertThat(item.admissionsStatus()).isEqualTo("MISSING"); assertThat(item.feesStatus()).isEqualTo("MISSING");
        assertThat(item.usableForAssessment()).isFalse();
    }
}
