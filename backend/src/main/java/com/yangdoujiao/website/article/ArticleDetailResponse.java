package com.yangdoujiao.website.article;

import java.time.OffsetDateTime;

public record ArticleDetailResponse(
        String section,
        String slug,
        String titleZh,
        String titleEn,
        String summaryZh,
        String summaryEn,
        String coverPath,
        OffsetDateTime publishedAt,
        String bodyMarkdownZh,
        String bodyMarkdownEn,
        String sourceName,
        String sourceUrl,
        String authorName
) {
    static ArticleDetailResponse from(Article article) {
        return new ArticleDetailResponse(
                article.getSection(),
                article.getSlug(),
                article.getTitleZh(),
                article.getTitleEn(),
                article.getSummaryZh(),
                article.getSummaryEn(),
                article.getCoverPath(),
                article.getPublishedAt(),
                article.getBodyMarkdownZh(),
                article.getBodyMarkdownEn(),
                article.getSourceName(),
                article.getSourceUrl(),
                article.getAuthorName()
        );
    }
}
