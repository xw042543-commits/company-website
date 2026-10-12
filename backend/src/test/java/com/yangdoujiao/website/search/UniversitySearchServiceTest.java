package com.yangdoujiao.website.search;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.yangdoujiao.website.university.UniversityRepository;

@ExtendWith(MockitoExtension.class)
class UniversitySearchServiceTest {

    @Mock
    private UniversityRepository universityRepository;

    @Mock
    private UniversitySearchRepository universitySearchRepository;

    @Test
    void keepsMultiWordQueryTogetherAfterTrimmingWhitespace() {
        UniversitySearchDocument expected = new UniversitySearchDocument(
                "3",
                "University of Oxford",
                "university-of-oxford",
                "United Kingdom",
                false
        );
        when(universitySearchRepository.search("United Kingdom"))
                .thenReturn(List.of(expected));
        UniversitySearchService service = new UniversitySearchService(
                universityRepository,
                universitySearchRepository
        );

        List<UniversitySearchDocument> result = service.search("  United Kingdom  ");

        assertThat(result).containsExactly(expected);
    }
}
