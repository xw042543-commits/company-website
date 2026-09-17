package com.yangdoujiao.website.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LanguageRepository extends JpaRepository<Language, Long> {

    boolean existsByCodeAndStatus(String code, CategoryStatus status);

    Optional<Language> findByCode(String code);

    List<Language> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
}
