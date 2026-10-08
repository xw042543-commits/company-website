package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "community_idempotency_records")
@Getter
@Immutable
public class CommunityIdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false, updatable = false)
    private Long accountId;

    @Column(name = "operation_type", nullable = false, length = 30, updatable = false)
    private String operationType;

    @Column(name = "idempotency_key", nullable = false, length = 64, updatable = false)
    private String idempotencyKey;

    @Column(name = "request_hash", nullable = false, length = 64, updatable = false)
    private String requestHash;

    @Column(name = "result_target_id", nullable = false, updatable = false)
    private Long resultTargetId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected CommunityIdempotencyRecord() {
    }

    static CommunityIdempotencyRecord create(Long accountId, String operationType, String idempotencyKey,
            String requestHash, Long resultTargetId, OffsetDateTime now) {
        CommunityIdempotencyRecord record = new CommunityIdempotencyRecord();
        record.accountId = accountId;
        record.operationType = operationType;
        record.idempotencyKey = idempotencyKey;
        record.requestHash = requestHash;
        record.resultTargetId = resultTargetId;
        record.createdAt = now;
        return record;
    }
}
