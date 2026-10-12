package com.yangdoujiao.website.university;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.yangdoujiao.website.catalog.CategoryStatus;

public interface UniversityProfileSectionRepository extends JpaRepository<UniversityProfileSection, Long> {
    List<UniversityProfileSection> findAllByUniversity_IdAndStatusOrderBySortOrderAscIdAsc(
            Long universityId, CategoryStatus status);
}
