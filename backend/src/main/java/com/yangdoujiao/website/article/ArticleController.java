package com.yangdoujiao.website.article;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.common.api.PageResponse;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    private final ArticleService service;

    public ArticleController(ArticleService service) {
        this.service = service;
    }

    @GetMapping("/{section}")
    public PageResponse<ArticleSummaryResponse> list(
            @PathVariable String section,
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String size
    ) {
        return service.list(section, page, size);
    }

    @GetMapping("/{section}/{slug}")
    public ArticleDetailResponse get(
            @PathVariable String section,
            @PathVariable String slug
    ) {
        return service.get(section, slug);
    }
}
