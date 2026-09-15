package com.yangdoujiao.website.programme;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    Optional<Programme> findByProgrammeCode(String programmeCode);

    Optional<Programme> findByUniversityIdAndSlug(Long universityId, String slug);
}
