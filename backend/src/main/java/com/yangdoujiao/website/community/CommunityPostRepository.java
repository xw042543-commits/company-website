package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    Optional<CommunityPost> findByIdAndStatus(Long id, CommunityContentStatus status);

    List<CommunityPost> findByStatusOrderByPublishedAtDescIdDesc(CommunityContentStatus status, Pageable page);

    @Query("""
            select p from CommunityPost p where p.status = :status
              and (p.publishedAt < :timestamp or (p.publishedAt = :timestamp and p.id < :id))
            order by p.publishedAt desc, p.id desc
            """)
    List<CommunityPost> findLatestAfter(CommunityContentStatus status, OffsetDateTime timestamp, Long id, Pageable page);

    // Score = (1 + likes + 2 * comments) / (age in hours + 2)^1.5, rounded identically for sorting and cursors.
    @Query(value = """
            WITH ranked AS (
              SELECT id, published_at,
                round((1::numeric + like_count::numeric + 2 * comment_count::numeric)
                  / power(greatest(extract(epoch FROM (cast(:snapshot AS timestamptz) - published_at)) / 3600, 0) + 2, 1.5), 12) AS score
              FROM community_posts WHERE status = 'PUBLISHED' AND published_at <= :snapshot
            )
            SELECT id, score, published_at AS "publishedAt" FROM ranked
            WHERE cast(:score AS numeric) IS NULL OR score < :score
              OR (score = :score AND (published_at < :timestamp OR (published_at = :timestamp AND id < :id)))
            ORDER BY score DESC, published_at DESC, id DESC
            """, nativeQuery = true)
    List<HotPosition> findHotAfter(OffsetDateTime snapshot, BigDecimal score, OffsetDateTime timestamp, Long id, Pageable page);

    interface HotPosition {
        Long getId();
        BigDecimal getScore();
        java.time.Instant getPublishedAt();
    }
}
