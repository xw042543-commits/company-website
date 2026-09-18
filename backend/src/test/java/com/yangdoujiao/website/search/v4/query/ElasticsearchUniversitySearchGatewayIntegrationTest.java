package com.yangdoujiao.website.search.v4.query;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.alias.SearchAliasTargetType;
import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.index.UniversitySearchProjectionLoader;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class ElasticsearchUniversitySearchGatewayIntegrationTest {
    @Autowired ElasticsearchOperations operations;
    @Autowired UniversitySearchProjectionLoader projectionLoader;
    @Autowired JdbcTemplate jdbc;
    private UniversitySearchGateway gateway;
    private IndexCoordinates index;

    @BeforeEach
    void createIsolatedMappedIndexAndApprovedMatrixFixtures() {
        gateway = new ElasticsearchUniversitySearchGateway(operations, new UniversitySearchQueryFactory());
        index = IndexCoordinates.of("universities-v4-task6-" + UUID.randomUUID());
        IndexOperations indexOps = operations.indexOps(index);
        indexOps.create(indexOps.createSettings(UniversityProgrammeSearchDocument.class),
                indexOps.createMapping(UniversityProgrammeSearchDocument.class));
        indexOps.alias(new AliasActions(new AliasAction.Add(AliasActionParameters.builder()
                .withIndices(index.getIndexName()).withAliases("universities-v4-read").build())));
        save(university(1, "GB", "北辰虚构大学", "Northstar Fictional University", true, List.of(
                programme(11, "P-GB-DS-01", "数据科学", "Data Science", "COMPUTING", "MASTER", "ON_CAMPUS",
                        List.of("EN", "ZH"), 12, List.of("2027-01", "2027-09"), "200000", "236000"),
                programme(12, "P-GB-AI-02", "人工智能", "Artificial Intelligence", "COMPUTING", "MASTER", "ONLINE",
                        List.of("EN"), 18, List.of("2027-03"), "164000", "191000"),
                programme(13, "P-GB-BUS-03", "商业分析", "Business Analytics", "BUSINESS", "MASTER", "ON_CAMPUS",
                        List.of("EN"), 12, List.of("2027-09"), "191000", "228000"))));
        save(university(2, "AU", null, "Harbor Example Institute", false, List.of(
                programme(21, "P-AU-BA-01", "商业分析", "Business Analytics", "BUSINESS", "BACHELOR", "HYBRID",
                        List.of("EN"), 36, List.of("2027-02"), "391000", "437000"))));
        save(university(3, "CA", "枫叶示例大学", null, false, List.of(
                programme(31, "P-CA-CS-01", "计算机科学", null, "COMPUTING", "BACHELOR", "ON_CAMPUS",
                        List.of("EN", "FR"), 48, List.of("2027-01", "2027-09"), "572000", "650000"))));
        save(university(4, "SG", "晨曦虚构学院", "Sunrise Fictional College", false, List.of(
                programme(41, "P-SG-IT-01", "信息技术预科", "Foundation in IT", "COMPUTING", "FOUNDATION", "ON_CAMPUS",
                        List.of("EN"), 10, List.of("2027-08"), null, null))));
        indexOps.refresh();
    }

    @AfterEach
    void removeOnlyThisTestIndex() {
        if (index != null) operations.indexOps(index).delete();
    }

    @Test
    void f01EmptySearchIsPopularThenNameThenIdAndExcludesEmptyUniversity() {
        save(university(9, "GB", "空学校", "Empty university", true, List.of()));
        var result = search(new Request());
        assertThat(ids(result)).containsExactly(1L, 4L, 3L, 2L);
        assertThat(result.totalItems()).isEqualTo(4);
        assertThat(result.pageSize()).isEqualTo(12);
        assertThat(ids(search(new Request()))).containsExactlyElementsOf(ids(result));
    }

    @ParameterizedTest
    @CsvSource({"data, P-GB-DS-01", "数据科学, P-GB-DS-01", "COMPUTING, P-GB-DS-01", "computing, P-GB-DS-01"})
    void f02NamesAndStoredCategoryCodeAreSearchable(String text, String expected) {
        Request request = new Request(); request.keyword = text;
        assertThat(codes(search(request))).contains(expected);
    }

    @Test
    void f03CategoryAndF05LevelFilterActualProgrammeFields() {
        Request request = new Request(); request.categories = Set.of("COMPUTING");
        assertThat(ids(search(request))).containsExactlyInAnyOrder(1L, 3L, 4L);
        request.categories = Set.of(); request.levels = Set.of("BACHELOR");
        assertThat(ids(search(request))).containsExactlyInAnyOrder(2L, 3L);
    }

    @Test
    void f04ResolvedCountryAliasEqualsExplicitCountryAndCategoryAliasUsesCode() {
        Request country = new Request(); country.countries = Set.of("GB");
        assertThat(gateway.search(new Request().criteria(), new ResolvedSearchTerm("uk", SearchAliasTargetType.COUNTRY, "GB")))
                .isEqualTo(search(country));
        Request chinese = new Request(); chinese.keyword = "软硬件类";
        assertThat(search(chinese).items()).isEmpty(); // Category names are not stored in the approved projection.
        var categoryAlias = gateway.search(chinese.criteria(),
                new ResolvedSearchTerm("软硬件类", SearchAliasTargetType.SUBJECT_CATEGORY, "COMPUTING"));
        assertThat(ids(categoryAlias)).containsExactlyInAnyOrder(1L, 3L, 4L);
        var programmeAlias = gateway.search(chinese.criteria(),
                new ResolvedSearchTerm("测试数据专业", SearchAliasTargetType.PROGRAMME, "P-GB-DS-01"));
        assertThat(codes(programmeAlias)).containsExactly("P-GB-DS-01");
    }

    @Test
    void f06EveryDimensionMustMatchTheSameProgrammeIncludingKeywordAndTuition() {
        Request request = new Request(); request.keyword = "data"; request.countries = Set.of("GB");
        request.categories = Set.of("COMPUTING"); request.levels = Set.of("MASTER");
        request.modes = Set.of("ON_CAMPUS"); request.languages = Set.of("ZH");
        request.duration = 12; request.intake = YearMonth.of(2027, 9);
        request.min = new BigDecimal("230000"); request.max = new BigDecimal("250000");
        assertThat(codes(search(request))).containsExactly("P-GB-DS-01");
        request.duration = 13;
        assertThat(search(request).totalItems()).isZero();
    }

    @Test
    void f07NeverCombinesFieldsOrKeywordAcrossDifferentProgrammes() {
        Request request = new Request(); request.countries = Set.of("GB");
        request.modes = Set.of("ONLINE"); request.languages = Set.of("ZH");
        assertThat(search(request).items()).isEmpty();
        request.languages = Set.of(); request.keyword = "data";
        assertThat(search(request).items()).isEmpty();
        request.keyword = null; request.intake = YearMonth.of(2027, 9);
        assertThat(search(request).items()).isEmpty();
    }

    @Test
    void f08SameDimensionIsOrAndDifferentDimensionsRemainAnd() {
        Request request = new Request(); request.countries = Set.of("GB", "AU"); request.modes = Set.of("ON_CAMPUS");
        assertThat(ids(search(request))).containsExactly(1L);
        request.categories = Set.of("COMPUTING", "BUSINESS"); request.levels = Set.of("MASTER", "BACHELOR");
        request.modes = Set.of("ON_CAMPUS", "HYBRID"); request.languages = Set.of("ZH", "EN");
        assertThat(ids(search(request))).containsExactlyInAnyOrder(1L, 2L);
    }

    @ParameterizedTest
    @ValueSource(strings = {"EN", "ZH"})
    void f09EachLanguageMatchesWithoutDuplicatingSchoolOrProgramme(String language) {
        Request request = new Request(); request.countries = Set.of("GB"); request.languages = Set.of(language);
        var result = search(request);
        assertThat(ids(result)).containsExactly(1L);
        assertThat(codes(result)).contains("P-GB-DS-01").doesNotHaveDuplicates();
    }

    @ParameterizedTest
    @ValueSource(strings = {"2027-01", "2027-09"})
    void f10AnyIntakeMonthMatchesExactly(String month) {
        Request request = new Request(); request.countries = Set.of("GB"); request.intake = YearMonth.parse(month);
        assertThat(codes(search(request))).contains("P-GB-DS-01").doesNotHaveDuplicates();
        request.intake = YearMonth.of(2028, 9);
        assertThat(search(request).items()).isEmpty();
    }

    @ParameterizedTest
    @CsvSource({"236000,250000,true", "100000,200000,true", "210000,220000,true", "236000.01,250000,false", ",199999.99,false", "236000,,true", ",200000,true"})
    void f11TuitionIntervalsIntersectInclusivelyWithSingleBoundSupport(String min, String max, boolean matches) {
        Request request = new Request(); request.keyword = "data";
        request.min = decimal(min); request.max = decimal(max);
        assertThat(codes(search(request)).contains("P-GB-DS-01")).isEqualTo(matches);
    }

    @Test
    void f12AndF22UnknownTuitionDisplaysConsultationAndNeverMatchesTuitionFilter() {
        Request request = new Request(); request.countries = Set.of("SG");
        var programme = search(request).items().getFirst().matchedProgrammes().getFirst();
        assertThat(programme.tuitionTotalRmbMin()).isNull();
        assertThat(programme.tuitionTotalRmbMax()).isNull();
        assertThat(programme.tuitionDisplay()).isEqualTo("请咨询");
        request.min = BigDecimal.ZERO;
        assertThat(search(request).items()).isEmpty();
        request.min = null; request.max = new BigDecimal("999999");
        assertThat(search(request).items()).isEmpty();
    }

    @Test
    void f13AndF14OneSchoolCardContainsAtMostThreeActualMatchesAndFullMatchedCount() {
        var fourMatches = new ArrayList<ProgrammeSearchDocument>();
        for (int i = 1; i <= 4; i++) fourMatches.add(programme(100 + i, "EXTRA-" + i, null, "Data Science", "COMPUTING",
                "MASTER", "ONLINE", List.of("EN"), 12, List.of(), null, null));
        fourMatches.add(programme(100, "NONMATCH", null, "Literature", "ARTS", "MASTER", "ONLINE", List.of("EN"), 12, List.of(), null, null));
        save(university(1, "GB", "北辰虚构大学", null, true, fourMatches));
        Request request = new Request(); request.keyword = "data";
        var result = search(request);
        assertThat(result.totalItems()).isEqualTo(1);
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().getFirst().matchedProgrammeCount()).isEqualTo(4);
        assertThat(codes(result)).containsExactly("EXTRA-1", "EXTRA-2", "EXTRA-3");
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void f15ThirteenUniversitiesPageTwelvePlusOneWithStableKeywordIdOrder(boolean keyword) {
        for (int id = 100; id <= 112; id++) save(university(id, "PAGE", "同名测试院校", null, false,
                List.of(programme(id, "PAGE-" + id, null, "Data Science", "COMPUTING", "MASTER", "ONLINE", List.of("EN"), 12, List.of(), null, null))));
        Request request = new Request(); request.countries = Set.of("PAGE"); request.keyword = keyword ? "data" : null;
        var first = search(request);
        assertThat(first.items()).hasSize(12);
        assertThat(first.page()).isEqualTo(1);
        assertThat(first.totalItems()).isEqualTo(13);
        assertThat(first.totalPages()).isEqualTo(2);
        assertThat(ids(search(request))).containsExactlyElementsOf(ids(first));
        request.page = 2;
        var second = search(request);
        assertThat(second.page()).isEqualTo(2);
        assertThat(second.items()).hasSize(1);
        assertThat(second.totalItems()).isEqualTo(13);
        List<Long> combined = new ArrayList<>(ids(first)); combined.addAll(ids(second));
        assertThat(combined).containsExactly(100L, 101L, 102L, 103L, 104L, 105L, 106L, 107L, 108L, 109L, 110L, 111L, 112L);
        request.page = 3;
        assertThat(search(request).items()).isEmpty();
    }

    @Test
    @Transactional
    void f23RealPostgresProjectionExcludesDraftSchoolsAndDraftProgrammesBeforeElasticsearchSearch() {
        long category = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en,status) VALUES ('TASK6_PUBLIC','Test category','PUBLISHED') RETURNING id", Long.class);
        long published = databaseUniversity("TASK6_PUBLISHED", "PUBLISHED");
        long draft = databaseUniversity("TASK6_DRAFT", "DRAFT");
        long draftOnly = databaseUniversity("TASK6_DRAFT_ONLY", "PUBLISHED");
        databaseProgramme(published, category, "TASK6_PUBLIC_PROGRAMME", "PUBLISHED");
        databaseProgramme(published, category, "TASK6_DRAFT_PROGRAMME", "DRAFT");
        databaseProgramme(draft, category, "TASK6_DRAFT_SCHOOL_PUBLIC_PROGRAMME", "PUBLISHED");
        databaseProgramme(draftOnly, category, "TASK6_ONLY_DRAFT_PROGRAMME", "DRAFT");
        for (long id : List.of(published, draft, draftOnly)) projectionLoader.loadPublishedUniversity(id).ifPresent(this::save);
        Request request = new Request(); request.categories = Set.of("TASK6_PUBLIC");
        assertThat(codes(search(request))).containsExactly("TASK6_PUBLIC_PROGRAMME");
        assertThat(search(request).totalItems()).isEqualTo(1);
    }

    @Test
    void keywordRelevanceOutranksPopularAndTiesUsePopularThenKeywordId() {
        save(university(10, "SORT", "A", null, false, List.of(programme(101, "EXACT", null, "Data", "COMPUTING", "MASTER", "ONLINE", List.of(), 12, List.of(), null, null))));
        save(university(2, "SORT", "B", null, true, List.of(programme(102, "LONG", null, "Data literature mathematics chemistry physics music history geography", "COMPUTING", "MASTER", "ONLINE", List.of(), 12, List.of(), null, null))));
        Request request = new Request(); request.countries = Set.of("SORT"); request.keyword = "data";
        assertThat(ids(search(request))).containsExactly(10L, 2L);
        save(university(2, "SORT", "B", null, true, List.of(programme(102, "SAME", null, "Data", "COMPUTING", "MASTER", "ONLINE", List.of(), 12, List.of(), null, null))));
        assertThat(ids(search(request))).containsExactly(2L, 10L);
        save(university(2, "SORT", "A", null, false, List.of(programme(102, "SAME", null, "Data", "COMPUTING", "MASTER", "ONLINE", List.of(), 12, List.of(), null, null))));
        assertThat(ids(search(request))).containsExactly(10L, 2L); // Keyword id order, not numeric id order.
    }

    private long databaseUniversity(String code, String status) {
        return jdbc.queryForObject("INSERT INTO universities(name,slug,country,university_code,name_en,status) VALUES (?,?, 'Test',?,?,?) RETURNING id",
                Long.class, code, code.toLowerCase(java.util.Locale.ROOT), code, code, status);
    }

    private void databaseProgramme(long university, long category, String code, String status) {
        jdbc.update("INSERT INTO programmes(university_id,subject_category_id,programme_code,slug,name_en,status) VALUES (?,?,?,?,?,?)",
                university, category, code, code.toLowerCase(java.util.Locale.ROOT), code, status);
    }

    private PageResponse<UniversitySearchResult> search(Request request) {
        operations.indexOps(index).refresh();
        return gateway.search(request.criteria(), new ResolvedSearchTerm(request.keyword, null, null));
    }

    private void save(UniversityProgrammeSearchDocument document) { operations.save(document, index); }
    private static List<Long> ids(PageResponse<UniversitySearchResult> result) { return result.items().stream().map(UniversitySearchResult::id).toList(); }
    private static List<String> codes(PageResponse<UniversitySearchResult> result) {
        return result.items().stream().flatMap(u -> u.matchedProgrammes().stream()).map(p -> p.programmeCode()).toList();
    }
    private static BigDecimal decimal(String value) { return value == null ? null : new BigDecimal(value); }
    private static UniversityProgrammeSearchDocument university(long id, String country, String zh, String en, boolean popular, List<ProgrammeSearchDocument> programmes) {
        return new UniversityProgrammeSearchDocument(id, "FAKE-" + id, "fake-" + id, zh, en, country, null, country, null, null, popular, programmes);
    }
    private static ProgrammeSearchDocument programme(long id, String code, String zh, String en, String category, String level,
            String mode, List<String> languages, int duration, List<String> intakes, String min, String max) {
        return new ProgrammeSearchDocument(id, code, zh, en, category, level, mode, languages, duration, intakes,
                decimal(min), decimal(max), duration + " months", intakes, min == null ? "请咨询" : "RMB " + min + "–" + max);
    }
    private static final class Request {
        String keyword; Set<String> categories = Set.of(); Set<String> levels = Set.of(); Set<String> countries = Set.of();
        Set<String> modes = Set.of(); Set<String> languages = Set.of(); Integer duration; YearMonth intake;
        BigDecimal min; BigDecimal max; int page = 1;
        UniversitySearchCriteria criteria() {
            return new UniversitySearchCriteria(keyword, categories, levels, countries, modes, languages, duration, intake, min, max, page, 12);
        }
    }
}
