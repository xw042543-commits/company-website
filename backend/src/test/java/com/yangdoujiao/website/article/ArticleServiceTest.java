package com.yangdoujiao.website.article;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.search.v4.SearchValidationException;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository repository;

    @Test
    void emptyListUsesSafeDefaultPagination() {
        when(repository.findPublicList(eq("news"), any(), any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 12), 0));

        var result = new ArticleService(repository).list("news", null, null);

        assertThat(result.items()).isEmpty();
        assertThat(result.page()).isEqualTo(1);
        assertThat(result.pageSize()).isEqualTo(12);
        assertThat(result.totalItems()).isZero();
    }

    @Test
    void rejectsInvalidPageSizeAndOffset() {
        ArticleService service = new ArticleService(repository);

        assertThatThrownBy(() -> service.list("news", "0", "12"))
                .isInstanceOf(SearchValidationException.class);
        assertThatThrownBy(() -> service.list("news", "1", "49"))
                .isInstanceOf(SearchValidationException.class);
        assertThatThrownBy(() -> service.list("news", "abc", "12"))
                .isInstanceOf(SearchValidationException.class);
        assertThatThrownBy(() -> service.list("news", "2147483647", "48"))
                .isInstanceOf(SearchValidationException.class);
    }

    @Test
    void rejectsUnknownSectionForListAndDetail() {
        ArticleService service = new ArticleService(repository);

        assertThatThrownBy(() -> service.list("unknown", null, null))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> service.get("unknown", "any-slug"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
