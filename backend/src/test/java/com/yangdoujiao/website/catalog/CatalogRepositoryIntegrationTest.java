package com.yangdoujiao.website.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class CatalogRepositoryIntegrationTest {

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private SubjectCategoryRepository subjectCategoryRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void savesAndFindsCountryByStableCode() {
        Country country = new Country("MY", "马来西亚", "Malaysia", "ASIA");

        countryRepository.saveAndFlush(country);

        Country stored = countryRepository.findByCode("MY").orElseThrow();
        assertThat(stored.getId()).isNotNull();
        assertThat(stored.getNameZh()).isEqualTo("马来西亚");
        assertThat(stored.getNameEn()).isEqualTo("Malaysia");
        assertThat(stored.getContinentCode()).isEqualTo("ASIA");
    }

    @Test
    void savesAndFindsParentChildCategoriesByStableCode() {
        SubjectCategory parent = subjectCategoryRepository.saveAndFlush(
                new SubjectCategory(
                        "BUSINESS",
                        "商业与管理",
                        "Business and Management",
                        null,
                        0,
                        CategoryStatus.PUBLISHED
                )
        );
        subjectCategoryRepository.saveAndFlush(
                new SubjectCategory(
                        "ACCOUNTING",
                        "会计",
                        "Accounting",
                        parent,
                        10,
                        CategoryStatus.PUBLISHED
                )
        );

        entityManager.clear();

        SubjectCategory stored = subjectCategoryRepository
                .findByCode("ACCOUNTING")
                .orElseThrow();

        assertThat(stored.getParent()).isNotSameAs(parent);
        assertThat(stored.getParent().getCode()).isEqualTo("BUSINESS");
        assertThat(stored.getSortOrder()).isEqualTo(10);
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.PUBLISHED);
    }
}
