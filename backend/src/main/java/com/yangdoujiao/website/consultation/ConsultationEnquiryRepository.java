package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsultationEnquiryRepository extends JpaRepository<ConsultationEnquiry, Long>,
        JpaSpecificationExecutor<ConsultationEnquiry> {

    List<ConsultationEnquiry> findAllByUserAccountIdOrderByCreatedAtDescIdDesc(Long userAccountId);

    long countByUserAccountId(Long userAccountId);

    Optional<ConsultationEnquiry> findByReferenceCode(UUID referenceCode);

    Optional<ConsultationEnquiry> findByReferenceCodeAndUserAccountId(UUID referenceCode, Long userAccountId);

    long countByStatus(ConsultationStatus status);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update ConsultationEnquiry enquiry
               set enquiry.status = :status,
                   enquiry.statusUpdatedAt = :updatedAt,
                   enquiry.statusUpdatedByUserId = :actorId,
                   enquiry.version = enquiry.version + 1
             where enquiry.referenceCode = :referenceCode
               and enquiry.version = :expectedVersion
            """)
    int updateStatus(@Param("referenceCode") UUID referenceCode, @Param("status") ConsultationStatus status,
            @Param("updatedAt") OffsetDateTime updatedAt, @Param("actorId") long actorId,
            @Param("expectedVersion") long expectedVersion);
}
