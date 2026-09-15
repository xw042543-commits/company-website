package com.yangdoujiao.website.catalog;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectCategoryRepository extends JpaRepository<SubjectCategory, Long> {

    Optional<SubjectCategory> findByCode(String code);
}
