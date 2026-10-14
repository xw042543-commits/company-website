package com.yangdoujiao.website.university;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.catalog.CategoryStatus;

@Service
@Transactional(readOnly = true)
public class UniversityService {

    private final UniversityRepository universityRepository;

    public UniversityService(UniversityRepository universityRepository) {
        this.universityRepository = universityRepository;
    }

    public List<University> getAllUniversities() {
        return universityRepository.findAllByStatus(CategoryStatus.PUBLISHED);
    }

    @Cacheable(cacheNames = "popularUniversities")
    public List<University> getPopularUniversities() {
        return universityRepository.findByPopularTrueAndStatus(CategoryStatus.PUBLISHED);
    }
}
