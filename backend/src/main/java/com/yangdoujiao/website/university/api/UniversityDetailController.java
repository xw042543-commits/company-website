package com.yangdoujiao.website.university.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.api.UniversitySearchQuery;

@RestController
@RequestMapping("/api/v1/universities")
public class UniversityDetailController {

    private final UniversityDetailService universityDetailService;

    public UniversityDetailController(UniversityDetailService universityDetailService) {
        this.universityDetailService = universityDetailService;
    }

    @GetMapping("/{slug}")
    public UniversityDetailResponse getUniversity(@PathVariable String slug) {
        return universityDetailService.getPublishedBySlug(slug);
    }

    @GetMapping("/{slug}/programmes")
    public PageResponse<UniversityProgrammeResponse> getProgrammes(
            @PathVariable String slug,
            @ModelAttribute UniversitySearchQuery query
    ) {
        return universityDetailService.getPublishedProgrammes(slug, query);
    }
}
