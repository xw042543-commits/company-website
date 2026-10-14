package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest(properties = {
        "app.miniapp.auth.enabled=true",
        "app.miniapp.auth.wechat-app-id=test-miniapp",
        "app.miniapp.auth.wechat-app-secret=test-miniapp-secret",
        "app.consultation.submission-enabled=true",
        "app.consultation.privacy-notice-version=test-v1"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class MiniappAuthHttpIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private com.yangdoujiao.website.auth.external.UserExternalIdentityRepository identities;
    @MockitoBean private MiniappIdentityProvider provider;
    @MockitoBean private com.yangdoujiao.website.community.CommunityRiskPolicy nicknameSafety;

    @Test
    void nicknameIsAuthenticatedAndSurvivesReloginWithoutChangingAccountName() throws Exception {
        mvc.perform(put("/api/v1/miniapp/account/nickname").contentType(MediaType.APPLICATION_JSON)
                .content("{\"displayName\":\"测试昵称\"}")).andExpect(status().isUnauthorized());
        when(provider.exchange("nickname-code")).thenReturn(new MiniappProviderIdentity("test-miniapp", "nickname-" + UUID.randomUUID(), null));
        Session session = login("nickname-code");
        when(nicknameSafety.classify(session.accountId(), "测试昵称"))
                .thenReturn(com.yangdoujiao.website.community.CommunityRiskPolicy.RiskDecision.PUBLISH);
        mvc.perform(put("/api/v1/miniapp/account/nickname").header(HttpHeaders.AUTHORIZATION, "Bearer " + session.accessToken())
                .contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\" 测试昵称 \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.displayName").value("测试昵称"));
        Session again = login("nickname-code");
        mvc.perform(get("/api/v1/miniapp/account").header(HttpHeaders.AUTHORIZATION, "Bearer " + again.accessToken()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.displayName").value("测试昵称"));
        assertThat(jdbc.queryForObject("SELECT full_name FROM user_accounts WHERE id=?", String.class, session.accountId())).isEqualTo("微信用户");
        jdbc.update("""
                INSERT INTO user_external_identities (user_account_id, provider, provider_client_id, provider_subject,
                    display_name, created_at, last_login_at)
                VALUES (?, 'WECHAT', 'website-test', ?, '网页登录昵称', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day')
                """, session.accountId(), "website-" + UUID.randomUUID());
        assertThat(identities.findProfilesByAccountIds(java.util.List.of(session.accountId())).getFirst().getDisplayName())
                .isEqualTo("测试昵称");
    }

    @Test
    void loginReusesExternalAccountAndBearerCanReadAccount() throws Exception {
        String subject = "mini-subject-" + UUID.randomUUID();
        when(provider.exchange("first-code"))
                .thenReturn(new MiniappProviderIdentity("test-miniapp", subject, "union-private"));
        when(provider.exchange("second-code"))
                .thenReturn(new MiniappProviderIdentity("test-miniapp", subject, "union-private"));

        Session first = login("first-code");
        Session second = login("second-code");

        assertThat(second.accountId()).isEqualTo(first.accountId());
        assertThat(jdbc.queryForObject("""
                SELECT count(*) FROM user_external_identities
                 WHERE provider = 'WECHAT_MINI_PROGRAM'
                   AND provider_client_id = 'test-miniapp'
                   AND provider_subject = ?
                """, Integer.class, subject)).isOne();
        mvc.perform(get("/api/v1/miniapp/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + first.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(first.accountId().intValue()))
                .andExpect(jsonPath("$.displayName").value("微信用户"))
                .andExpect(jsonPath("$.bindingStatus").value("LINKED"))
                .andExpect(jsonPath("$.providerSubject").doesNotExist());
    }

    @Test
    void missingOrInvalidBearerCannotReadAccount() throws Exception {
        mvc.perform(get("/api/v1/miniapp/account")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/miniapp/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void bearerCanSubmitConsultationWithoutBrowserCsrfAndLinksItToTheAccount() throws Exception {
        String subject = "consultation-subject-" + UUID.randomUUID();
        String contact = "miniapp-consultation-" + UUID.randomUUID();
        when(provider.exchange("consultation-code"))
                .thenReturn(new MiniappProviderIdentity("test-miniapp", subject, null));
        Session session = login("consultation-code");

        mvc.perform(post("/api/v1/consultations")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + session.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"微信用户",
                                  "contact":"%s",
                                  "intendedSchool":"世纪大学",
                                  "qualification":"bachelor",
                                  "locale":"zh",
                                  "privacyConsent":true
                                }
                                """.formatted(contact)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.referenceCode").isNotEmpty());

        assertThat(jdbc.queryForObject("""
                SELECT user_account_id FROM consultation_enquiries WHERE contact = ?
                """, Long.class, contact)).isEqualTo(session.accountId());
        jdbc.update("DELETE FROM consultation_enquiries WHERE contact = ?", contact);
    }

    @Test
    void refreshRotatesTokenAndLogoutRevokesFamily() throws Exception {
        String subject = "rotate-subject-" + UUID.randomUUID();
        when(provider.exchange("rotate-code"))
                .thenReturn(new MiniappProviderIdentity("test-miniapp", subject, null));
        Session login = login("rotate-code");

        MvcResult refreshResult = mvc.perform(post("/api/v1/miniapp/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + login.refreshToken() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();
        String refreshedAccess = JsonPath.read(refreshResult.getResponse().getContentAsString(), "$.accessToken");
        String refreshedRefresh = JsonPath.read(refreshResult.getResponse().getContentAsString(), "$.refreshToken");
        assertThat(refreshedRefresh).isNotEqualTo(login.refreshToken());

        mvc.perform(post("/api/v1/miniapp/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + login.refreshToken() + "\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("MINIAPP_TOKEN_REUSED"));
        mvc.perform(get("/api/v1/miniapp/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshedAccess))
                .andExpect(status().isUnauthorized());

        Session freshFamily = login("rotate-code");
        mvc.perform(post("/api/v1/miniapp/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + freshFamily.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + freshFamily.refreshToken() + "\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/miniapp/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + freshFamily.accessToken()))
                .andExpect(status().isUnauthorized());
    }

    private Session login(String code) throws Exception {
        MvcResult result = mvc.perform(post("/api/v1/miniapp/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + code + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.account.bindingStatus").value("LINKED"))
                .andExpect(jsonPath("$.session_key").doesNotExist())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        return new Session(JsonPath.read(body, "$.accessToken"), JsonPath.read(body, "$.refreshToken"),
                ((Number) JsonPath.read(body, "$.account.id")).longValue());
    }

    private record Session(String accessToken, String refreshToken, Long accountId) {
    }
}
