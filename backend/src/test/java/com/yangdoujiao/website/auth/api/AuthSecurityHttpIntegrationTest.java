package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockCookie;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, AuthSecurityHttpIntegrationTest.SessionProbeController.class})
class AuthSecurityHttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void anonymousSessionDoesNotExposeAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.adviser").value(false));
    }

    @Test
    void ordinaryUserSessionDoesNotExposeAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session").with(user(principal(UserAccountRole.USER))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.adviser").value(false));
    }

    @Test
    void adviserSessionExposesAdviserCapability() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session").with(user(principal(UserAccountRole.ADVISER))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value(42))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.adviser").value(true));
    }

    private UserPrincipal principal(UserAccountRole role) {
        UserAccount account = UserAccount.external("Test User", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        ReflectionTestUtils.setField(account, "role", role);
        return UserPrincipal.from(account);
    }

    @Test
    void csrfEndpointIssuesReadableCookieAndPlainHeaderToken() throws Exception {
        var response = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(header().exists("X-Trace-Id"))
                .andReturn().getResponse();

        Cookie csrfCookie = cookie(response, "XSRF-TOKEN");
        assertThat(csrfCookie.isHttpOnly()).isFalse();
        assertThat(csrfCookie.getValue()).isEqualTo(
                com.jayway.jsonpath.JsonPath.read(response.getContentAsString(), "$.token"));
    }

    @Test
    void rejectsAuthWriteWithoutCsrfUsingApiErrorAndTraceId() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Trace-Id", "csrf-missing-trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(header().string("X-Trace-Id", "csrf-missing-trace"))
                .andExpect(jsonPath("$.code").value("CSRF_REJECTED"))
                .andExpect(jsonPath("$.traceId").value("csrf-missing-trace"));
    }

    @Test
    void acceptsMatchingCsrfCookieAndHeaderBeforeControllerRouting() throws Exception {
        var csrfResponse = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk()).andReturn().getResponse();
        Cookie cookie = cookie(csrfResponse, "XSRF-TOKEN");

        mockMvc.perform(post("/api/v1/auth/security-test/write")
                        .cookie(cookie)
                        .header("X-XSRF-TOKEN", cookie.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void anonymousAccountRequestReturns401WithApiErrorAndTraceId() throws Exception {
        mockMvc.perform(get("/api/v1/account")
                        .header("X-Trace-Id", "anonymous-account-trace"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Trace-Id", "anonymous-account-trace"))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.traceId").value("anonymous-account-trace"));
    }

    @Test
    void signedInUserWithoutUserRoleGets403WithApiError() throws Exception {
        mockMvc.perform(get("/api/v1/account").with(user("staff").roles("STAFF")))
                .andExpect(status().isForbidden())
                .andExpect(header().exists("X-Trace-Id"))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void allowedOriginCanPreflightCredentialedAuthWrite() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void unapprovedOriginCannotPreflightCredentialedAuthWrite() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header("Origin", "https://unapproved.example")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
    }

    @Test
    void sessionCookieIsHttpOnlySameSiteLaxAndStoredInPostgres() throws Exception {
        var response = mockMvc.perform(get("/api/v1/security-test/session"))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        Cookie sessionCookie = cookie(response, "JSESSIONID");
        assertThat(sessionCookie.isHttpOnly()).isTrue();
        assertThat(sessionCookie.getSecure()).isFalse();
        assertThat(response.getHeaders(HttpHeaders.SET_COOKIE)).anySatisfy(header ->
                assertThat(header).startsWith("JSESSIONID=").contains("SameSite=Lax"));
        // Spring Session encodes its cookie; the probe returns the actual persisted session ID.
        String sessionId = response.getContentAsString();
        assertThat(sessionId).isNotBlank();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM spring_session WHERE session_id = ?",
                Integer.class, sessionId)).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT max_inactive_interval FROM spring_session WHERE session_id = ?",
                Integer.class, sessionId)).isEqualTo(86_400);

        var resumedResponse = mockMvc.perform(get("/api/v1/security-test/session").cookie(sessionCookie))
                .andExpect(status().isOk()).andReturn().getResponse();
        assertThat(resumedResponse.getContentAsString()).isEqualTo(sessionId);
    }

    private Cookie cookie(MockHttpServletResponse response, String name) {
        return response.getHeaders(HttpHeaders.SET_COOKIE).stream()
                .map(MockCookie::parse)
                .filter(cookie -> name.equals(cookie.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing " + name + " cookie"));
    }

    @RestController
    static class SessionProbeController {
        @GetMapping("/api/v1/security-test/session")
        public String createSession(HttpServletRequest request) {
            return request.getSession(true).getId();
        }

        @PostMapping("/api/v1/auth/security-test/write")
        @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
        public void csrfProtectedWrite() {
        }
    }
}
