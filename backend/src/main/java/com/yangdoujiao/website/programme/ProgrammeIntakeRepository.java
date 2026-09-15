package com.yangdoujiao.website.programme;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammeIntakeRepository extends JpaRepository<ProgrammeIntake, Long> {

    List<ProgrammeIntake> findByProgrammeIdOrderByIntakeDateAsc(Long programmeId);
}
