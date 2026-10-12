package com.yangdoujiao.website.miniapp;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface MiniappProgrammeFavoriteRepository extends JpaRepository<MiniappProgrammeFavorite, Long> {
    List<MiniappProgrammeFavorite> findAllByUserAccountIdOrderByCreatedAtDescIdDesc(Long userAccountId);
    Optional<MiniappProgrammeFavorite> findByUserAccountIdAndProgrammeId(Long userAccountId, Long programmeId);
    long countByUserAccountId(Long userAccountId);
    void deleteByUserAccountIdAndProgrammeId(Long userAccountId, Long programmeId);
}
