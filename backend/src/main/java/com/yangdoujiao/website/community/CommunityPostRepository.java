package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    @Query("select p.authorAccountId from CommunityPost p where p.id=:id")
    Optional<Long> findAuthorIdById(Long id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from CommunityPost p where p.id = :id")
    Optional<CommunityPost> findLockedById(Long id);
    Optional<CommunityPost> findByIdAndStatus(Long id, CommunityContentStatus status);

    List<CommunityPost> findByStatusOrderByPublishedAtDescIdDesc(CommunityContentStatus status, Pageable page);

    @Query("""
            select p from CommunityPost p where p.status = :status
              and (p.publishedAt < :timestamp or (p.publishedAt = :timestamp and p.id < :id))
            order by p.publishedAt desc, p.id desc
            """)
    List<CommunityPost> findLatestAfter(CommunityContentStatus status, OffsetDateTime timestamp, Long id, Pageable page);

    // Freeze the initial ID order from an explainable, 12-decimal time-decay score.
    @Query(value = """
            WITH ranked AS (
              SELECT id, published_at,
                round((1::numeric + like_count::numeric + 2 * comment_count::numeric)
                  / power(greatest(extract(epoch FROM (cast(:snapshot AS timestamptz) - published_at)) / 3600, 0) + 2, 1.5), 12) AS score
              FROM community_posts WHERE status = 'PUBLISHED' AND published_at <= :snapshot
            )
            SELECT id FROM ranked
            ORDER BY score DESC, published_at DESC, id DESC
            """, nativeQuery = true)
    List<HotPosition> findHotRanking(OffsetDateTime snapshot, Pageable page);

    interface HotPosition {
        Long getId();
    }
}
