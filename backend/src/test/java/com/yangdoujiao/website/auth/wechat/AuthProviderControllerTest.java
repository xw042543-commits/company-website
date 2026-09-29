package com.yangdoujiao.website.auth.wechat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AuthProviderControllerTest {
    @Test
    void returnsOnlyWechatAvailability() throws Exception {
        WechatAuthProperties properties = new WechatAuthProperties(false, "", "", null,
                Duration.ofMinutes(5), Duration.ofMinutes(15));
        MockMvcBuilders.standaloneSetup(new AuthProviderController(properties)).build()
                .perform(get("/api/v1/auth/providers"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"wechat\":false}", true));
    }
}
