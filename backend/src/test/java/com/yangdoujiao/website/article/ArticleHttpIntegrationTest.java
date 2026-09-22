package com.yangdoujiao.website.article;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class ArticleHttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    @BeforeEach
    void cleanBefore() {
        deleteFixtures();
    }

    @AfterEach
    void deleteFixtures() {
        jdbc.update("DELETE FROM content_articles WHERE slug LIKE 'article-test-%'");
    }

    @Test
    void listsOnlyDuePublishedArticlesInStableOrderWithoutBodies() throws Exception {
        insert("article-test-older", "PUBLISHED", "2020-01-01T00:00:00Z");
        insert("article-test-newer", "PUBLISHED", "2020-01-01T00:00:00Z");
        insert("article-test-draft", "DRAFT", null);
        insert("article-test-archived", "ARCHIVED", "2020-01-01T00:00:00Z");
        insert("article-test-future", "PUBLISHED", "2999-01-01T00:00:00Z");

        mockMvc.perform(get("/api/v1/articles/news"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Trace-Id"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].slug").value("article-test-newer"))
                .andExpect(jsonPath("$.items[1].slug").value("article-test-older"))
                .andExpect(jsonPath("$.items[0].bodyMarkdownZh").doesNotExist())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(12))
                .andExpect(jsonPath("$.totalItems").value(2));
    }

    @Test
    void detailsReturnOriginalMarkdownAndMissingLanguageAsNull() throws Exception {
        insert("article-test-visible", "PUBLISHED", "2020-01-01T00:00:00Z");

        mockMvc.perform(get("/api/v1/articles/news/article-test-visible"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bodyMarkdownZh").value("# 测试正文"))
                .andExpect(jsonPath("$.titleEn").value(nullValue()))
                .andExpect(jsonPath("$.sourceUrl").value(nullValue()));
    }

    @Test
    void hidesDraftScheduledAndUnknownArticles() throws Exception {
        insert("article-test-draft", "DRAFT", null);
        insert("article-test-archived", "ARCHIVED", "2020-01-01T00:00:00Z");
        insert("article-test-future", "PUBLISHED", "2999-01-01T00:00:00Z");

        mockMvc.perform(get("/api/v1/articles/news/article-test-draft"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/articles/news/article-test-future"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/articles/news/article-test-archived"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/articles/unknown"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/articles/unknown/article-test-draft"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/articles/news/article-test-missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    void validatesPageAndReturnsEmptyPageWhenNothingIsPublished() throws Exception {
        mockMvc.perform(get("/api/v1/articles/news").queryParam("page", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.page").exists());
        mockMvc.perform(get("/api/v1/articles/news").queryParam("size", "49"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.size").exists());
        mockMvc.perform(get("/api/v1/articles/news")
                        .queryParam("page", "2147483647")
                        .queryParam("size", "48"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.page").exists());

        mockMvc.perform(get("/api/v1/articles/news"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalPages").value(0));
    }

    private void insert(String slug, String status, String publishedAt) {
        jdbc.update("""
                INSERT INTO content_articles (
                    section, slug, status, published_at, title_zh, body_markdown_zh
                ) VALUES (
                    'news', ?, ?, CAST(? AS TIMESTAMP WITH TIME ZONE), '测试标题', '# 测试正文'
                )
                """, slug, status, publishedAt);
    }
}
