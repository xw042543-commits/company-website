package com.yangdoujiao.website.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class CatalogSchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayCreatesCatalogTables() {
        assertThat(tableExists("countries")).isTrue();
        assertThat(tableExists("subject_categories")).isTrue();
    }

    @Test
    void acceptsValidCountryAndParentChildCategories() {
        jdbcTemplate.update("""
                INSERT INTO countries (code, name_zh, name_en, continent_code)
                VALUES ('MY', '马来西亚', 'Malaysia', 'ASIA')
                """);

        Long parentId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (code, name_zh, name_en, status)
                VALUES ('BUSINESS', '商业与管理', 'Business and Management', 'PUBLISHED')
                RETURNING id
                """, Long.class);

        Long childId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (
                    code, name_zh, name_en, parent_id, sort_order, status
                )
                VALUES ('ACCOUNTING', '会计', 'Accounting', ?, 10, 'PUBLISHED')
                RETURNING id
                """, Long.class, parentId);

        Long storedParentId = jdbcTemplate.queryForObject(
                "SELECT parent_id FROM subject_categories WHERE id = ?",
                Long.class,
                childId
        );
        assertThat(storedParentId).isEqualTo(parentId);
    }

    @Test
    void rejectsInvalidCountryCode() {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO countries (code, name_en, continent_code)
                VALUES ('my', 'Malaysia', 'ASIA')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsCountryWithoutAnyName() {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO countries (code, continent_code)
                VALUES ('MY', 'ASIA')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsInvalidCategoryStatus() {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO subject_categories (code, name_en, status)
                VALUES ('BUSINESS', 'Business', 'UNKNOWN')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsNegativeCategorySortOrder() {
        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO subject_categories (code, name_en, sort_order, status)
                VALUES ('BUSINESS', 'Business', -1, 'DRAFT')
                """))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsCategoryAsItsOwnParent() {
        Long categoryId = jdbcTemplate.queryForObject("""
                INSERT INTO subject_categories (code, name_en, status)
                VALUES ('BUSINESS', 'Business', 'DRAFT')
                RETURNING id
                """, Long.class);

        assertThatThrownBy(() -> jdbcTemplate.update(
                "UPDATE subject_categories SET parent_id = ? WHERE id = ?",
                categoryId,
                categoryId
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    private boolean tableExists(String tableName) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass('public.' || ?) IS NOT NULL",
                Boolean.class,
                tableName
        );
        return Boolean.TRUE.equals(exists);
    }
}
