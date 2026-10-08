package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    List<CommunityComment> findByPostIdAndStatusAndParentCommentIdIsNullOrderByCreatedAtAscIdAsc(
            Long postId, CommunityContentStatus status, Pageable page);

    @Query("""
            select c from CommunityComment c where c.postId = :postId and c.status = :status
              and c.parentCommentId is null
              and (c.createdAt > :timestamp or (c.createdAt = :timestamp and c.id > :id))
            order by c.createdAt, c.id
            """)
    List<CommunityComment> findTopLevelAfter(Long postId, CommunityContentStatus status,
            OffsetDateTime timestamp, Long id, Pageable page);

    @Query(value = """
            SELECT reply.* FROM community_comments root
            JOIN LATERAL (
              SELECT c.* FROM community_comments c
              WHERE c.post_id = :postId AND c.parent_comment_id = root.id AND c.status = 'PUBLISHED'
              ORDER BY c.created_at, c.id LIMIT :limit
            ) reply ON true
            WHERE root.post_id = :postId AND root.id IN (:parents)
            ORDER BY reply.created_at, reply.id
            """, nativeQuery = true)
    List<CommunityComment> findFirstReplies(Long postId, List<Long> parents, int limit);

    Optional<CommunityComment> findByIdAndPostIdAndStatusAndParentCommentIdIsNull(
            Long id, Long postId, CommunityContentStatus status);

    List<CommunityComment> findByPostIdAndParentCommentIdAndStatusOrderByCreatedAtAscIdAsc(
            Long postId, Long parentId, CommunityContentStatus status, Pageable page);

    @Query("""
            select c from CommunityComment c where c.postId = :postId and c.parentCommentId = :parentId and c.status = :status
              and (c.createdAt > :timestamp or (c.createdAt = :timestamp and c.id > :id))
            order by c.createdAt, c.id
            """)
    List<CommunityComment> findRepliesAfter(Long postId, Long parentId, CommunityContentStatus status,
            OffsetDateTime timestamp, Long id, Pageable page);
}
