package com.yangdoujiao.website.programme;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammeIntakeRepository extends JpaRepository<ProgrammeIntake, Long> {

    List<ProgrammeIntake> findByProgrammeIdOrderByIntakeDateAsc(Long programmeId);

    List<ProgrammeIntake> findAllByProgramme_IdInOrderByIntakeDateAsc(Collection<Long> ids);
}
