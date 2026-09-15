package com.yangdoujiao.website.catalog;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyLevelRepository extends JpaRepository<StudyLevel, Long> {

    Optional<StudyLevel> findByCode(String code);
}
