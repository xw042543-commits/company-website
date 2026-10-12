package com.yangdoujiao.website.article;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class ArticleSchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("DELETE FROM content_articles WHERE slug LIKE 'article-test-%'");
    }

    @Test
    void acceptsOneCompleteLanguageAndAllowsSameSlugInDifferentSections() {
        insert("language", "article-test-shared", "DRAFT", null,
                "中文标题", null, "中文正文", null, null, null);
        insert("news", "article-test-shared", "DRAFT", null,
                null, "English title", null, "English body", null, null);

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM content_articles WHERE slug = 'article-test-shared'",
                Integer.class
        );
        assertThat(count).isEqualTo(2);
    }

    @Test
    void rejectsDuplicateSlugWithinTheSameSection() {
        insert("news", "article-test-duplicate", "DRAFT", null,
                "标题", null, "正文", null, null, null);

        assertThatThrownBy(() -> insert("news", "article-test-duplicate", "DRAFT", null,
                "另一标题", null, "另一正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsUnknownSectionAndStatus() {
        assertThatThrownBy(() -> insert("unknown", "article-test-section", "DRAFT", null,
                "标题", null, "正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-status", "UNKNOWN", null,
                "标题", null, "正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsIncompleteOrMissingLanguageContent() {
        assertThatThrownBy(() -> insert("news", "article-test-title-only", "DRAFT", null,
                "标题", null, null, null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-body-only", "DRAFT", null,
                null, null, "正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-no-content", "DRAFT", null,
                null, null, null, null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-blank-content", "DRAFT", null,
                "  ", null, "  ", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-second-language", "DRAFT", null,
                "中文标题", "English title", "中文正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsMalformedSlug() {
        assertThatThrownBy(() -> insert("news", "article-test-Bad_Slug", "DRAFT", null,
                "标题", null, "正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsPublishedArticleWithoutPublicationTime() {
        assertThatThrownBy(() -> insert("news", "article-test-no-time", "PUBLISHED", null,
                "标题", null, "正文", null, null, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsUnsafeSourceAndCoverPaths() {
        assertThatThrownBy(() -> insert("news", "article-test-http", "DRAFT", null,
                "标题", null, "正文", null, "http://example.com", null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert("news", "article-test-traversal", "DRAFT", null,
                "标题", null, "正文", null, null, "/content/../private.png"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private void insert(
            String section,
            String slug,
            String status,
            String publishedAt,
            String titleZh,
            String titleEn,
            String bodyZh,
            String bodyEn,
            String sourceUrl,
            String coverPath
    ) {
        jdbc.update("""
                INSERT INTO content_articles (
                    section, slug, status, published_at,
                    title_zh, title_en, body_markdown_zh, body_markdown_en,
                    source_url, cover_path
                ) VALUES (?, ?, ?, CAST(? AS TIMESTAMP WITH TIME ZONE), ?, ?, ?, ?, ?, ?)
                """, section, slug, status, publishedAt,
                titleZh, titleEn, bodyZh, bodyEn, sourceUrl, coverPath);
    }
}
