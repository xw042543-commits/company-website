package com.yangdoujiao.website.planningagent.catalog;

import static org.assertj.core.api.Assertions.*;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.planningagent.budget.*;
import com.yangdoujiao.website.planningagent.evidence.EvidenceRepository;
import com.yangdoujiao.website.planningagent.tools.PlanningTools;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class PlanningCatalogueIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    private long category;
    private long level;
    private long my;
    private String subject;
    private PlanningCatalogue catalogue;
    private final Instant now = Instant.parse("2026-10-15T00:00:00Z");

    @BeforeEach void fixture() {
        String suffix = UUID.randomUUID().toString().replace("-","");
        subject = "T_" + suffix.toUpperCase();
        category = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?,'Planning') RETURNING id",Long.class,subject);
        jdbc.update("INSERT INTO study_levels(code,name_en,status) VALUES('BACHELOR','Bachelor','PUBLISHED') ON CONFLICT(code) DO NOTHING");
        level = jdbc.queryForObject("SELECT id FROM study_levels WHERE code='BACHELOR'",Long.class);
        jdbc.update("INSERT INTO countries(code,name_en,continent_code) VALUES('MY','Malaysia','ASIA') ON CONFLICT(code) DO NOTHING");
        long country = jdbc.queryForObject("SELECT id FROM countries WHERE code='MY'",Long.class);
        my = university("PUBLISHED",country);
        catalogue = new PlanningCatalogue(jdbc);
    }
    private long university(String status, Long country) {
        return jdbc.queryForObject("INSERT INTO universities(name,slug,country,country_id,status,city_en) VALUES('Planning school',?,'Malaysia',?,?,'Kuala Lumpur') RETURNING id",
                Long.class,"plan-"+UUID.randomUUID(),country,status);
    }
    private long programme(long university, String status) {
        String suffix = UUID.randomUUID().toString().replace("-","");
        return jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,slug,name_en,status) VALUES(?,?,?,?,?,'Planning course',?) RETURNING id",
                Long.class,"P_"+suffix.toUpperCase(),university,category,level,"plan-"+suffix,status);
    }
    private long evidence(long programme) {
        return jdbc.queryForObject("""
                INSERT INTO planning_evidence(programme_id,fact_type,source_url,source_type,student_scope,intake,
                    checked_at,expires_at,review_status,reviewer_id,excerpt)
                VALUES(?,'FEES','https://example.edu/fees','OFFICIAL','CN_MAINLAND','2027-02',
                    TIMESTAMPTZ '2026-10-14T00:00:00Z',TIMESTAMPTZ '2026-11-01T00:00:00Z','VERIFIED',1,'Official fees') RETURNING id
                """,Long.class,programme);
    }
    private long fee(long programme,long evidence,String category,Long included) {
        return jdbc.queryForObject("""
                INSERT INTO planning_fees(programme_id,evidence_id,category,amount,currency,period,units,included_in,coverage_complete)
                VALUES(?,?,?,100.25,'MYR','TOTAL',1,?,true) RETURNING id
                """,Long.class,programme,evidence,category,included);
    }
    @ParameterizedTest
    @ValueSource(strings={"FOUNDATION","BACHELOR","MASTER","DOCTOR"})
    void searchesPersistedTargetStudyLevelCodes(String code) {
        jdbc.update("INSERT INTO study_levels(code,name_en,status) VALUES(?,?,'PUBLISHED') ON CONFLICT(code) DO NOTHING",code,code);
        level = jdbc.queryForObject("SELECT id FROM study_levels WHERE code=?",Long.class,code);
        long id = programme(my,"PUBLISHED");

        assertThat(catalogue.search(code,subject,"Kuala Lumpur",0)).containsExactly(id);
    }
    @ParameterizedTest
    @ValueSource(strings={"PHD","DIPLOMA"})
    void rejectsUnsupportedPlanningTargetLevels(String code) {
        assertThatThrownBy(() -> catalogue.search(code,subject,null,0)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void pagesBeyondThreeWithinOneUniversityAndFiltersBeforePaging() {
        List<Long> ids = new ArrayList<>();
        for (int i=0;i<23;i++) ids.add(programme(my,"PUBLISHED"));
        programme(my,"DRAFT");
        programme(university("DRAFT",jdbc.queryForObject("SELECT id FROM countries WHERE code='MY'",Long.class)),"PUBLISHED");
        programme(university("PUBLISHED",null),"PUBLISHED");
        jdbc.update("INSERT INTO countries(code,name_en,continent_code) VALUES('SG','Singapore','ASIA') ON CONFLICT(code) DO NOTHING");
        long foreignProgramme = programme(university("PUBLISHED",jdbc.queryForObject("SELECT id FROM countries WHERE code='SG'",Long.class)),"PUBLISHED");
        assertThat(catalogue.isPublishedMalaysianProgramme(foreignProgramme)).isFalse();
        assertThat(catalogue.search("BACHELOR",subject,"Kuala Lumpur",0)).containsExactlyElementsOf(ids.subList(0,20));
        assertThat(catalogue.search("BACHELOR",subject,"Kuala Lumpur",1)).containsExactlyElementsOf(ids.subList(20,23));
        assertThat(catalogue.search("BACHELOR",subject,"Other",0)).isEmpty();
        assertThat(catalogue.search("BACHELOR",subject+"' OR 1=1 --",null,0)).isEmpty();
        assertThat(catalogue.search("BACHELOR",subject,"Kuala Lumpur",2)).isEmpty();
        assertThatThrownBy(() -> catalogue.search("BACHELOR' OR 1=1",null,null,0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> catalogue.search("BACHELOR",null,null,-1)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void publicationCountryAndIllegalIdsAreCheckedAgainstPostgresImmediately() {
        long id = programme(my,"PUBLISHED");
        assertThat(catalogue.isPublishedMalaysianProgramme(id)).isTrue();
        jdbc.update("UPDATE programmes SET status='ARCHIVED' WHERE id=?",id);
        assertThat(catalogue.isPublishedMalaysianProgramme(id)).isFalse();
        jdbc.update("UPDATE programmes SET status='PUBLISHED' WHERE id=?",id);
        jdbc.update("UPDATE universities SET status='ARCHIVED' WHERE id=?",my);
        assertThat(catalogue.isPublishedMalaysianProgramme(id)).isFalse();
        assertThat(catalogue.isPublishedMalaysianProgramme(-1)).isFalse();
        assertThat(catalogue.isPublishedMalaysianProgramme(Long.MAX_VALUE)).isFalse();
    }
    @Test void displayUsesPersistedNamesAndDisappearsOnUnpublication() {
        long id=programme(my,"PUBLISHED");
        var display=catalogue.display(id).orElseThrow();
        assertThat(display.programmeNameEn()).isEqualTo("Planning course");
        assertThat(display.universityNameEn()).isEqualTo("Planning school");
        jdbc.update("UPDATE programmes SET status='DRAFT' WHERE id=?",id);
        assertThat(catalogue.display(id)).isEmpty();
    }
    @Test void toolsLoadAmountsAndEvidenceFromPersistenceAndFailClosedAfterRevocation() {
        long p = programme(my,"PUBLISHED");
        long e = evidence(p);
        long tuition = fee(p,e,"TUITION",null);
        long tax = fee(p,e,"TAX",tuition);
        fee(p,e,"LIVING",null);
        var tools = new PlanningTools(catalogue,new EvidenceRepository(jdbc),new FeeRepository(jdbc));
        assertThat(new FeeRepository(jdbc).findByProgrammeId(p)).extracting(BudgetTypes.Fee::id).contains(tuition,tax);
        assertThat(tools.getProgrammeEvidence(p)).hasSize(1);
        var result = tools.calculateBudget(p,now,"2027-02",new BudgetTypes.BudgetScope(BudgetTypes.CATEGORIES));
        assertThat(result.complete()).isTrue();
        assertThat(result.subtotals().get("MYR")).isEqualByComparingTo(new BigDecimal("200.50"));
        jdbc.update("UPDATE planning_evidence SET review_status='REVOKED' WHERE id=?",e);
        assertThat(tools.calculateBudget(p,now,"2027-02",new BudgetTypes.BudgetScope(BudgetTypes.CATEGORIES)).subtotals()).isEmpty();
        jdbc.update("UPDATE programmes SET status='DRAFT' WHERE id=?",p);
        assertThat(tools.getProgrammeEvidence(p)).isEmpty();
        assertThat(tools.calculateBudget(p,now,"2027-02",new BudgetTypes.BudgetScope(BudgetTypes.CATEGORIES)).complete()).isFalse();
    }
    @Test void schemaRejectsFeeEvidenceOwnedByAnotherProgramme() {
        long p = programme(my,"PUBLISHED");
        long other = programme(my,"PUBLISHED");
        long e = evidence(other);
        assertThatThrownBy(() -> fee(p,e,"TUITION",null)).isInstanceOf(DataIntegrityViolationException.class);
    }
    @Test void schemaRejectsInclusionOwnedByAnotherProgramme() {
        long p = programme(my,"PUBLISHED");
        long other = programme(my,"PUBLISHED");
        long parent = fee(other,evidence(other),"TUITION",null);
        assertThatThrownBy(() -> fee(p,evidence(p),"TAX",parent)).isInstanceOf(DataIntegrityViolationException.class);
    }
}
