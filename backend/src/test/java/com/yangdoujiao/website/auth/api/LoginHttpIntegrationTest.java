package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, LoginHttpIntegrationTest.AnonymousSessionProbe.class})
class LoginHttpIntegrationTest {
    private static final String PASSWORD = "correct-horse-42";

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder passwords;
    @Autowired private AuthRateLimitProperties limits;

    @Test
    void emailLoginRotatesAnonymousSessionAndPersistsRememberedLifetime() throws Exception {
        String email = email();
        long userId = account(email, null, "ACTIVE", false);
        MvcResult anonymous = mvc.perform(get("/api/v1/auth/test-anonymous-session"))
                .andExpect(status().isOk()).andReturn();
        String oldId = anonymous.getResponse().getContentAsString();
        Cookie oldCookie = cookie(anonymous.getResponse(), "JSESSIONID");
        assertThat(oldCookie).isNotNull();

        MvcResult login = mvc.perform(login(email.toUpperCase(), PASSWORD, true).cookie(oldCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value((int) userId))
                .andReturn();
        assertThat(cookie(login.getResponse(), "JSESSIONID").getMaxAge()).isEqualTo(2_592_000);
        String newId = sessionId(userId);
        assertThat(newId).isNotEqualTo(oldId);
        assertThat(jdbc.queryForObject("SELECT max_inactive_interval FROM spring_session WHERE session_id = ?",
                Integer.class, newId)).isEqualTo(2_592_000);
        assertThat(jdbc.queryForObject("SELECT principal_name FROM spring_session WHERE session_id = ?",
                String.class, newId)).isEqualTo("user:" + userId);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM spring_session WHERE session_id = ?",
                Integer.class, oldId)).isZero();
        mvc.perform(get("/api/v1/auth/session").cookie(cookie(login.getResponse(), "JSESSIONID")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value((int) userId));
    }

    @Test
    void phoneLoginUsesDefaultLifetimeAndLogoutInvalidatesSession() throws Exception {
        String phone = "+60" + (10_000_000_000L + Math.abs(UUID.randomUUID().getLeastSignificantBits() % 80_000_000_000L));
        long userId = account(null, phone, "ACTIVE", false);
        MvcResult login = mvc.perform(login(phone, PASSWORD, false))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value((int) userId)).andReturn();
        String sessionId = sessionId(userId);
        assertThat(jdbc.queryForObject("SELECT max_inactive_interval FROM spring_session WHERE session_id = ?",
                Integer.class, sessionId)).isEqualTo(86_400);

        Cookie sessionCookie = cookie(login.getResponse(), "JSESSIONID");
        mvc.perform(post("/api/v1/auth/logout").with(csrf())
                        .cookie(sessionCookie))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM spring_session WHERE session_id = ?",
                Integer.class, sessionId)).isZero();
        mvc.perform(get("/api/v1/auth/session").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void invalidPasswordAndInactiveAccountsReturnSameCredentialError() throws Exception {
        String active = email();
        account(active, null, "ACTIVE", false);
        String pending = email();
        account(pending, null, "PENDING_VERIFICATION", false);
        String disabled = email();
        account(disabled, null, "DISABLED", false);
        String deleted = email();
        account(deleted, null, "DELETED", true);
        for (String identifier : new String[] {active, pending, disabled, deleted, email()}) {
            String password = identifier.equals(active) ? "wrong-password" : PASSWORD;
            mvc.perform(login(identifier, password, false))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        }
    }

    @Test
    void failuresConsumeBothBucketsAndSuccessClearsIdentifierBucket() throws Exception {
        String email = email();
        account(email, null, "ACTIVE", false);
        mvc.perform(login(email, "wrong-password", false)
                        .with(request -> { request.setRemoteAddr("198.51.100.99"); return request; }))
                .andExpect(status().isUnauthorized());
        String hash = AuthHash.sha256(email);
        assertThat(jdbc.queryForObject("SELECT attempts FROM auth_rate_limit_buckets WHERE scope = 'login-identifier' AND subject_hash = ?",
                Integer.class, hash)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT attempts FROM auth_rate_limit_buckets WHERE scope = 'login-ip' AND subject_hash = ?",
                Integer.class, AuthHash.sha256("198.51.100.99"))).isEqualTo(1);
        mvc.perform(login(email, PASSWORD, false)).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM auth_rate_limit_buckets WHERE scope = 'login-identifier' AND subject_hash = ?",
                Integer.class, hash)).isZero();
    }

    @Test
    void identifierLimitStillConsumesIpBucket() throws Exception {
        String email = email();
        account(email, null, "ACTIVE", false);
        jdbc.update("""
                INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
                VALUES ('login-identifier', ?, ?, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, AuthHash.sha256(email), limits.loginPerIdentifier());
        mvc.perform(login(email, "wrong-password", false)
                        .with(request -> { request.setRemoteAddr("198.51.100.88"); return request; }))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("AUTH_RATE_LIMITED"));
        assertThat(jdbc.queryForObject("SELECT attempts FROM auth_rate_limit_buckets WHERE scope = 'login-ip' AND subject_hash = ?",
                Integer.class, AuthHash.sha256("198.51.100.88"))).isEqualTo(1);
    }

    @Test
    void anonymousSessionResponseDoesNotCreateSession() throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/auth/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andReturn();
        assertThat(result.getRequest().getSession(false)).isNull();
    }

    private MockHttpServletRequestBuilder login(String identifier, String password, boolean rememberMe) {
        return post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + identifier + "\",\"password\":\"" + password
                        + "\",\"rememberMe\":" + rememberMe + "}")
                .with(request -> { request.setRemoteAddr("198.51.100.16"); return request; });
    }

    private long account(String email, String phone, String status, boolean deleted) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, normalized_email, normalized_phone, password_hash,
                    status, agreement_version, privacy_version, created_at, updated_at, deleted_at)
                VALUES ('Test User', ?, ?, ?, ?, 'test-terms-v1', 'test-privacy-v1', ?, ?, ?)
                RETURNING id
                """, Long.class, email, phone, passwords.encode(PASSWORD), status,
                OffsetDateTime.now(), OffsetDateTime.now(), deleted ? OffsetDateTime.now() : null);
    }

    private String email() { return "task6-" + UUID.randomUUID() + "@example.com"; }

    private String sessionId(long userId) {
        return jdbc.queryForObject("SELECT session_id FROM spring_session WHERE principal_name = ?",
                String.class, "user:" + userId);
    }

    private Cookie cookie(MockHttpServletResponse response, String name) {
        return response.getHeaders(HttpHeaders.SET_COOKIE).stream().map(MockCookie::parse)
                .filter(cookie -> name.equals(cookie.getName())).findFirst()
                .orElseThrow(() -> new AssertionError("Missing " + name + " cookie"));
    }

    @RestController
    static class AnonymousSessionProbe {
        @GetMapping("/api/v1/auth/test-anonymous-session")
        public String create(HttpServletRequest request) { return request.getSession(true).getId(); }
    }
}
