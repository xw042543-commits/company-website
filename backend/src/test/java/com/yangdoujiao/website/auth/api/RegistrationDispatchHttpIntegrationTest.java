package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.verification.AuthNotificationDispatcher;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, RegistrationDispatchHttpIntegrationTest.ControlledDispatch.class})
class RegistrationDispatchHttpIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private LocalAuthNotificationStore notifications;
    @Autowired private QueuedExecutor queue;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void httpReturnsAcceptedBeforeDeliveryAndResendBranchesSharePublicResult() throws Exception {
        String known = "queued-" + UUID.randomUUID() + "@example.com";
        var registration = mvc.perform(post("/api/v1/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Test\",\"email\":\"" + known
                                + "\",\"password\":\"correct-horse-42\",\"agreementAccepted\":true,\"privacyAccepted\":true}"))
                .andExpect(status().isAccepted()).andReturn().getResponse();
        assertThat(notifications.take(known)).isEmpty();
        assertThat(queue.size()).isEqualTo(1);
        queue.runNext();
        assertThat(notifications.take(known)).isPresent();
        jdbc.update("DELETE FROM auth_rate_limit_buckets WHERE scope = 'email-verification-cooldown' AND subject_hash = ?",
                com.yangdoujiao.website.auth.AuthHash.sha256(known));

        String knownResult = mvc.perform(post("/api/v1/auth/resend-verification").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"identifier\":\"" + known + "\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        String unknownResult = mvc.perform(post("/api/v1/auth/resend-verification").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"queued-" + UUID.randomUUID() + "@example.com\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        assertThat(knownResult).isEqualTo(unknownResult).isEqualTo(registration.getContentAsString());
        assertThat(queue.size()).isEqualTo(1);
        assertThat(notifications.take(known)).isEmpty();
        queue.runNext();
        assertThat(notifications.take(known)).isPresent();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ControlledDispatch {
        @Bean QueuedExecutor queuedExecutor() { return new QueuedExecutor(); }
        @Bean @Primary AuthNotificationDispatcher controlledDispatcher(QueuedExecutor queue) {
            return new AuthNotificationDispatcher(queue);
        }
    }

    static final class QueuedExecutor implements Executor {
        private final ConcurrentLinkedQueue<Runnable> tasks = new ConcurrentLinkedQueue<>();
        @Override public void execute(Runnable command) { tasks.add(command); }
        int size() { return tasks.size(); }
        void runNext() { tasks.remove().run(); }
    }
}
