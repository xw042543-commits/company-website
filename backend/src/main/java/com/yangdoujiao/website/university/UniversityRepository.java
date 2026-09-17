package com.yangdoujiao.website.university;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.yangdoujiao.website.catalog.CategoryStatus;

public interface UniversityRepository extends JpaRepository<University, Long> {

    List<University> findByPopularTrue();

    @EntityGraph(attributePaths = "countryReference")
    Optional<University> findByIdAndStatus(Long id, CategoryStatus status);
}
