package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest(properties = {
        "app.consultation.submission-enabled=true",
        "app.consultation.privacy-notice-version=   "
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class ConsultationMissingPrivacyVersionHttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void refusesSubmissionWhenEnabledWithoutARealPrivacyNoticeVersion() throws Exception {
        mockMvc.perform(post("/api/v1/consultations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Wang Xin",
                                  "contact": "missing-version-test-contact",
                                  "locale": "zh",
                                  "privacyConsent": true
                                }
                                """))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("CONSULTATION_SUBMISSION_UNAVAILABLE"));

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM consultation_enquiries WHERE contact = 'missing-version-test-contact'",
                Integer.class
        );
        assertThat(count).isZero();
    }
}
