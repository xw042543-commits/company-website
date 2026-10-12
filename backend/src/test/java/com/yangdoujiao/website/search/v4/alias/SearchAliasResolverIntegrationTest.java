package com.yangdoujiao.website.search.v4.alias;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.Country;
import com.yangdoujiao.website.catalog.CountryRepository;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.search.v4.SearchValidationException;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({SearchAliasResolver.class, SearchAliasResolverIntegrationTest.CacheConfiguration.class})
@Testcontainers
class SearchAliasResolverIntegrationTest {

    @TestConfiguration(proxyBeanMethods = false)
    static class CacheConfiguration {
        @Bean
        CacheManager cacheManager() {
            return new NoOpCacheManager();
        }
    }

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.11")
            .withDatabaseName("search_alias_resolver_test");

    @Autowired
    private SearchAliasResolver resolver;

    @Autowired
    private SearchAliasRepository aliases;

    @Autowired
    private CountryRepository countries;

    @Autowired
    private SubjectCategoryRepository categories;

    @Test
    void resolvesPublishedAliasUsingTheSharedWhitespaceAndCaseNormalization() {
        countries.saveAndFlush(new Country("GB", null, "United Kingdom", "EU"));
        aliases.saveAndFlush(new SearchAlias("UK", "uk", "en", SearchAliasTargetType.COUNTRY, "GB",
                SearchAliasStatus.PUBLISHED));

        var resolved = resolver.resolve("  UK  ");

        assertThat(resolved.text()).isEqualTo("UK");
        assertThat(resolved.targetType()).isEqualTo(SearchAliasTargetType.COUNTRY);
        assertThat(resolved.targetCode()).isEqualTo("GB");
    }

    @Test
    void ignoresUnpublishedAliasesAndKeepsUnknownTermsAsText() {
        aliases.saveAndFlush(new SearchAlias("Draft", "draft", "en", SearchAliasTargetType.COUNTRY, "GB",
                SearchAliasStatus.DRAFT));

        assertThat(resolver.resolve(" draft "))
                .extracting(result -> result.text(), result -> result.targetType(), result -> result.targetCode())
                .containsExactly("draft", null, null);
        assertThat(resolver.resolve("unmapped"))
                .extracting(result -> result.text(), result -> result.targetType(), result -> result.targetCode())
                .containsExactly("unmapped", null, null);
    }

    @Test
    void rejectsOneNormalizedAliasWithDifferentPublishedTargets() {
        aliases.saveAndFlush(new SearchAlias("DS", "ds", "en", SearchAliasTargetType.PROGRAMME, "P-GB-DS-01",
                SearchAliasStatus.PUBLISHED));
        aliases.saveAndFlush(new SearchAlias("DS", "ds", "zh", SearchAliasTargetType.SUBJECT_CATEGORY, "COMPUTING",
                SearchAliasStatus.PUBLISHED));

        assertThatThrownBy(() -> resolver.resolve(" DS "))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                                assertThat(exception.getFieldErrors()).containsEntry("q", "alias resolves to conflicting targets"));
    }

    @Test
    void rejectsPublishedAliasWhenItsCountryTargetDoesNotExist() {
        aliases.saveAndFlush(new SearchAlias("UK", "uk", "en", SearchAliasTargetType.COUNTRY, "GB",
                SearchAliasStatus.PUBLISHED));

        assertInvalidTarget("UK");
    }

    @Test
    void rejectsPublishedAliasWhenItsCategoryTargetIsNotPublished() {
        categories.saveAndFlush(new SubjectCategory("DRAFT_CATEGORY", null, "Draft", null, 1, CategoryStatus.DRAFT));
        aliases.saveAndFlush(new SearchAlias("Draft category", "draft category", "en",
                SearchAliasTargetType.SUBJECT_CATEGORY, "DRAFT_CATEGORY", SearchAliasStatus.PUBLISHED));

        assertInvalidTarget("Draft category");
    }

    @Test
    void rejectsPublishedAliasWhenItsProgrammeTargetIsDraftOrArchived() {
        long category = category();
        long university = university();
        programme(university, category, "DRAFT_PROGRAMME", "DRAFT");
        programme(university, category, "ARCHIVED_PROGRAMME", "ARCHIVED");
        aliases.saveAndFlush(new SearchAlias("Draft programme", "draft programme", "en",
                SearchAliasTargetType.PROGRAMME, "DRAFT_PROGRAMME", SearchAliasStatus.PUBLISHED));
        aliases.saveAndFlush(new SearchAlias("Archived programme", "archived programme", "en",
                SearchAliasTargetType.PROGRAMME, "ARCHIVED_PROGRAMME", SearchAliasStatus.PUBLISHED));

        assertInvalidTarget("Draft programme");
        assertInvalidTarget("Archived programme");
    }

    @Test
    void acceptsRepeatedPublishedAliasesForTheSameValidTarget() {
        countries.saveAndFlush(new Country("GB", null, "United Kingdom", "EU"));
        aliases.saveAndFlush(new SearchAlias("UK", "uk", "en", SearchAliasTargetType.COUNTRY, "GB",
                SearchAliasStatus.PUBLISHED));
        aliases.saveAndFlush(new SearchAlias("UK", "uk", "zh", SearchAliasTargetType.COUNTRY, "GB",
                SearchAliasStatus.PUBLISHED));

        assertThat(resolver.resolve("UK")).extracting(result -> result.targetType(), result -> result.targetCode())
                .containsExactly(SearchAliasTargetType.COUNTRY, "GB");
    }

    private void assertInvalidTarget(String keyword) {
        assertThatThrownBy(() -> resolver.resolve(keyword))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                        assertThat(exception.getFieldErrors()).containsEntry("q", "alias target is unavailable"));
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbc;

    private long category() {
        return jdbc.queryForObject("""
                INSERT INTO subject_categories (code, name_en, status) VALUES ('ALIAS_CATEGORY', 'Alias category', 'PUBLISHED')
                RETURNING id
                """, Long.class);
    }

    private long university() {
        return jdbc.queryForObject("""
                INSERT INTO universities (name, slug, country, university_code, status)
                VALUES ('Alias university', 'alias-university', 'United Kingdom', 'ALIAS_UNIVERSITY', 'PUBLISHED')
                RETURNING id
                """, Long.class);
    }

    private void programme(long university, long category, String code, String status) {
        jdbc.update("""
                INSERT INTO programmes (university_id, subject_category_id, programme_code, slug, name_en, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """, university, category, code, code.toLowerCase(java.util.Locale.ROOT), code, status);
    }
}
