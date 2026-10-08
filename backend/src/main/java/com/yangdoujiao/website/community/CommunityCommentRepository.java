package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.util.List;

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

    List<CommunityComment> findByPostIdAndStatusAndParentCommentIdInOrderByCreatedAtAscIdAsc(
            Long postId, CommunityContentStatus status, List<Long> parents);
}
