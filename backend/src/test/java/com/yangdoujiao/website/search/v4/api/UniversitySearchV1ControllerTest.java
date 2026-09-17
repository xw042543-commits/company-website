package com.yangdoujiao.website.search.v4.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.SearchServiceUnavailableException;
import com.yangdoujiao.website.search.v4.SearchValidationException;
import com.yangdoujiao.website.search.v4.UniversitySearchV1Service;

@WebMvcTest(UniversitySearchV1Controller.class)
class UniversitySearchV1ControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private UniversitySearchV1Service service;
    @MockitoBean private CacheManager cacheManager;

    @Test
    void bindsRepeatedParametersAndUsesDefaults() throws Exception {
        when(service.search(any())).thenReturn(PageResponse.of(List.of(), 1, 12, 0));

        mockMvc.perform(get("/api/v1/universities/search")
                        .queryParam("category", "COMPUTING", "BUSINESS")
                        .queryParam("country", "GB", "AU"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(12))
                .andExpect(jsonPath("$.items").isEmpty());
        ArgumentCaptor<UniversitySearchQuery> query = ArgumentCaptor.forClass(UniversitySearchQuery.class);
        verify(service).search(query.capture());
        assertThat(query.getValue().getCategory()).containsExactly("COMPUTING", "BUSINESS");
        assertThat(query.getValue().getCountry()).containsExactly("GB", "AU");
        assertThat(query.getValue().getPage()).isEqualTo("1");
        assertThat(query.getValue().getSize()).isEqualTo("12");
    }

    @Test
    void returnsMappedPageAndNeverExposesMoreThanThreeProgrammes() throws Exception {
        MatchedProgrammeResponse programme = new MatchedProgrammeResponse(1L, "P1", null, "Data Science", "COMPUTING",
                "MASTER", "ONLINE", List.of("EN"), 12, List.of("2027-09"), null, null, "12 months", List.of(), "Ask");
        UniversitySearchItemResponse item = new UniversitySearchItemResponse(1L, "northstar", null, "Northstar", "GB", null,
                "United Kingdom", null, "London", true, 5, List.of(programme, programme, programme));
        when(service.search(any())).thenReturn(PageResponse.of(List.of(item), 2, 24, 1));

        mockMvc.perform(get("/api/v1/universities/search").queryParam("page", "2").queryParam("size", "24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].matchedProgrammeCount").value(5))
                .andExpect(jsonPath("$.items[0].matchedProgrammes.length()").value(3))
                .andExpect(jsonPath("$.items[0].nameZh").doesNotExist());
    }

    @Test
    void returnsAggregatedBadRequestAndSafeUnavailableResponse() throws Exception {
        when(service.search(any())).thenThrow(new SearchValidationException(Map.of(
                "page", "must be greater than or equal to 1", "size", "must be a positive integer")));
        mockMvc.perform(get("/api/v1/universities/search").queryParam("page", "0").queryParam("size", "not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.page").value("must be greater than or equal to 1"))
                .andExpect(jsonPath("$.fieldErrors.size").value("must be a positive integer"));

        reset(service);
        when(service.search(any())).thenThrow(new SearchServiceUnavailableException("ES cluster address: private"));
        mockMvc.perform(get("/api/v1/universities/search").queryParam("q", "c++ (data) AND *"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SEARCH_SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Search service is temporarily unavailable"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }
}
