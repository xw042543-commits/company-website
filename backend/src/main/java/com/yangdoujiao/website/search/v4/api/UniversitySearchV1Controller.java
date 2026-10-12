package com.yangdoujiao.website.search.v4.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.UniversitySearchV1Service;

@RestController
@RequestMapping("/api/v1/universities")
public class UniversitySearchV1Controller {

    private final UniversitySearchV1Service service;

    public UniversitySearchV1Controller(UniversitySearchV1Service service) {
        this.service = service;
    }

    @GetMapping("/search")
    public PageResponse<UniversitySearchItemResponse> search(@ModelAttribute UniversitySearchQuery query) {
        return service.search(query);
    }
}
