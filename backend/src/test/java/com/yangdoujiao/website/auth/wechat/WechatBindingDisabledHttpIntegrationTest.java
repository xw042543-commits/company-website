package com.yangdoujiao.website.auth.wechat;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class WechatBindingDisabledHttpIntegrationTest {
    @Autowired private MockMvc mvc;

    @Test
    void disabledProviderRejectsAStillValidPendingBinding() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(WechatOAuthStateStore.PENDING_ATTRIBUTE,
                new PendingWechatIdentity("old-client", "old-subject", Instant.now().plusSeconds(300),
                        "zh", "/zh/account"));

        mvc.perform(post("/api/v1/auth/wechat/bind").with(csrf()).session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"member@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("WECHAT_AUTH_UNAVAILABLE"));
    }
}
