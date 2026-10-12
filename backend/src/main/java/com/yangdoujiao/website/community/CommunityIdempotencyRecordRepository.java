package com.yangdoujiao.website.community;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityIdempotencyRecordRepository extends JpaRepository<CommunityIdempotencyRecord, Long> {
    java.util.Optional<CommunityIdempotencyRecord> findByAccountIdAndOperationTypeAndIdempotencyKey(
            Long accountId, String operationType, String idempotencyKey);
}
