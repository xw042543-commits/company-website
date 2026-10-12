package com.yangdoujiao.website.article;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.search.v4.SearchValidationException;

@Service
public class ArticleService {

    private static final Set<String> SECTIONS = Set.of(
            "language", "scholarships", "programmes", "news"
    );

    private static final Sort PUBLIC_ORDER = Sort.by(
            Sort.Order.desc("publishedAt"),
            Sort.Order.desc("id")
    );

    private final ArticleRepository repository;

    public ArticleService(ArticleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ArticleSummaryResponse> list(String section, String pageValue, String sizeValue) {
        requireSection(section);
        int page = parsePositive(pageValue, 1, "page", Integer.MAX_VALUE);
        int size = parsePositive(sizeValue, 12, "size", 48);
        if ((long) (page - 1) * size > Integer.MAX_VALUE) {
            throw new SearchValidationException(Map.of("page", "page offset is too large"));
        }

        Page<Article> results = repository.findPublicList(
                section,
                OffsetDateTime.now(ZoneOffset.UTC),
                PageRequest.of(page - 1, size, PUBLIC_ORDER)
        );
        List<ArticleSummaryResponse> items = results.getContent().stream()
                .map(ArticleSummaryResponse::from)
                .toList();
        return PageResponse.of(items, page, size, results.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ArticleDetailResponse get(String section, String slug) {
        requireSection(section);
        Article article = repository.findPublicDetail(
                        section, slug, OffsetDateTime.now(ZoneOffset.UTC))
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        return ArticleDetailResponse.from(article);
    }

    private void requireSection(String section) {
        if (!SECTIONS.contains(section)) {
            throw new ResourceNotFoundException("Article section not found");
        }
    }

    private int parsePositive(String value, int defaultValue, String field, int maximum) {
        if (value == null) {
            return defaultValue;
        }
        try {
            int parsed = Integer.parseInt(value);
            if (parsed >= 1 && parsed <= maximum) {
                return parsed;
            }
        } catch (NumberFormatException ignored) {
            // Invalid user input is reported below with the same public error shape.
        }
        throw new SearchValidationException(Map.of(field, "must be between 1 and " + maximum));
    }
}
