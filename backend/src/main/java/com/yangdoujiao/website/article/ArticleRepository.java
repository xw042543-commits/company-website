package com.yangdoujiao.website.article;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    @Query("""
            SELECT a FROM Article a
            WHERE a.section = :section
              AND a.status = 'PUBLISHED'
              AND a.publishedAt <= :now
            """)
    Page<Article> findPublicList(
            @Param("section") String section,
            @Param("now") OffsetDateTime now,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Article a
            WHERE a.section = :section
              AND a.slug = :slug
              AND a.status = 'PUBLISHED'
              AND a.publishedAt <= :now
            """)
    Optional<Article> findPublicDetail(
            @Param("section") String section,
            @Param("slug") String slug,
            @Param("now") OffsetDateTime now
    );
}
