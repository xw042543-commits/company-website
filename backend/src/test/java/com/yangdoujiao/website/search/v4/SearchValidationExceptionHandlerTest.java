package com.yangdoujiao.website.search.v4;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.common.exception.GlobalExceptionHandler;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

class SearchValidationExceptionHandlerTest {

    @Test
    void returnsSafeBadRequestWithEverySearchFieldErrorAndTraceId() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new InvalidSearchController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestTraceFilter())
                .build();

        mockMvc.perform(get("/api/v1/test/search-validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Request validation failed"))
                .andExpect(jsonPath("$.fieldErrors.duration").value("must be a positive integer"))
                .andExpect(jsonPath("$.fieldErrors.tuitionMax")
                        .value("must be greater than or equal to tuitionMin"))
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(content().string(not(containsString("SearchValidationException"))))
                .andExpect(content().string(not(containsString("internal-secret"))));
    }

    @RestController
    static class InvalidSearchController {

        @GetMapping("/api/v1/test/search-validation")
        String failValidation() {
            Map<String, String> fieldErrors = new LinkedHashMap<>();
            fieldErrors.put("duration", "must be a positive integer");
            fieldErrors.put("tuitionMax", "must be greater than or equal to tuitionMin");
            throw new SearchValidationException(fieldErrors);
        }
    }
}
