package com.yangdoujiao.website.search;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@Validated
public class SearchController {

    private final UniversitySearchService universitySearchService;

    public SearchController(UniversitySearchService universitySearchService) {
        this.universitySearchService = universitySearchService;
    }

    @GetMapping("/api/search")
    public List<UniversitySearchResponse> search(
            @RequestParam("q")
            @NotBlank(message = "Search query must not be blank")
            @Size(max = 100, message = "Search query must not exceed 100 characters")
            String query
    ) {
        return universitySearchService.search(query).stream()
                .map(UniversitySearchResponse::from)
                .toList();
    }
}
