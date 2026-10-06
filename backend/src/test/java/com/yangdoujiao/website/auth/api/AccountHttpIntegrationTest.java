package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;

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

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.AuthHash;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class AccountHttpIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;

    @Test
    void profileReturnsOnlyMaskedContactsAndPublicFields() throws Exception {
        String email = email();
        createAccount(email);
        Cookie session = login(email);
        mvc.perform(get("/api/v1/account").cookie(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Account Test"))
                .andExpect(jsonPath("$.email").value("a***@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.phoneVerified").value(false))
                .andExpect(jsonPath("$.wechatLinked").value(false))
                .andExpect(jsonPath("$.wechatLastLoginAt").doesNotExist())
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.agreementVersion").doesNotExist());
    }

    @Test
    void profileShowsWechatConnectionWithoutExposingProviderIdentifiers() throws Exception {
        String email = email();
        long id = createAccount(email);
        OffsetDateTime linkedAt = OffsetDateTime.parse("2026-10-06T08:30:00Z");
        jdbc.update("""
                INSERT INTO user_external_identities
                    (user_account_id, provider, provider_client_id, provider_subject, created_at, last_login_at)
                VALUES (?, 'WECHAT', 'wechat-app', 'private-wechat-subject', ?, ?)
                """, id, linkedAt, linkedAt);
        Cookie session = login(email);

        mvc.perform(get("/api/v1/account").cookie(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.wechatLinked").value(true))
                .andExpect(jsonPath("$.wechatLastLoginAt").value("2026-10-06T08:30:00Z"))
                .andExpect(jsonPath("$.providerSubject").doesNotExist())
                .andExpect(jsonPath("$.providerClientId").doesNotExist());
    }

    @Test
    void deletionRequiresPasswordAndConfirmationAndRevokesEverySession() throws Exception {
        String email = email();
        long id = createAccount(email);
        Cookie first = login(email);
        Cookie second = login(email);
        jdbc.update("""
                INSERT INTO user_verification_tokens (user_id, token_type, token_hash, expires_at)
                VALUES (?, 'EMAIL', ?, ?)
                """, id, AuthHash.sha256("verify-" + email), OffsetDateTime.now().plusHours(1));
        jdbc.update("""
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES (?, ?, ?)
                """, id, AuthHash.sha256("reset-" + email), OffsetDateTime.now().plusHours(1));
        mvc.perform(deleteRequest(first, "wrong-password", "DELETE"))
                .andExpect(status().isBadRequest());
        mvc.perform(deleteRequest(first, "correct-horse-42", "delete"))
                .andExpect(status().isBadRequest());
        assertThat(accountStatus(id)).isEqualTo("ACTIVE");
        mvc.perform(deleteRequest(first, "correct-horse-42", "DELETE"))
                .andExpect(status().isNoContent());
        assertThat(accountStatus(id)).isEqualTo("DELETED");
        assertThat(jdbc.queryForObject("SELECT deleted_at FROM user_accounts WHERE id = ?", OffsetDateTime.class, id))
                .isNotNull();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM spring_session WHERE principal_name = ?",
                Integer.class, "user:" + id)).isZero();
        assertThat(jdbc.queryForObject("SELECT used_at FROM user_verification_tokens WHERE user_id = ?",
                OffsetDateTime.class, id)).isNotNull();
        assertThat(jdbc.queryForObject("SELECT used_at FROM password_reset_tokens WHERE user_id = ?",
                OffsetDateTime.class, id)).isNotNull();
        mvc.perform(get("/api/v1/account").cookie(first)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/account").cookie(second)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + email + "\",\"password\":\"correct-horse-42\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void alreadyDeletedAccountCannotReadOrDeleteThroughExistingSession() throws Exception {
        String email = email();
        long id = createAccount(email);
        Cookie session = login(email);
        jdbc.update("UPDATE user_accounts SET status = 'DELETED', deleted_at = ? WHERE id = ?",
                OffsetDateTime.now(), id);
        mvc.perform(get("/api/v1/account").cookie(session)).andExpect(status().isUnauthorized());
        mvc.perform(deleteRequest(session, "correct-horse-42", "DELETE"))
                .andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder deleteRequest(
            Cookie session, String password, String confirmation) {
        return delete("/api/v1/account").with(csrf()).cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"" + password + "\",\"confirmation\":\""
                        + confirmation + "\"}");
    }

    private Cookie login(String email) throws Exception {
        MvcResult result = mvc.perform(post("/api/v1/auth/login").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + email + "\",\"password\":\"correct-horse-42\"}"))
                .andExpect(status().isOk()).andReturn();
        for (Cookie cookie : result.getResponse().getCookies()) {
            if ("JSESSIONID".equals(cookie.getName())) return cookie;
        }
        throw new AssertionError("Missing session cookie");
    }

    private long createAccount(String email) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    email_verified_at, agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Account Test', ?, ?, 'ACTIVE', ?, 'terms-v1', 'privacy-v1', ?, ?)
                RETURNING id
                """, Long.class, email, passwords.encode("correct-horse-42"), OffsetDateTime.now(),
                OffsetDateTime.now(), OffsetDateTime.now());
    }

    private String accountStatus(long id) {
        return jdbc.queryForObject("SELECT status FROM user_accounts WHERE id = ?", String.class, id);
    }

    private String email() { return "account-" + UUID.randomUUID() + "@example.com"; }
}
