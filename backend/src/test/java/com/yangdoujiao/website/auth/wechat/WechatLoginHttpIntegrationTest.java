package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockCookie;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.TestContainersConfiguration;

import jakarta.servlet.http.Cookie;

@SpringBootTest(properties = {
        "app.auth.wechat.enabled=true",
        "app.auth.wechat.app-id=test-wechat-client",
        "app.auth.wechat.app-secret=test-wechat-secret",
        "app.auth.wechat.callback-url=https://yangdoujiao.com/api/v1/auth/wechat/callback"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class WechatLoginHttpIntegrationTest {
    private static final String PASSWORD = "correct-horse-42";

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder passwords;
    @MockitoBean private WechatAuthorizationProvider provider;

    @Test
    void qrConfigurationReturnsPublicValuesAndBindsStateToTheBrowserSession() throws Exception {
        MvcResult config = mvc.perform(get("/api/v1/auth/wechat/qr-config")
                        .param("locale", "zh").param("returnTo", "/zh/account"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL,
                        CacheControl.noStore().getHeaderValue()))
                .andExpect(jsonPath("$.appId").value("test-wechat-client"))
                .andExpect(jsonPath("$.scope").value("snsapi_login"))
                .andExpect(jsonPath("$.redirectUri").value(
                        "https://yangdoujiao.com/api/v1/auth/wechat/callback"))
                .andExpect(jsonPath("$.state").isNotEmpty())
                .andReturn();

        assertThat(config.getResponse().getContentAsString()).doesNotContain("test-wechat-secret");
        assertThat(cookie(config.getResponse(), "JSESSIONID").getValue()).isNotBlank();
    }

    @Test
    void linkedWechatIdentitySignsInAndRotatesTheSession() throws Exception {
        long userId = account(email());
        identity(userId, "linked-subject");
        when(provider.authorizationUri(anyString())).thenAnswer(invocation ->
                URI.create("https://provider.example/authorize?state=" + invocation.getArgument(0, String.class)));
        when(provider.exchange("linked-code"))
                .thenReturn(new WechatProviderIdentity("test-wechat-client", "linked-subject"));

        MvcResult start = start("zh", "/zh/account");
        Cookie oldSession = cookie(start.getResponse(), "JSESSIONID");
        String state = query(start, "state");

        MvcResult callback = mvc.perform(get("/api/v1/auth/wechat/callback")
                        .param("code", "linked-code").param("state", state).cookie(oldSession))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "/zh/account"))
                .andReturn();

        Cookie signedInSession = cookie(callback.getResponse(), "JSESSIONID");
        assertThat(signedInSession.getValue()).isNotEqualTo(oldSession.getValue());
        mvc.perform(get("/api/v1/auth/session").cookie(signedInSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value((int) userId));
    }

    @Test
    void unlinkedWechatIdentityCreatesAnExternalAccountAndSignsIn() throws Exception {
        String subject = "new-subject-" + UUID.randomUUID();
        when(provider.authorizationUri(anyString())).thenAnswer(invocation ->
                URI.create("https://provider.example/authorize?state=" + invocation.getArgument(0, String.class)));
        when(provider.exchange("new-code"))
                .thenReturn(new WechatProviderIdentity("test-wechat-client", subject));

        MvcResult start = start("en", "/en/account");
        Cookie oldSession = cookie(start.getResponse(), "JSESSIONID");
        String state = query(start, "state");
        MvcResult callback = mvc.perform(get("/api/v1/auth/wechat/callback")
                        .param("code", "new-code").param("state", state).cookie(oldSession))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "/en/account"))
                .andReturn();

        Cookie signedInSession = cookie(callback.getResponse(), "JSESSIONID");
        assertThat(signedInSession.getValue()).isNotEqualTo(oldSession.getValue());
        MvcResult authenticated = mvc.perform(get("/api/v1/auth/session").cookie(signedInSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andReturn();
        Number userId = com.jayway.jsonpath.JsonPath.read(
                authenticated.getResponse().getContentAsString(), "$.userId");

        assertThat(jdbc.queryForMap("""
                SELECT a.normalized_email, a.normalized_phone, a.password_hash, a.status,
                       a.agreement_version, a.privacy_version
                FROM user_accounts a
                JOIN user_external_identities i ON i.user_account_id = a.id
                WHERE i.provider = 'WECHAT' AND i.provider_client_id = 'test-wechat-client'
                    AND i.provider_subject = ? AND a.id = ?
                """, subject, userId.longValue()))
                .containsEntry("status", "ACTIVE")
                .containsEntry("agreement_version", "test-terms-v1")
                .containsEntry("privacy_version", "test-privacy-v1")
                .containsEntry("normalized_email", null)
                .containsEntry("normalized_phone", null)
                .containsEntry("password_hash", null);
    }

    private MvcResult start(String locale, String returnTo) throws Exception {
        return mvc.perform(get("/api/v1/auth/wechat/start").param("locale", locale).param("returnTo", returnTo))
                .andExpect(status().isFound())
                .andReturn();
    }

    private String query(MvcResult result, String name) {
        String location = result.getResponse().getHeader("Location");
        return UriComponentsBuilder.fromUriString(location).build().getQueryParams().getFirst(name);
    }

    private Cookie cookie(MockHttpServletResponse response, String name) {
        return response.getHeaders(HttpHeaders.SET_COOKIE).stream().map(MockCookie::parse)
                .filter(cookie -> name.equals(cookie.getName())).findFirst()
                .orElseThrow(() -> new AssertionError("Missing " + name + " cookie"));
    }

    private long account(String email) {
        OffsetDateTime now = OffsetDateTime.now();
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    email_verified_at, agreement_version, privacy_version, created_at, updated_at)
                VALUES ('WeChat Test User', ?, ?, 'ACTIVE', ?, 'test-terms-v1', 'test-privacy-v1', ?, ?)
                RETURNING id
                """, Long.class, email, passwords.encode(PASSWORD), now, now, now);
    }

    private void identity(long userId, String subject) {
        jdbc.update("""
                INSERT INTO user_external_identities
                    (user_account_id, provider, provider_client_id, provider_subject)
                VALUES (?, 'WECHAT', 'test-wechat-client', ?)
                """, userId, subject);
    }

    private String email() {
        return "wechat-" + UUID.randomUUID() + "@example.com";
    }
}
