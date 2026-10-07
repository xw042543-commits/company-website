package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.slf4j.LoggerFactory;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.api.AuthSecurityErrorWriter;
import com.yangdoujiao.website.auth.config.PasswordEncodingConfig;
import com.yangdoujiao.website.auth.config.SecurityConfig;
import com.yangdoujiao.website.auth.session.UserAccountDetailsService;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.GlobalExceptionHandler;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import tools.jackson.databind.ObjectMapper;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;

@SpringJUnitWebConfig(AdviserConsultationStatusHttpIntegrationTest.TestConfig.class)
class AdviserConsultationStatusHttpIntegrationTest {
    @Autowired private WebApplicationContext context;
    @Autowired private FixtureStore store;
    @MockitoBean private UserAccountDetailsService accounts;
    private MockMvc mvc;
    private UserPrincipal adviser;
    private ListAppender<ILoggingEvent> logs;

    @BeforeEach
    void setUp() {
        store.enquiry = AdviserConsultationServiceTest.fixture();
        store.loseRace = false;
        store.failAt = null;
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(new RequestTraceFilter(), context.getBean(ConsultationAuditLogger.class))
                .apply(springSecurity()).build();
        UserAccount account = UserAccount.external("Adviser", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        ReflectionTestUtils.setField(account, "role", UserAccountRole.ADVISER);
        adviser = UserPrincipal.from(account);
        logs = new ListAppender<>();
        logs.start();
        ((Logger) LoggerFactory.getLogger(ConsultationAuditLogger.class)).addAppender(logs);
    }

    @AfterEach
    void stopCapturing() {
        ((Logger) LoggerFactory.getLogger(ConsultationAuditLogger.class)).detachAppender(logs);
        logs.stop();
    }

    @Test
    void changesStatusAndStoresUtcActorAndNextVersionWithoutEditingSubmittedFields() throws Exception {
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"IN_PROGRESS","version":0,"name":"overwrite","notes":"overwrite",
                                 "statusUpdatedByUserId":77,"statusUpdatedAt":"2020-01-01T00:00:00Z"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.referenceCode").value(store.enquiry.getReferenceCode().toString()))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.statusUpdatedByUserId").value(42))
                .andExpect(jsonPath("$.statusUpdatedAt").isNotEmpty())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.name").doesNotExist())
                .andExpect(jsonPath("$.notes").doesNotExist());
        assertThat(store.enquiry.getStatusUpdatedAt().getOffset()).isEqualTo(ZoneOffset.UTC);
        assertThat(store.enquiry.getStatusUpdatedAt()).isAfter(OffsetDateTime.parse("2026-10-06T09:00:00Z"));
        assertThat(store.enquiry.getStatusUpdatedByUserId()).isEqualTo(42L);
        assertThat(store.enquiry.getName()).isEqualTo("Lim");
        assertThat(store.enquiry.getNotes()).isEqualTo("Submitted notes");
        assertThat(store.enquiry.getContact()).isEqualTo("lim@example.test");
        assertThat(store.enquiry.getIntendedSchool()).isEqualTo("School");
        assertThat(store.enquiry.getIntendedCourse()).isEqualTo("Course");
        assertThat(store.enquiry.getQualification()).isEqualTo("bachelor");
        assertThat(store.enquiry.getLocale()).isEqualTo("en");
        assertThat(store.enquiry.getPrivacyNoticeVersion()).isEqualTo("privacy-v1");
        assertThat(store.enquiry.isPrivacyConsent()).isTrue();
        assertThat(store.enquiry.getCreatedAt()).isEqualTo(OffsetDateTime.parse("2026-10-06T09:00:00Z"));
    }

    @Test
    void missingCsrfAndOrdinaryUserCannotChangeStatus() throws Exception {
        mvc.perform(patch(path()).with(user(adviser)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch(path()).with(user("ordinary").roles("USER")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch(path()).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isUnauthorized());
        assertThat(store.enquiry.getVersion()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"status\":\"DELETED\",\"version\":0}", "{\"version\":0}",
            "{\"status\":null,\"version\":0}", "{\"status\":\"new\",\"version\":0}",
            "{\"status\":\"IN_PROGRESS\"}", "{\"status\":\"IN_PROGRESS\",\"version\":null}",
            "{\"status\":\"IN_PROGRESS\",\"version\":-1}", "{\"status\":1,\"version\":0}",
            "{\"status\":\"1\",\"version\":0}"})
    void rejectsMissingOrInvalidStatusAndExpectedVersion(String body) throws Exception {
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(body)).andExpect(status().isBadRequest());
        assertThat(store.enquiry.getVersion()).isZero();
    }

    @Test
    void missingRecordIs404AndStaleVersionIs409PreservingNewerState() throws Exception {
        mvc.perform(patch("/api/v1/adviser/consultations/00000000-0000-0000-0000-000000000999/status")
                        .with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isNotFound());
        ReflectionTestUtils.setField(store.enquiry, "status", ConsultationStatus.COMPLETED);
        ReflectionTestUtils.setField(store.enquiry, "version", 2L);
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isConflict());
        assertThat(store.enquiry.getStatus()).isEqualTo(ConsultationStatus.COMPLETED);
        assertThat(store.enquiry.getVersion()).isEqualTo(2L);
    }

    @Test
    void losingRaceAfterSuccessfulLookupReturnsConflict() throws Exception {
        store.loseRace = true;
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isConflict());
        assertThat(store.enquiry.getVersion()).isZero();
    }

    @Test
    void repeatingSameStatusWithCurrentVersionIncrementsExactlyOncePerRequest() throws Exception {
        for (int version = 0; version < 2; version++) {
            mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"NEW\",\"version\":" + version + "}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(version + 1));
        }
        assertThat(store.enquiry.getVersion()).isEqualTo(2L);
    }

    @Test
    void auditsSuccessConflictNotFoundAndPreControllerRejectionsWithoutSubmittedContent() throws Exception {
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).header("X-Trace-Id", "safe-audit-trace")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isOk());
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\",\"version\":0}"))
                .andExpect(status().isConflict());
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"Lim lim@example.test School Course Submitted notes\",\"version\":0}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch(path()).with(user(adviser)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\",\"version\":1}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/adviser/consultations/00000000-0000-0000-0000-000000000999/status")
                        .with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\",\"version\":0}"))
                .andExpect(status().isNotFound());
        UserAccount ordinary = UserAccount.external("Private ordinary name", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(ordinary, "id", 7L);
        mvc.perform(patch(path()).with(user(UserPrincipal.from(ordinary))).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\",\"version\":1}"))
                .andExpect(status().isForbidden());
        assertThat(logs.list).hasSize(6);
        assertThat(logs.list).extracting(ILoggingEvent::getFormattedMessage)
                .anySatisfy(message -> assertThat(message).contains("outcome=SUCCEEDED", "actorId=42", "traceId=sha256:"))
                .anySatisfy(message -> assertThat(message).contains("outcome=CONFLICT", "priorStatus=IN_PROGRESS", "newStatus=COMPLETED"))
                .anySatisfy(message -> assertThat(message).contains("outcome=REJECTED_HTTP_400"))
                .anySatisfy(message -> assertThat(message).contains("outcome=REJECTED_HTTP_403", "actorId=42"))
                .anySatisfy(message -> assertThat(message).contains("outcome=NOT_FOUND"))
                .anySatisfy(message -> assertThat(message).contains("outcome=REJECTED_HTTP_403", "actorId=7"))
                .allSatisfy(message -> assertThat(message).doesNotContain("Lim", "lim@example.test", "School", "Course",
                        "Submitted notes", "Private ordinary name", store.enquiry.getReferenceCode().toString()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"00000000-0000-0000-0000-000000000123", "Lim"})
    void hashesUntrustedTraceForSuccessfulAndRejectedStatusAttempts(String untrustedTrace) throws Exception {
        mvc.perform(patch(path()).with(user(adviser)).with(csrf()).header("X-Trace-Id", untrustedTrace)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\",\"version\":0}"))
                .andExpect(status().isOk());
        mvc.perform(patch(path()).with(user(adviser)).header("X-Trace-Id", untrustedTrace)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\",\"version\":1}"))
                .andExpect(status().isForbidden());
        assertThat(logs.list).hasSize(2);
        assertThat(logs.list).extracting(ILoggingEvent::getFormattedMessage).allSatisfy(message ->
                assertThat(message).contains("traceId=sha256:").doesNotContain(untrustedTrace));
    }

    @ParameterizedTest
    @ValueSource(strings = {"lookup", "update"})
    void unexpectedRepositoryFailuresNeverLogRawReferenceFromUriOrTrace(String failAt) throws Exception {
        store.failAt = failAt;
        Logger errors = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
        ListAppender<ILoggingEvent> errorLogs = new ListAppender<>();
        errorLogs.start();
        errors.addAppender(errorLogs);
        try {
            String reference = store.enquiry.getReferenceCode().toString();
            mvc.perform(patch(path()).with(user(adviser)).with(csrf()).header("X-Trace-Id", reference)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\",\"version\":0}"))
                    .andExpect(status().isInternalServerError()).andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));
            assertThat(errorLogs.list).hasSize(1);
            assertThat(errorLogs.list.getFirst().getFormattedMessage())
                    .contains("/api/v1/adviser/consultations/[redacted]/status", "traceId=sha256:")
                    .doesNotContain(reference, "private database failure");
            assertThat(logs.list).hasSize(1);
            assertThat(logs.list.getFirst().getFormattedMessage())
                    .contains("outcome=REJECTED_HTTP_500", "traceId=sha256:").doesNotContain(reference);
        } finally {
            errors.detachAppender(errorLogs);
            errorLogs.stop();
        }
    }

    private String path() { return "/api/v1/adviser/consultations/" + store.enquiry.getReferenceCode() + "/status"; }

    static class FixtureStore {
        ConsultationEnquiry enquiry;
        boolean loseRace;
        String failAt;
        ConsultationEnquiryRepository repository() {
            return mock(ConsultationEnquiryRepository.class, invocation -> {
                if (invocation.getMethod().getName().equals("findByReferenceCode")) {
                    if ("lookup".equals(failAt)) throw new IllegalStateException("private database failure");
                    return invocation.getArgument(0).equals(enquiry.getReferenceCode())
                            ? Optional.of(enquiry) : Optional.empty();
                }
                if (invocation.getMethod().getName().equals("updateStatus")) {
                    if ("update".equals(failAt)) throw new IllegalStateException("private database failure");
                    if (loseRace || !invocation.getArgument(0).equals(enquiry.getReferenceCode())
                            || (long) invocation.getArgument(4) != enquiry.getVersion()) return 0;
                    ReflectionTestUtils.setField(enquiry, "status", invocation.getArgument(1));
                    ReflectionTestUtils.setField(enquiry, "statusUpdatedAt", invocation.getArgument(2));
                    ReflectionTestUtils.setField(enquiry, "statusUpdatedByUserId", invocation.getArgument(3));
                    ReflectionTestUtils.setField(enquiry, "version", enquiry.getVersion() + 1);
                    return 1;
                }
                return org.mockito.Answers.RETURNS_DEFAULTS.answer(invocation);
            });
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, PasswordEncodingConfig.class, AuthSecurityErrorWriter.class,
            GlobalExceptionHandler.class, AdviserConsultationController.class, AdviserConsultationService.class,
            ConsultationAuditLogger.class})
    static class TestConfig {
        @Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
        @Bean FixtureStore store() { return new FixtureStore(); }
        @Bean ConsultationEnquiryRepository repository(FixtureStore store) { return store.repository(); }
    }
}
