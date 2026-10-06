package com.yangdoujiao.website.consultation;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

interface ConsultationEnquiryRepository extends JpaRepository<ConsultationEnquiry, Long>,
        JpaSpecificationExecutor<ConsultationEnquiry> {

    Optional<ConsultationEnquiry> findByReferenceCode(UUID referenceCode);

    long countByStatus(ConsultationStatus status);
}
