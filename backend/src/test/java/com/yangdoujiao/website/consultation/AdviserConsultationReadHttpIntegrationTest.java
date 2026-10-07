package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;

import tools.jackson.databind.ObjectMapper;

@SpringJUnitWebConfig(AdviserConsultationReadHttpIntegrationTest.TestConfig.class)
class AdviserConsultationReadHttpIntegrationTest {
    @Autowired private WebApplicationContext context;
    @MockitoBean private UserAccountDetailsService accounts;
    @MockitoBean private ConsultationEnquiryRepository repository;
    private MockMvc mockMvc;
    private UserPrincipal adviser;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity())
                .addFilters(new RequestTraceFilter()).build();
        UserAccount account = UserAccount.external("Adviser", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        ReflectionTestUtils.setField(account, "role", UserAccountRole.ADVISER);
        adviser = UserPrincipal.from(account);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(AdviserConsultationServiceTest.fixture()),
                        invocation.getArgument(1), 1));
        when(repository.findByReferenceCode(any(UUID.class)))
                .thenAnswer(invocation -> invocation.getArgument(0).equals(
                        AdviserConsultationServiceTest.fixture().getReferenceCode())
                        ? Optional.of(AdviserConsultationServiceTest.fixture()) : Optional.empty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "/00000000-0000-0000-0000-000000000123"})
    void protectsBothReadsFromAnonymousAndOrdinaryUsers(String suffix) throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations" + suffix))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/adviser/consultations" + suffix).with(user("ordinary").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @SuppressWarnings("unchecked")
    void unexpectedListFailureNeverLogsRawCallerTrace() throws Exception {
        String callerTrace = "private-caller-contact";
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenThrow(new IllegalStateException("private repository failure"));
        Logger logger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
        ListAppender<ILoggingEvent> logs = new ListAppender<>();
        logs.start();
        logger.addAppender(logs);
        try {
            mockMvc.perform(get("/api/v1/adviser/consultations").with(user(adviser))
                            .header("X-Trace-Id", callerTrace))
                    .andExpect(status().isInternalServerError())
                    .andExpect(header().string("X-Trace-Id", callerTrace))
                    .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                    .andExpect(jsonPath("$.traceId").value(callerTrace));
            assertThat(logs.list).hasSize(1);
            assertThat(logs.list.getFirst().getFormattedMessage())
                    .contains("/api/v1/adviser/consultations", "traceId=sha256:")
                    .doesNotContain(callerTrace, "private repository failure");
        } finally {
            logger.detachAppender(logs);
            logs.stop();
        }
    }

    @Test
    void adviserGetsDefaultPageAndPrivateNoStoreSummary() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations").with(user(adviser)))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(header().string("Cache-Control", containsString("private")))
                .andExpect(jsonPath("$.items[0].referenceCode").value("00000000-0000-0000-0000-000000000123"))
                .andExpect(jsonPath("$.items[0].name").value("Lim"))
                .andExpect(jsonPath("$.items[0].contact").value("lim@example.test"))
                .andExpect(jsonPath("$.items[0].intendedSchool").value("School"))
                .andExpect(jsonPath("$.items[0].intendedCourse").value("Course"))
                .andExpect(jsonPath("$.items[0].qualification").value("bachelor"))
                .andExpect(jsonPath("$.items[0].status").value("NEW"))
                .andExpect(jsonPath("$.items[0].createdAt").isNotEmpty())
                .andExpect(jsonPath("$.items[0].statusUpdatedAt").isNotEmpty())
                .andExpect(jsonPath("$.items[0].version").value(0))
                .andExpect(jsonPath("$.items[0].notes").doesNotExist())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.counts.newCount").value(0))
                .andExpect(jsonPath("$.counts.inProgressCount").value(0))
                .andExpect(jsonPath("$.counts.completedCount").value(0));
    }

    @Test
    void adviserGetsCompletePrivateNoStoreDetail() throws Exception {
        ConsultationEnquiry enquiry = AdviserConsultationServiceTest.fixture();
        ReflectionTestUtils.setField(enquiry, "statusUpdatedByUserId", 42L);
        ReflectionTestUtils.setField(enquiry, "version", 3L);
        when(repository.findByReferenceCode(enquiry.getReferenceCode())).thenReturn(Optional.of(enquiry));
        mockMvc.perform(get("/api/v1/adviser/consultations/00000000-0000-0000-0000-000000000123")
                        .with(user(adviser)))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(header().string("Cache-Control", containsString("private")))
                .andExpect(jsonPath("$.referenceCode").value("00000000-0000-0000-0000-000000000123"))
                .andExpect(jsonPath("$.name").value("Lim"))
                .andExpect(jsonPath("$.contact").value("lim@example.test"))
                .andExpect(jsonPath("$.intendedSchool").value("School"))
                .andExpect(jsonPath("$.intendedCourse").value("Course"))
                .andExpect(jsonPath("$.qualification").value("bachelor"))
                .andExpect(jsonPath("$.notes").value("Submitted notes"))
                .andExpect(jsonPath("$.locale").value("en"))
                .andExpect(jsonPath("$.privacyNoticeVersion").value("privacy-v1"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.statusUpdatedAt").isNotEmpty())
                .andExpect(jsonPath("$.version").value(3))
                .andExpect(jsonPath("$.statusUpdatedByUserId").value(42));
    }

    @Test
    void missingReferenceIsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations/00000000-0000-0000-0000-000000000999")
                        .with(user(adviser)))
                .andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(strings = {"page=-1", "size=0", "size=101", "status=DELETED", "status=new", "page=oops"})
    void rejectsInvalidBoundedOrTypedParameters(String parameter) throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations?" + parameter).with(user(adviser)))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @CsvSource({"2147483647,20", "1073741824,2", "107374183,20"})
    void excessiveOffsetReturnsBadRequestBeforeRepositoryAccess(int page, int size) throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations").param("page", Integer.toString(page))
                        .param("size", Integer.toString(size)).with(user(adviser)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(repository);
    }

    @Test
    @SuppressWarnings("unchecked")
    void maximumJpaOffsetIsStillAccepted() throws Exception {
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(), invocation.getArgument(1), 0));
        mockMvc.perform(get("/api/v1/adviser/consultations").param("page", "2147483647")
                        .param("size", "1").with(user(adviser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2147483647))
                .andExpect(jsonPath("$.size").value(1));
    }

    @Test
    void rejectsOversizedSearchAndMalformedReference() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations").param("query", "x".repeat(101)).with(user(adviser)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/adviser/consultations/not-a-uuid").with(user(adviser)))
                .andExpect(status().isBadRequest());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, PasswordEncodingConfig.class, AuthSecurityErrorWriter.class,
            GlobalExceptionHandler.class, AdviserConsultationController.class, AdviserConsultationService.class,
            ConsultationAuditLogger.class})
    static class TestConfig {
        @Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
    }
}
