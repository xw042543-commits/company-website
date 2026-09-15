package com.yangdoujiao.website.common.api;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int pageSize,
        long totalItems,
        int totalPages
) {
    public PageResponse {
        items = List.copyOf(items);
    }

    public static <T> PageResponse<T> of(
            List<T> items,
            int page,
            int pageSize,
            long totalItems
    ) {
        if (page < 1) {
            throw new IllegalArgumentException("page must be at least 1");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize must be at least 1");
        }
        if (totalItems < 0) {
            throw new IllegalArgumentException("totalItems must not be negative");
        }

        int totalPages = totalItems == 0
                ? 0
                : Math.toIntExact(((totalItems - 1) / pageSize) + 1);

        return new PageResponse<>(items, page, pageSize, totalItems, totalPages);
    }
}
