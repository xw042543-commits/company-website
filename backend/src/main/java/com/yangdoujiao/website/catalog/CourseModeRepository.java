package com.yangdoujiao.website.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModeRepository extends JpaRepository<CourseMode, Long> {

    boolean existsByCodeAndStatus(String code, CategoryStatus status);

    Optional<CourseMode> findByCode(String code);

    List<CourseMode> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
}
