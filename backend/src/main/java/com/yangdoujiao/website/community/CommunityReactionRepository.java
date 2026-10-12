package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CommunityReactionRepository extends JpaRepository<CommunityReaction, Long> {
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = """
            INSERT INTO community_reactions(account_id, target_type, target_id)
            VALUES (:accountId, :type, :targetId)
            ON CONFLICT (account_id, target_type, target_id) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(Long accountId, String type, Long targetId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("delete from CommunityReaction r where r.accountId = :accountId and r.targetType = :type and r.targetId = :targetId")
    int deleteOwned(Long accountId, CommunityTargetType type, Long targetId);

    long countByTargetTypeAndTargetId(CommunityTargetType type, Long targetId);

    @Query("""
            select r.targetId from CommunityReaction r where r.accountId = :accountId
              and r.targetType = :type and r.targetId in :ids
            """)
    List<Long> findLikedTargetIds(Long accountId, CommunityTargetType type, List<Long> ids);
}
