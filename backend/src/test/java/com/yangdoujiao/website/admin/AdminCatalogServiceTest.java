package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.common.exception.ApiException;

class AdminCatalogServiceTest {
    private AdminCatalogRepository repository;
    private AdminCatalogService service;

    @BeforeEach
    void setUp() {
        repository = mock(AdminCatalogRepository.class);
        service = new AdminCatalogService(repository);
    }

    @Test
    void createsEnabledUniversityAndQueuesSearchRefresh() {
        UniversityInput input = new UniversityInput("TEST_U", "test-university", "测试大学", "Test University", "MY",
                "吉隆坡", "Kuala Lumpur", "简介", "Description", "https://example.edu", "https://example.edu/logo.png");
        UniversityItem saved = university(8L, "PUBLISHED");
        when(repository.countryExists("MY")).thenReturn(true);
        when(repository.createUniversity(input)).thenReturn(8L);
        when(repository.university(8L)).thenReturn(saved);

        service.createUniversity(input);

        verify(repository).replaceLogo(8L, input.logoUrl(), input.officialUrl());
        verify(repository).enqueue(8L);
    }

    @Test
    void disablingUniversityArchivesWithoutTouchingProgrammesOrHistory() {
        when(repository.setUniversityStatus(8L, false)).thenReturn(1);
        when(repository.university(8L)).thenReturn(university(8L, "ARCHIVED"));

        service.setUniversityStatus(8L, false);

        verify(repository).setUniversityStatus(8L, false);
        verify(repository).enqueue(8L);
        verify(repository).university(8L);
        verifyNoMoreInteractions(repository);
    }

    @Test
    void rejectsUnknownRelationsAndUnsafeUrlsBeforeWriting() {
        UniversityInput university = new UniversityInput("TEST_U", "test-university", "测试大学", null, "MY",
                null, null, null, null, "javascript:alert(1)", null);
        when(repository.countryExists("MY")).thenReturn(true);
        assertThatThrownBy(() -> service.createUniversity(university))
                .isInstanceOf(ApiException.class).hasMessageContaining("HTTP(S)");
        verify(repository, never()).createUniversity(any());

        ProgrammeInput programme = new ProgrammeInput("TEST_P", 99L, "test-programme", "测试专业", null,
                1L, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        when(repository.universityExists(99L)).thenReturn(false);
        assertThatThrownBy(() -> service.createProgramme(programme))
                .isInstanceOf(ApiException.class).hasMessageContaining("University");
        verify(repository, never()).createProgramme(any());
    }

    @Test
    void normalizesCountryAndCombinesItWithExistingFilters() {
        service.universities("  university  ", "PUBLISHED", " my ", 2, 20);
        verify(repository).universities("university", "PUBLISHED", "MY", 2, 20);
        service.programmes("  computing  ", 8L, "ARCHIVED", " sg ", 3, 20);
        verify(repository).programmes("computing", 8L, "ARCHIVED", "SG", 3, 20);
    }

    @Test
    void emptyCountryPreservesUnfilteredQueriesAndInvalidCodesAreRejected() {
        service.universities("", "", "", 1, 20);
        verify(repository).universities("", "", "", 1, 20);
        assertThatThrownBy(() -> service.universities("", "", "Malaysia", 1, 20))
                .isInstanceOf(ApiException.class).hasMessageContaining("两位国家代码");
        assertThatThrownBy(() -> service.programmes("", null, "", "MY' OR 1=1", 1, 20))
                .isInstanceOf(ApiException.class);
        verify(repository, never()).programmes(anyString(), any(), anyString(), anyString(), anyInt(), anyInt());
    }

    private static UniversityItem university(long id, String status) {
        return new UniversityItem(id, "TEST_U", "test-university", "测试大学", "Test University", "MY",
                "马来西亚", "Malaysia", "吉隆坡", "Kuala Lumpur", null, null, "https://example.edu",
                null, status, 2, OffsetDateTime.now());
    }
}
