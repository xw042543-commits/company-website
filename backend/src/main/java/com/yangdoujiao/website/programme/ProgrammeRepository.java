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
            WHERE programme.university.id = :universityId
              AND programme.slug = :slug
              AND programme.university.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
              AND programme.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
            """)
    Optional<Programme> findPublishedDetailedByUniversityIdAndSlug(
            @Param("universityId") Long universityId,
            @Param("slug") String slug
    );

    @EntityGraph(attributePaths = {"subjectCategory", "studyLevel", "courseMode", "languages"})
    @Query("""
            SELECT DISTINCT programme
            FROM Programme programme
            WHERE programme.university.id = :universityId
              AND programme.id = :programmeId
              AND programme.university.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
              AND programme.status = com.yangdoujiao.website.catalog.CategoryStatus.PUBLISHED
            """)
    Optional<Programme> findPublishedDetailedByUniversityIdAndId(
            @Param("universityId") Long universityId,
            @Param("programmeId") Long programmeId
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
