package com.yangdoujiao.website.miniapp;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface MiniappStudyPlanRepository extends JpaRepository<MiniappStudyPlan, Long> {
    List<MiniappStudyPlan> findAllByUserAccountIdOrderByUpdatedAtDescIdDesc(Long userAccountId);
    Optional<MiniappStudyPlan> findByIdAndUserAccountId(Long id, Long userAccountId);
    long countByUserAccountId(Long userAccountId);
}
