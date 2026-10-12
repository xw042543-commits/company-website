package com.yangdoujiao.website.common.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class PageResponseTest {

    @Test
    void calculatesTotalPagesUsingOneBasedPublicPageNumber() {
        PageResponse<String> response = PageResponse.of(
                List.of("a", "b"),
                2,
                12,
                25
        );

        assertThat(response.page()).isEqualTo(2);
        assertThat(response.pageSize()).isEqualTo(12);
        assertThat(response.totalItems()).isEqualTo(25);
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.items()).containsExactly("a", "b");
    }

    @Test
    void reportsZeroPagesForAnEmptyResult() {
        PageResponse<String> response = PageResponse.of(List.of(), 1, 12, 0);

        assertThat(response.totalPages()).isZero();
    }

    @Test
    void rejectsInvalidPageArguments() {
        assertThatThrownBy(() -> PageResponse.of(List.of(), 0, 12, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PageResponse.of(List.of(), 1, 0, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PageResponse.of(List.of(), 1, 12, -1))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void canonicalConstructorCannotBypassPageInvariants() {
        assertThatThrownBy(() -> new PageResponse<>(List.of(), 0, 12, 0, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new PageResponse<>(List.of(), 1, 12, -1, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new PageResponse<>(List.of(), 1, 12, 25, 2))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
