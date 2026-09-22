package com.yangdoujiao.website.article;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "content_articles")
@Getter
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String section;

    @Column(nullable = false, length = 180)
    private String slug;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "title_zh", length = 300)
    private String titleZh;

    @Column(name = "title_en", length = 300)
    private String titleEn;

    @Column(name = "summary_zh", columnDefinition = "TEXT")
    private String summaryZh;

    @Column(name = "summary_en", columnDefinition = "TEXT")
    private String summaryEn;

    @Column(name = "body_markdown_zh", columnDefinition = "TEXT")
    private String bodyMarkdownZh;

    @Column(name = "body_markdown_en", columnDefinition = "TEXT")
    private String bodyMarkdownEn;

    @Column(name = "cover_path", length = 500)
    private String coverPath;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(name = "author_name", length = 200)
    private String authorName;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Article() {
    }
}
