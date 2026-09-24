package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;

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
    @Autowired private StringRedisTemplate redis;

    @BeforeEach
    void clearRateLimits() {
        Set<String> keys = redis.keys("consultation:rate:*");
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
        }
    }

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

    @Test
    void rejectsTheSixthSubmissionFromTheSameAddressWithinTenMinutes() throws Exception {
        String body = """
                {
                  "name": "Rate Limit Test",
                  "contact": "consultation-test-rate-limit",
                  "locale": "en",
                  "privacyConsent": true
                }
                """;

        for (int attempt = 1; attempt <= 5; attempt++) {
            mockMvc.perform(post("/api/v1/consultations")
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.10");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post("/api/v1/consultations")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.10");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("CONSULTATION_RATE_LIMITED"));
    }

    @Test
    void rateLimitsMalformedRequestsBeforeReadingTheRequestBody() throws Exception {
        for (int attempt = 1; attempt <= 5; attempt++) {
            mockMvc.perform(post("/api/v1/consultations")
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.11");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{not-json"))
                    .andExpect(status().isBadRequest());
        }

        mockMvc.perform(post("/api/v1/consultations")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.11");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-json"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("CONSULTATION_RATE_LIMITED"));
    }

    @Test
    void rejectsAConsultationRequestBodyLargerThanSixteenKilobytes() throws Exception {
        String body = """
                {
                  "name": "Payload Limit Test",
                  "contact": "consultation-test-payload-limit",
                  "notes": "%s",
                  "locale": "en",
                  "privacyConsent": true
                }
                """.formatted("x".repeat(17_000));

        mockMvc.perform(post("/api/v1/consultations")
                        .header("Origin", "http://localhost:3000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isContentTooLarge())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(jsonPath("$.code").value("CONSULTATION_PAYLOAD_TOO_LARGE"));
    }

    @Test
    void acceptsAnotherSubmissionAfterTheRateLimitWindowExpires() throws Exception {
        ConsultationRateLimiter limiter = new ConsultationRateLimiter(
                redis,
                1,
                Duration.ofMillis(100)
        );

        limiter.check("203.0.113.20");
        Set<String> storedKeys = redis.keys("consultation:rate:*");
        assertThat(storedKeys).hasSize(1);
        assertThat(storedKeys.iterator().next())
                .doesNotContain("203.0.113.20")
                .matches("consultation:rate:[0-9a-f]{64}");
        assertThatThrownBy(() -> limiter.check("203.0.113.20"))
                .isInstanceOfSatisfying(ApiException.class, exception ->
                        assertThat(exception.getCode()).isEqualTo("CONSULTATION_RATE_LIMITED")
                );

        long deadline = System.nanoTime() + Duration.ofSeconds(2).toNanos();
        while (hasConsultationRateLimitKeys() && System.nanoTime() < deadline) {
            Thread.sleep(20);
        }

        assertThat(hasConsultationRateLimitKeys()).isFalse();
        assertThatCode(() -> limiter.check("203.0.113.20")).doesNotThrowAnyException();
    }

    @Test
    void allowsOnlyFiveConcurrentSubmissionsForTheSameAddress() throws Exception {
        ConsultationRateLimiter limiter = new ConsultationRateLimiter(
                redis,
                5,
                Duration.ofMinutes(10)
        );
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();

        try (ExecutorService executor = Executors.newFixedThreadPool(12)) {
            for (int attempt = 0; attempt < 20; attempt++) {
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        limiter.check("203.0.113.30");
                        return true;
                    } catch (ApiException exception) {
                        assertThat(exception.getCode()).isEqualTo("CONSULTATION_RATE_LIMITED");
                        return false;
                    }
                }));
            }
            start.countDown();

            int accepted = 0;
            for (Future<Boolean> result : results) {
                if (result.get()) {
                    accepted++;
                }
            }
            assertThat(accepted).isEqualTo(5);
        }
    }

    private boolean hasConsultationRateLimitKeys() {
        Set<String> keys = redis.keys("consultation:rate:*");
        return keys != null && !keys.isEmpty();
    }
}
