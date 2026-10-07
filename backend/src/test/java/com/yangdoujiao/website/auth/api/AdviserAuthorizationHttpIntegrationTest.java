package com.yangdoujiao.website.auth.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.config.PasswordEncodingConfig;
import com.yangdoujiao.website.auth.config.SecurityConfig;
import com.yangdoujiao.website.auth.password.PasswordService;
import com.yangdoujiao.website.auth.session.AuthenticationService;
import com.yangdoujiao.website.auth.session.UserAccountDetailsService;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.auth.verification.VerificationService;
import com.yangdoujiao.website.common.web.ClientAddressResolver;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import tools.jackson.databind.ObjectMapper;

@SpringJUnitWebConfig(AdviserAuthorizationHttpIntegrationTest.TestConfig.class)
class AdviserAuthorizationHttpIntegrationTest {
    @Autowired private WebApplicationContext context;
    @MockitoBean private UserAccountDetailsService accounts;
    @MockitoBean private RegistrationService registration;
    @MockitoBean private VerificationService verification;
    @MockitoBean private AuthenticationService authentication;
    @MockitoBean private PasswordService passwords;
    @MockitoBean private ClientAddressResolver addresses;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(new RequestTraceFilter())
                .apply(springSecurity())
                .build();
    }

    @ParameterizedTest
    @ValueSource(strings = {"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"})
    void anonymousAdviserRequestsRequireAuthentication(String method) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(method), "/api/v1/adviser/security-test").with(csrf())
                        .header("X-Trace-Id", "anonymous-adviser-trace"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Trace-Id", "anonymous-adviser-trace"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"})
    void ordinaryUserCannotAccessAnyAdviserRequestMethod(String method) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(method), "/api/v1/adviser/security-test")
                        .with(user("user").roles("USER")).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthorizedAdviserAccessUsesApiErrorResponses() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/security-test"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        mockMvc.perform(get("/api/v1/adviser/security-test").with(user("user").roles("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void adviserAuthoritiesReachAdviserEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/security-test").with(user("adviser").roles("USER", "ADVISER")))
                .andExpect(status().isNoContent());
    }

    @Test
    void storedAdviserPrincipalCanAccessNestedAdviserAndUserAccountEndpoints() throws Exception {
        UserPrincipal principal = principal(UserAccountRole.ADVISER);
        mockMvc.perform(get("/api/v1/adviser/nested/security-test").with(user(principal)))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/account/security-test").with(user(principal)))
                .andExpect(status().isNoContent());
    }

    @Test
    void adviserWriteStillRequiresCsrf() throws Exception {
        mockMvc.perform(post("/api/v1/adviser/security-test").with(user("adviser").roles("USER", "ADVISER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
        mockMvc.perform(post("/api/v1/adviser/security-test")
                        .with(user("adviser").roles("USER", "ADVISER")).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void publicConsultationPostRemainsAnonymousAndCsrfProtected() throws Exception {
        mockMvc.perform(post("/api/v1/consultations"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
        mockMvc.perform(post("/api/v1/consultations").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void anonymousSessionHasNoAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.adviser").value(false));
    }

    @Test
    void ordinarySessionHasNoAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session").with(user(principal(UserAccountRole.USER))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.adviser").value(false));
    }

    @Test
    void adviserSessionExposesAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session").with(user(principal(UserAccountRole.ADVISER))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.adviser").value(true));
    }

    @Test
    void unrelatedPrincipalWithAdviserAuthorityDoesNotExposeAnAccountSession() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session").with(user("adviser").roles("USER", "ADVISER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.adviser").value(false));
    }

    private UserPrincipal principal(UserAccountRole role) {
        UserAccount account = UserAccount.external("Test User", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        ReflectionTestUtils.setField(account, "role", role);
        return UserPrincipal.from(account);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, PasswordEncodingConfig.class, AuthSecurityErrorWriter.class,
            AuthController.class, AdviserProbeController.class})
    static class TestConfig {
        @Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
    }

    @RestController
    static class AdviserProbeController {
        @RequestMapping({"/api/v1/adviser/security-test", "/api/v1/adviser/nested/security-test"})
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void adviser() {}

        @GetMapping("/api/v1/account/security-test")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void account() {}

        @PostMapping("/api/v1/consultations")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void consultation() {}
    }
}
