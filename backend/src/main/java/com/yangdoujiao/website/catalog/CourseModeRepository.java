package com.yangdoujiao.website.catalog;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModeRepository extends JpaRepository<CourseMode, Long> {

    Optional<CourseMode> findByCode(String code);
}
