package com.yangdoujiao.website.programme;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.yangdoujiao.website.catalog.CategoryStatus;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    Optional<Programme> findByProgrammeCode(String programmeCode);

    Optional<Programme> findByUniversityIdAndSlug(Long universityId, String slug);

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    List<Programme> findAllByUniversity_IdAndStatusOrderByIdAsc(Long universityId, CategoryStatus status);
}
