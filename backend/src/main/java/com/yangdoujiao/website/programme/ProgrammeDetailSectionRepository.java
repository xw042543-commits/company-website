package com.yangdoujiao.website.programme;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yangdoujiao.website.catalog.CategoryStatus;

public interface ProgrammeDetailSectionRepository extends JpaRepository<ProgrammeDetailSection, Long> {

    List<ProgrammeDetailSection> findAllByProgramme_IdAndStatusOrderBySortOrderAscIdAsc(
            Long programmeId,
            CategoryStatus status
    );
}
