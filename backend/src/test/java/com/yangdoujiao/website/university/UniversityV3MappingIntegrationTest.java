package com.yangdoujiao.website.university;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.catalog.CategoryStatus;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class UniversityV3MappingIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void readsLegacyUniversityWithV3Defaults() {
        Long universityId = jdbcTemplate.queryForObject("""
                INSERT INTO universities (name, slug, country, popular)
                VALUES ('University of Malaya', 'university-of-malaya-v3-test', 'Malaysia', TRUE)
                RETURNING id
                """, Long.class);

        entityManager.clear();

        University stored = universityRepository.findById(universityId).orElseThrow();

        assertThat(stored.getName()).isEqualTo("University of Malaya");
        assertThat(stored.getCountry()).isEqualTo("Malaysia");
        assertThat(stored.isPopular()).isTrue();
        assertThat(stored.getUniversityCode()).isNull();
        assertThat(stored.getNameZh()).isNull();
        assertThat(stored.getNameEn()).isNull();
        assertThat(stored.getCityZh()).isNull();
        assertThat(stored.getCityEn()).isNull();
        assertThat(stored.getDescriptionZh()).isNull();
        assertThat(stored.getDescriptionEn()).isNull();
        assertThat(stored.getCountryReference()).isNull();
        assertThat(stored.getStatus()).isEqualTo(CategoryStatus.DRAFT);
        assertThat(stored.getUpdatedAt()).isNotNull();
        assertThat(stored.getPublishedAt()).isNull();
    }
}
