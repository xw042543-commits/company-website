package com.yangdoujiao.website.university;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UniversityRepository extends JpaRepository<University, Long> {

    List<University> findByPopularTrue();
}
