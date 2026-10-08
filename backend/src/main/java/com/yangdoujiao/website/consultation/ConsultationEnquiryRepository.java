package com.yangdoujiao.website.consultation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationEnquiryRepository extends JpaRepository<ConsultationEnquiry, Long> {
    List<ConsultationEnquiry> findAllByUserAccountIdOrderByCreatedAtDescIdDesc(Long userAccountId);
    long countByUserAccountId(Long userAccountId);
}
