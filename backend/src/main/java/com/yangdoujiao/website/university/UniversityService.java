package com.yangdoujiao.website.university;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UniversityService {

    private final UniversityRepository universityRepository;

    public UniversityService(UniversityRepository universityRepository) {
        this.universityRepository = universityRepository;
    }

    public List<University> getAllUniversities() {
        return universityRepository.findAll();
    }

    @Cacheable(cacheNames = "popularUniversities")
    public List<University> getPopularUniversities() {
        return universityRepository.findByPopularTrue();
    }
}
