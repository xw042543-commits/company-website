package com.yangdoujiao.website.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyLevelRepository extends JpaRepository<StudyLevel, Long> {

    boolean existsByCodeAndStatus(String code, CategoryStatus status);

    Optional<StudyLevel> findByCode(String code);

    List<StudyLevel> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
}
