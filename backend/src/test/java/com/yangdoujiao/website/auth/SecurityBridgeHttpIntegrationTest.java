package com.yangdoujiao.website.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;

@SpringBootTest(properties = {
        "app.consultation.submission-enabled=true",
        "app.consultation.privacy-notice-version=test-v1"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class SecurityBridgeHttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private UserDetailsService userDetailsService;

    @AfterEach
    void deleteFixture() {
        jdbc.update("DELETE FROM consultation_enquiries WHERE contact = 'security-bridge-test'");
    }

    @Test
    void anonymousRequestsReachExistingPublicControllers() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/filter-options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.countries").isArray());

        mockMvc.perform(post("/api/v1/consultations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Schema Bridge Test",
                                  "contact": "security-bridge-test",
                                  "locale": "en",
                                  "privacyConsent": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.referenceCode").isNotEmpty());
    }

    @Test
    void bridgeDoesNotCreateDefaultDevelopmentAccount() {
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("user"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void bridgeDoesNotPermitFutureAccountRoutes() throws Exception {
        mockMvc.perform(get("/api/v1/account"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/auth/session"))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicGetRoutesAlsoAcceptHead() throws Exception {
        mockMvc.perform(head("/api/v1/catalog/filter-options"))
                .andExpect(status().isOk());
    }

    @Test
    void errorAndForwardDispatchesReachErrorController() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(status().isForbidden());

        for (DispatcherType dispatcherType : new DispatcherType[] {
                DispatcherType.ERROR, DispatcherType.FORWARD
        }) {
            mockMvc.perform(get("/error").with(request -> {
                        request.setDispatcherType(dispatcherType);
                        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 404);
                        return request;
                    }))
                    .andExpect(result -> {
                        assertThat(result.getHandler()).isNotNull();
                        assertThat(result.getResponse().getStatus()).isNotEqualTo(403);
                    });
        }
    }

    @Test
    void corsPreflightStillReachesExistingCorsFilter() throws Exception {
        mockMvc.perform(options("/api/v1/consultations")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    void asyncAndIncludeDispatchesAreNotAllowedByPublicPathRules() throws Exception {
        for (DispatcherType dispatcherType : new DispatcherType[] {
                DispatcherType.ASYNC, DispatcherType.INCLUDE
        }) {
            mockMvc.perform(get("/api/v1/catalog/filter-options").with(request -> {
                        request.setDispatcherType(dispatcherType);
                        return request;
                    }))
                    .andExpect(status().isForbidden());
        }
    }
}
