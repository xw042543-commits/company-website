package com.yangdoujiao.website.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectCategoryRepository extends JpaRepository<SubjectCategory, Long> {

    boolean existsByCodeAndStatus(String code, CategoryStatus status);

    Optional<SubjectCategory> findByCode(String code);

    List<SubjectCategory> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
}
