package com.yangdoujiao.website.university;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    private final UniversityService universityService;

    public UniversityController(UniversityService universityService) {
        this.universityService = universityService;
    }

    @GetMapping
    public List<UniversityResponse> getAllUniversities() {
        return universityService.getAllUniversities().stream()
                .map(UniversityResponse::from)
                .toList();
    }

    @GetMapping("/popular")
    public List<UniversityResponse> getPopularUniversities() {
        return universityService.getPopularUniversities().stream()
                .map(UniversityResponse::from)
                .toList();
    }
}
