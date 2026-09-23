package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.AfterEach;
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
        "app.consultation.privacy-notice-version=test-v1"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class ConsultationHttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("""
                DELETE FROM consultation_enquiries
                WHERE contact = 'wx-123' OR contact LIKE 'consultation-test-%'
                """);
    }

    @Test
    void acceptsConsentedEnquiryAndStoresNormalizedPersonalData() throws Exception {
        mockMvc.perform(post("/api/v1/consultations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "  Wang Xin  ",
                                  "contact": "  wx-123  ",
                                  "intendedSchool": "   ",
                                  "intendedCourse": "  Computer Science  ",
                                  "qualification": "bachelor",
                                  "notes": "   ",
                                  "locale": "zh",
                                  "privacyConsent": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().exists("X-Trace-Id"))
                .andExpect(jsonPath("$.referenceCode").isNotEmpty())
                .andExpect(jsonPath("$.submittedAt").isNotEmpty());

        Map<String, Object> saved = jdbc.queryForMap("""
                SELECT name, contact, intended_school, intended_course, qualification,
                       notes, locale, privacy_consent, privacy_notice_version, status
                FROM consultation_enquiries
                WHERE contact = 'wx-123'
                """);
        assertThat(saved)
                .containsEntry("name", "Wang Xin")
                .containsEntry("contact", "wx-123")
                .containsEntry("intended_school", null)
                .containsEntry("intended_course", "Computer Science")
                .containsEntry("qualification", "bachelor")
                .containsEntry("notes", null)
                .containsEntry("locale", "zh")
                .containsEntry("privacy_consent", true)
                .containsEntry("privacy_notice_version", "test-v1")
                .containsEntry("status", "NEW");
    }

    @Test
    void rejectsMissingConsentAndUnsupportedQualificationWithoutSaving() throws Exception {
        mockMvc.perform(post("/api/v1/consultations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Wang Xin",
                                  "contact": "wx-123",
                                  "qualification": "secondary-school",
                                  "locale": "zh",
                                  "privacyConsent": false
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.privacyConsent").exists())
                .andExpect(jsonPath("$.fieldErrors.qualification").exists());

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM consultation_enquiries WHERE contact = 'wx-123'",
                Integer.class
        );
        assertThat(count).isZero();
    }

    @Test
    void normalizesUnicodeWhitespaceBeforeApplyingValidationRules() throws Exception {
        String maximumLengthName = "王".repeat(100);

        mockMvc.perform(post("/api/v1/consultations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "　%s　",
                                  "contact": " consultation-test-normalized ",
                                  "intendedSchool": "　　",
                                  "qualification": " bachelor ",
                                  "locale": " zh ",
                                  "privacyConsent": true
                                }
                                """.formatted(maximumLengthName)))
                .andExpect(status().isCreated());

        Map<String, Object> saved = jdbc.queryForMap("""
                SELECT name, intended_school, qualification, locale
                FROM consultation_enquiries
                WHERE contact = 'consultation-test-normalized'
                """);
        assertThat(saved)
                .containsEntry("name", maximumLengthName)
                .containsEntry("intended_school", null)
                .containsEntry("qualification", "bachelor")
                .containsEntry("locale", "zh");
    }
}
