package com.yangdoujiao.website.admin;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasItem;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class AdminCatalogCountryFilterIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    private String prefix;
    private long universityA;
    private long category;
    private long level;
    private long otherLevel;
    private UserPrincipal admin;

    @BeforeEach
    void seedCountriesAndCatalogues() {
        prefix="CF"+UUID.randomUUID().toString().replace("-", "").substring(0,12).toUpperCase();
        for (String code : new String[]{"XA","XB"})
            jdbc.update("INSERT INTO countries(code,name_zh,name_en,continent_code) VALUES (?, ?, ?, 'ASIA') ON CONFLICT(code) DO NOTHING",code,"筛选测试国"+code,"Filter Country "+code);
        category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,status) VALUES (?, 'Filter subject', 'PUBLISHED') RETURNING id",Long.class,prefix+"CAT");
        level=jdbc.queryForObject("INSERT INTO study_levels(code,name_zh,status) VALUES (?, '本科', 'PUBLISHED') RETURNING id",Long.class,prefix+"LEVEL");
        long otherCategory=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,status) VALUES (?, 'Other subject', 'PUBLISHED') RETURNING id",Long.class,prefix+"CAT2");
        otherLevel=jdbc.queryForObject("INSERT INTO study_levels(code,name_zh,status) VALUES (?, '硕士', 'PUBLISHED') RETURNING id",Long.class,prefix+"LEVEL2");
        universityA=university("A","XA","PUBLISHED");
        long b=university("B","XA","ARCHIVED"), c=university("C","XB","PUBLISHED");
        programme("A",universityA,category,level,"PUBLISHED");
        programme("B",universityA,category,level,"ARCHIVED");
        programme("C",b,otherCategory,otherLevel,"PUBLISHED");
        programme("D",c,category,level,"PUBLISHED");
        UserAccount account=UserAccount.external("Administrator","v1","v1");
        ReflectionTestUtils.setField(account,"id",42L);
        ReflectionTestUtils.setField(account,"role",UserAccountRole.ADMIN);
        admin=UserPrincipal.from(account);
    }

    @Test
    void universityFilterRunsBeforePaginationAndUsesTheSameCount() throws Exception {
        mvc.perform(get("/api/v1/admin/catalog/universities").param("q",prefix).param("country"," xa ").param("size","1").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2)).andExpect(jsonPath("$.totalPages").value(2))
            .andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.items[0].countryCode").value("XA"))
            .andExpect(jsonPath("$.items[0].universityCode").value(prefix+"A"));
        mvc.perform(get("/api/v1/admin/catalog/universities").param("q",prefix).param("country","XA").param("size","1").param("page","2").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(2)).andExpect(jsonPath("$.total").value(2))
            .andExpect(jsonPath("$.items[0].universityCode").value(prefix+"B"));
    }

    @Test
    void countryCombinesWithSearchAndStatusAndEmptyMeansAll() throws Exception {
        mvc.perform(get("/api/v1/admin/catalog/universities").param("q",prefix).param("country","XA").param("status","ARCHIVED").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.items[0].universityCode").value(prefix+"B"));
        for(String country:new String[]{"","XB","ZZ"})
            mvc.perform(get("/api/v1/admin/catalog/universities").param("q",prefix).param("country",country).with(user(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(country.isEmpty()?3:country.equals("XB")?1:0));
        mvc.perform(get("/api/v1/admin/catalog/universities").param("q",prefix+"C").param("country","XA").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0)).andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void programmeCountryFollowsUniversityAndCombinesWithUniversityAndStatus() throws Exception {
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).param("country","XA").param("status","PUBLISHED").param("size","1").param("page","2").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2)).andExpect(jsonPath("$.totalPages").value(2))
            .andExpect(jsonPath("$.items[0].programmeCode").value(prefix+"PC"));
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).param("country","XA").param("universityId",Long.toString(universityA)).with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2));
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).param("country","XB").param("universityId",Long.toString(universityA)).with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(4));
    }

    @Test
    void countrySubjectAndStudyLevelCombineWithEveryExistingFilter() throws Exception {
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).param("country","XA")
                .param("status","PUBLISHED").param("universityId",Long.toString(universityA))
                .param("categoryId",Long.toString(category)).param("studyLevelId",Long.toString(level)).with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.items[0].programmeCode").value(prefix+"PA"));
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("q",prefix).param("country","XA")
                .param("categoryId",Long.toString(category)).param("studyLevelId",Long.toString(otherLevel)).with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("country","XA").param("categoryId","0").with(user(admin)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void countryOptionsComeFromTheDatabaseAndInvalidCodesFailValidation() throws Exception {
        mvc.perform(get("/api/v1/admin/catalog/options").with(user(admin)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.countries[*].code",hasItem("XA"))).andExpect(jsonPath("$.countries[*].code",hasItem("XB")));
        mvc.perform(get("/api/v1/admin/catalog/universities").param("country","Malaysia").with(user(admin)))
            .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/catalog/programmes").param("country","MY' OR 1=1").with(user(admin)))
            .andExpect(status().isBadRequest());
    }

    private long university(String suffix,String country,String state) {
        return jdbc.queryForObject("INSERT INTO universities(name,name_en,slug,university_code,country,country_id,status) SELECT ?,?,?,?,name_en,id,? FROM countries WHERE code=? RETURNING id",Long.class,prefix+suffix,prefix+suffix,(prefix+suffix).toLowerCase(),prefix+suffix,state,country);
    }
    private void programme(String suffix,long university,long category,long level,String state) {
        jdbc.update("INSERT INTO programmes(programme_code,slug,name_en,university_id,subject_category_id,study_level_id,status) VALUES (?,?,?,?,?,?,?)",prefix+"P"+suffix,(prefix+"p"+suffix).toLowerCase(),prefix+"P"+suffix,university,category,level,state);
    }
}
