package com.yangdoujiao.website.search.v4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.context.TestConfiguration;
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
import com.yangdoujiao.website.catalog.CourseMode;
import com.yangdoujiao.website.catalog.CourseModeRepository;
import com.yangdoujiao.website.catalog.Language;
import com.yangdoujiao.website.catalog.LanguageRepository;
import com.yangdoujiao.website.catalog.StudyLevel;
import com.yangdoujiao.website.catalog.StudyLevelRepository;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({SearchFilterCodeValidator.class, SearchFilterCodeValidatorIntegrationTest.CacheConfiguration.class})
@Testcontainers
class SearchFilterCodeValidatorIntegrationTest {

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
            .withDatabaseName("search_filter_validator_test");

    @Autowired private SearchFilterCodeValidator validator;
    @Autowired private CountryRepository countries;
    @Autowired private SubjectCategoryRepository categories;
    @Autowired private StudyLevelRepository levels;
    @Autowired private CourseModeRepository modes;
    @Autowired private LanguageRepository languages;

    @Test
    void acceptsExistingCountryAndPublishedFilterCodes() {
        countries.save(new Country("GB", null, "United Kingdom", "EU"));
        categories.save(new SubjectCategory("COMPUTING", null, "Computing", null, 1, CategoryStatus.PUBLISHED));
        levels.save(new StudyLevel("MASTER", null, "Master", 1, CategoryStatus.PUBLISHED));
        modes.save(new CourseMode("ONLINE", null, "Online", 1, CategoryStatus.PUBLISHED));
        languages.save(new Language("EN", null, "English", 1, CategoryStatus.PUBLISHED));

        assertThatCode(() -> validator.validate(criteria(
                Set.of("COMPUTING"), Set.of("MASTER"), Set.of("GB"), Set.of("ONLINE"), Set.of("EN"))))
                .doesNotThrowAnyException();
    }

    @Test
    void aggregatesUnknownAndUnpublishedCodesAcrossAllFields() {
        countries.save(new Country("GB", null, "United Kingdom", "EU"));
        categories.save(new SubjectCategory("DRAFT_CATEGORY", null, "Draft", null, 1, CategoryStatus.DRAFT));
        levels.save(new StudyLevel("ARCHIVED_LEVEL", null, "Archived", 1, CategoryStatus.ARCHIVED));
        modes.save(new CourseMode("DRAFT_MODE", null, "Draft", 1, CategoryStatus.DRAFT));
        languages.save(new Language("ARCH_LANG", null, "Archived", 1, CategoryStatus.ARCHIVED));

        assertThatThrownBy(() -> validator.validate(criteria(
                Set.of("DRAFT_CATEGORY", "MISSING_CATEGORY"), Set.of("ARCHIVED_LEVEL"), Set.of("AU"),
                Set.of("DRAFT_MODE"), Set.of("ARCH_LANG"))))
                .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                        assertThat(exception.getFieldErrors()).containsOnlyKeys(
                                "category", "level", "country", "mode", "language"));
    }

    private static UniversitySearchCriteria criteria(
            Set<String> categories, Set<String> levels, Set<String> countries, Set<String> modes, Set<String> languages
    ) {
        return new UniversitySearchCriteria(null, categories, levels, countries, modes, languages,
                null, null, null, null, 1, 12);
    }
}
