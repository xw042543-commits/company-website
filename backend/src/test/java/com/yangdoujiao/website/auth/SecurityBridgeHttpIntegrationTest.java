package com.yangdoujiao.website.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    }
}
