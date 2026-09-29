package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class PasswordHttpIntegrationTest {
    private static final String OLD_PASSWORD = "correct-horse-42";
    private static final String NEW_PASSWORD = "new-correct-horse-84";
    private static final AtomicInteger ADDRESS = new AtomicInteger();

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder passwords;
    @Autowired private LocalAuthNotificationStore notifications;

    @Test
    void forgotPasswordDoesNotRevealWhetherAccountExistsOrReturnToken() throws Exception {
        String existing = email();
        account(existing);
        String knownBody = mvc.perform(forgot(existing.toUpperCase()))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        String missingBody = mvc.perform(forgot(email()))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        assertThat(knownBody).isEqualTo(missingBody).doesNotContain("token", "password");

        String token = resetToken(existing);
        assertThat(jdbc.queryForObject("SELECT token_hash FROM password_reset_tokens WHERE user_id = "
                + "(SELECT id FROM user_accounts WHERE normalized_email = ?)", String.class, existing))
                .isEqualTo(AuthHash.sha256(token)).isNotEqualTo(token);
    }

    @Test
    void resetPasswordRejectsExpiredAndReusedTokenAndRevokesEverySession() throws Exception {
        String existing = email();
        long userId = account(existing);
        Cookie first = login(existing, OLD_PASSWORD);
        Cookie second = login(existing, OLD_PASSWORD);
        assertThat(sessionCount(userId)).isEqualTo(2);

        mvc.perform(forgot(existing)).andExpect(status().isAccepted());
        String expired = resetToken(existing);
        jdbc.update("UPDATE password_reset_tokens SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second' "
                + "WHERE token_hash = ?", AuthHash.sha256(expired));
        mvc.perform(reset(expired, NEW_PASSWORD)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
        assertThat(sessionCount(userId)).isEqualTo(2);

        mvc.perform(forgot(existing)).andExpect(status().isAccepted());
        String valid = resetToken(existing);
        mvc.perform(reset(valid, NEW_PASSWORD)).andExpect(status().isNoContent());
        assertThat(sessionCount(userId)).isZero();
        mvc.perform(reset(valid, "another-good-password-93")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
        assertThat(passwords.matches(NEW_PASSWORD, passwordHash(existing))).isTrue();
        mvc.perform(loginRequest(existing, OLD_PASSWORD)).andExpect(status().isUnauthorized());
        mvc.perform(loginRequest(existing, NEW_PASSWORD)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/auth/session").cookie(first))
                .andExpect(jsonPath("$.authenticated").value(false));
        mvc.perform(get("/api/v1/auth/session").cookie(second))
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void aNewResetRequestInvalidatesThePreviousToken() throws Exception {
        String existing = email();
        account(existing);
        mvc.perform(forgot(existing)).andExpect(status().isAccepted());
        String previous = resetToken(existing);
        mvc.perform(forgot(existing)).andExpect(status().isAccepted());
        String latest = resetToken(existing);
        mvc.perform(reset(previous, NEW_PASSWORD)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
        mvc.perform(reset(latest, NEW_PASSWORD)).andExpect(status().isNoContent());
    }

    @Test
    void changePasswordRequiresAuthenticationAndCurrentPasswordAndRejectsReuse() throws Exception {
        String existing = email();
        long userId = account(existing);
        mvc.perform(change(OLD_PASSWORD, NEW_PASSWORD)).andExpect(status().isUnauthorized());
        Cookie first = login(existing, OLD_PASSWORD);
        Cookie second = login(existing, OLD_PASSWORD);
        mvc.perform(change("wrong-password-55", NEW_PASSWORD).cookie(first))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENT_PASSWORD"));
        mvc.perform(change(OLD_PASSWORD, OLD_PASSWORD).cookie(first))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PASSWORD_REUSE"));
        assertThat(sessionCount(userId)).isEqualTo(2);

        mvc.perform(change(OLD_PASSWORD, NEW_PASSWORD).cookie(first)).andExpect(status().isNoContent());
        assertThat(sessionCount(userId)).isZero();
        assertThat(passwords.matches(NEW_PASSWORD, passwordHash(existing))).isTrue();
        mvc.perform(get("/api/v1/auth/session").cookie(first))
                .andExpect(jsonPath("$.authenticated").value(false));
        mvc.perform(get("/api/v1/auth/session").cookie(second))
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void passwordWritesRequireCsrfAndRejectInvalidNewPassword() throws Exception {
        String existing = email();
        account(existing);
        mvc.perform(post("/api/v1/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + existing + "\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(forgot(existing)).andExpect(status().isAccepted());
        String token = resetToken(existing);
        mvc.perform(reset(token, "short")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(reset(token, NEW_PASSWORD)).andExpect(status().isNoContent());
    }

    private MockHttpServletRequestBuilder forgot(String identifier) {
        return post("/api/v1/auth/forgot-password").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + identifier + "\",\"locale\":\"en\"}")
                .with(request -> { int address = ADDRESS.incrementAndGet();
                    request.setRemoteAddr("198.51." + address / 250 + "." + (address % 250 + 1));
                    return request; });
    }

    private MockHttpServletRequestBuilder reset(String token, String password) {
        return post("/api/v1/auth/reset-password").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + token + "\",\"newPassword\":\"" + password + "\"}");
    }

    private MockHttpServletRequestBuilder change(String current, String next) {
        return put("/api/v1/account/password").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"" + current + "\",\"newPassword\":\"" + next + "\"}");
    }

    private MockHttpServletRequestBuilder loginRequest(String identifier, String password) {
        return post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + identifier + "\",\"password\":\"" + password + "\"}");
    }

    private Cookie login(String identifier, String password) throws Exception {
        MvcResult result = mvc.perform(loginRequest(identifier, password)).andExpect(status().isOk()).andReturn();
        for (Cookie cookie : result.getResponse().getCookies()) {
            if ("JSESSIONID".equals(cookie.getName())) return cookie;
        }
        throw new AssertionError("Login did not set a session cookie");
    }

    private long account(String email) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Password Test', ?, ?, 'ACTIVE', 'test-terms-v1', 'test-privacy-v1', ?, ?)
                RETURNING id
                """, Long.class, email, passwords.encode(OLD_PASSWORD), OffsetDateTime.now(), OffsetDateTime.now());
    }

    private String resetToken(String email) throws InterruptedException {
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        LocalAuthNotificationStore.Notification notification = notifications.take(email).orElseThrow();
        assertThat(notification.method()).isEqualTo("PASSWORD_RESET");
        return notification.token();
    }

    private String passwordHash(String email) {
        return jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE normalized_email = ?",
                String.class, email);
    }

    private int sessionCount(long userId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM spring_session WHERE principal_name = ?",
                Integer.class, "user:" + userId);
    }

    private String email() { return "password-" + UUID.randomUUID() + "@example.com"; }
}
