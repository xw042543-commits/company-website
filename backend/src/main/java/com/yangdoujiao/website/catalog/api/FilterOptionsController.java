package com.yangdoujiao.website.catalog.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalog")
public class FilterOptionsController {

    private final FilterOptionsService service;

    public FilterOptionsController(FilterOptionsService service) {
        this.service = service;
    }

    @GetMapping("/filter-options")
    public FilterOptionsResponse getFilterOptions() {
        return service.getPublishedOptions();
    }
}
