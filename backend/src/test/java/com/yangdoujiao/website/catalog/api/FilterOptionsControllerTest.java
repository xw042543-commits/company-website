package com.yangdoujiao.website.catalog.api;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FilterOptionsController.class)
class FilterOptionsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FilterOptionsService service;

    @MockitoBean
    private CacheManager cacheManager;

    @Test
    void returnsAllFiveFilterOptionGroupsWithBilingualNames() throws Exception {
        when(service.getPublishedOptions()).thenReturn(new FilterOptionsResponse(
                List.of(new FilterOptionResponse("MY", "马来西亚", "Malaysia")),
                List.of(new FilterOptionResponse("BUSINESS", "商业与管理", "Business and Management")),
                List.of(new FilterOptionResponse("BACHELOR", "本科", "Bachelor")),
                List.of(new FilterOptionResponse("ON_CAMPUS", "线下授课", "On campus")),
                List.of(new FilterOptionResponse("EN", "英语", "English"))
        ));

        mockMvc.perform(get("/api/v1/catalog/filter-options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.countries[0].code").value("MY"))
                .andExpect(jsonPath("$.countries[0].nameZh").value("马来西亚"))
                .andExpect(jsonPath("$.countries[0].nameEn").value("Malaysia"))
                .andExpect(jsonPath("$.subjectCategories[0].code").value("BUSINESS"))
                .andExpect(jsonPath("$.subjectCategories[0].nameZh").value("商业与管理"))
                .andExpect(jsonPath("$.subjectCategories[0].nameEn").value("Business and Management"))
                .andExpect(jsonPath("$.studyLevels[0].code").value("BACHELOR"))
                .andExpect(jsonPath("$.studyLevels[0].nameZh").value("本科"))
                .andExpect(jsonPath("$.studyLevels[0].nameEn").value("Bachelor"))
                .andExpect(jsonPath("$.courseModes[0].code").value("ON_CAMPUS"))
                .andExpect(jsonPath("$.courseModes[0].nameZh").value("线下授课"))
                .andExpect(jsonPath("$.courseModes[0].nameEn").value("On campus"))
                .andExpect(jsonPath("$.languages[0].code").value("EN"))
                .andExpect(jsonPath("$.languages[0].nameZh").value("英语"))
                .andExpect(jsonPath("$.languages[0].nameEn").value("English"));
    }

    @Test
    void returnsSafeErrorBodyWhenServiceFails() throws Exception {
        when(service.getPublishedOptions())
                .thenThrow(new IllegalStateException("database password must not escape"));

        mockMvc.perform(get("/api/v1/catalog/filter-options"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(content().string(not(containsString("database password"))))
                .andExpect(content().string(not(containsString("IllegalStateException"))));
    }
}
