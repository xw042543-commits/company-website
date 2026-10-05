package com.yangdoujiao.website.programme;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yangdoujiao.website.catalog.CategoryStatus;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    boolean existsByProgrammeCodeAndStatus(String programmeCode, CategoryStatus status);

    Optional<Programme> findByProgrammeCode(String programmeCode);

    Optional<Programme> findByUniversityIdAndSlug(Long universityId, String slug);

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    @Query("""
            SELECT DISTINCT programme
            FROM Programme programme
            WHERE programme.id = :id
              AND programme.university.id = :universityId
              AND programme.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
            """)
    Optional<Programme> findPublishedDetailedByIdAndUniversityId(
            @Param("id") Long id,
            @Param("universityId") Long universityId
    );

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    @Query("""
            SELECT DISTINCT programme
            FROM Programme programme
            WHERE programme.slug = :slug
              AND programme.university.id = :universityId
              AND programme.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
            """)
    Optional<Programme> findPublishedDetailedBySlugAndUniversityId(
            @Param("slug") String slug,
            @Param("universityId") Long universityId
    );

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    List<Programme> findAllByUniversity_IdAndStatusOrderByIdAsc(Long universityId, CategoryStatus status);

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    @Query("""
            SELECT DISTINCT programme
            FROM Programme programme
            WHERE programme.id IN :ids
              AND programme.university.id = :universityId
              AND programme.university.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
              AND programme.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
            """)
    List<Programme> findPublishedDetailedByIdInAndUniversityId(
            @Param("ids") List<Long> ids,
            @Param("universityId") Long universityId
    );
}
