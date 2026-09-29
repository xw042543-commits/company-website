package com.yangdoujiao.website.auth.api;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class RegistrationNotificationOutageHttpIntegrationTest {
    private static final AtomicInteger ADDRESS = new AtomicInteger();

    @Autowired private MockMvc mvc;
    @MockitoBean private LocalAuthNotificationStore notifications;

    @Test
    void notificationOutageReturnsSame503BeforeAccountLookup() throws Exception {
        when(notifications.isAvailable()).thenReturn(true);
        String known = email();
        mvc.perform(register(known)).andExpect(status().isAccepted());

        when(notifications.isAvailable()).thenReturn(false);
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + known + "\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AUTH_SERVICE_UNAVAILABLE"));
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + email() + "\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AUTH_SERVICE_UNAVAILABLE"));
        mvc.perform(register(email())).andExpect(status().isServiceUnavailable());
        mvc.perform(register(known)).andExpect(status().isServiceUnavailable());
    }

    private MockHttpServletRequestBuilder register(String email) {
        return write("register", "{\"fullName\":\"Test\",\"email\":\"" + email
                + "\",\"password\":\"correct-horse-42\",\"agreementAccepted\":true,\"privacyAccepted\":true}");
    }

    private MockHttpServletRequestBuilder write(String endpoint, String json) {
        int address = ADDRESS.incrementAndGet();
        return post("/api/v1/auth/" + endpoint).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(json)
                .with(request -> {
                    request.setRemoteAddr("198.52." + address / 250 + "." + (address % 250 + 1));
                    return request;
                });
    }

    private String email() {
        return "notification-outage-" + UUID.randomUUID() + "@example.com";
    }
}
