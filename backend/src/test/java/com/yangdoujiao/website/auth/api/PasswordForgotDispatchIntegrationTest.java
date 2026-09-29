package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccountLookup;
import com.yangdoujiao.website.auth.password.PasswordRecoveryDispatcher;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class, PasswordForgotDispatchIntegrationTest.QueuedRecovery.class})
class PasswordForgotDispatchIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder encoder;
    @Autowired private LocalAuthNotificationStore notifications;
    @Autowired private QueuedRecovery queued;
    @MockitoSpyBean private UserAccountLookup lookup;

    @Test
    void acceptedResponsesForAllAccountStatesPrecedeEveryAccountLookupAndTokenWrite() throws Exception {
        String active = email();
        String disabled = email();
        String absent = email();
        account(active, "ACTIVE");
        account(disabled, "DISABLED");

        String activeBody = mvc.perform(forgot(active)).andExpect(status().isAccepted())
                .andReturn().getResponse().getContentAsString();
        String absentBody = mvc.perform(forgot(absent)).andExpect(status().isAccepted())
                .andReturn().getResponse().getContentAsString();
        String disabledBody = mvc.perform(forgot(disabled)).andExpect(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        assertThat(activeBody).isEqualTo(absentBody).isEqualTo(disabledBody);
        assertThat(queued.pending).hasSize(3);
        verifyNoInteractions(lookup);
        assertThat(tokenCount(active)).isZero();
        assertThat(tokenCount(disabled)).isZero();
        assertThat(notifications.take(active)).isEmpty();

        Runnable work;
        while ((work = queued.pending.poll()) != null) work.run();
        verify(lookup, times(3)).findLoginAccount(org.mockito.ArgumentMatchers.any());
        assertThat(tokenCount(active)).isEqualTo(1);
        assertThat(tokenCount(disabled)).isZero();
        assertThat(notifications.awaitAvailable(active, Duration.ofSeconds(5))).isTrue();
        assertThat(notifications.take(active)).isPresent();
        assertThat(notifications.take(disabled)).isEmpty();
    }

    private MockHttpServletRequestBuilder forgot(String identifier) {
        return post("/api/v1/auth/forgot-password").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + identifier + "\"}");
    }

    private void account(String email, String status) {
        jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Password Test', ?, ?, ?, 'test-terms-v1', 'test-privacy-v1', ?, ?)
                """, email, encoder.encode("correct-horse-42"), status, OffsetDateTime.now(), OffsetDateTime.now());
    }

    private int tokenCount(String email) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE user_id = "
                + "(SELECT id FROM user_accounts WHERE normalized_email = ?)", Integer.class, email);
    }

    private String email() { return "queued-reset-" + UUID.randomUUID() + "@example.com"; }

    @TestConfiguration
    static class QueuedRecovery {
        private final Queue<Runnable> pending = new ConcurrentLinkedQueue<>();

        @Bean
        @Primary
        PasswordRecoveryDispatcher queuedPasswordRecoveryDispatcher() {
            return new PasswordRecoveryDispatcher(pending::add);
        }
    }
}
