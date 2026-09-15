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
        validateArguments(page, pageSize, totalItems);

        int expectedTotalPages = calculateTotalPages(totalItems, pageSize);
        if (totalPages != expectedTotalPages) {
            throw new IllegalArgumentException("totalPages does not match totalItems and pageSize");
        }
    }

    public static <T> PageResponse<T> of(
            List<T> items,
            int page,
            int pageSize,
            long totalItems
    ) {
        validateArguments(page, pageSize, totalItems);

        int totalPages = calculateTotalPages(totalItems, pageSize);
        return new PageResponse<>(items, page, pageSize, totalItems, totalPages);
    }

    private static void validateArguments(int page, int pageSize, long totalItems) {
        if (page < 1) {
            throw new IllegalArgumentException("page must be at least 1");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize must be at least 1");
        }
        if (totalItems < 0) {
            throw new IllegalArgumentException("totalItems must not be negative");
        }
    }

    private static int calculateTotalPages(long totalItems, int pageSize) {
        return totalItems == 0
                ? 0
                : Math.toIntExact(((totalItems - 1) / pageSize) + 1);
    }
}
