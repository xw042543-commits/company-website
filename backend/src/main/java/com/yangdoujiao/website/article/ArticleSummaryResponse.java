package com.yangdoujiao.website.article;

import java.time.OffsetDateTime;

public record ArticleSummaryResponse(
        String section,
        String slug,
        String titleZh,
        String titleEn,
        String summaryZh,
        String summaryEn,
        String coverPath,
        OffsetDateTime publishedAt
) {
    static ArticleSummaryResponse from(Article article) {
        return new ArticleSummaryResponse(
                article.getSection(),
                article.getSlug(),
                article.getTitleZh(),
                article.getTitleEn(),
                article.getSummaryZh(),
                article.getSummaryEn(),
                article.getCoverPath(),
                article.getPublishedAt()
        );
    }
}
