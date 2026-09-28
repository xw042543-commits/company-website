package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.AccountIdentifierType;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;
import com.yangdoujiao.website.auth.verification.VerificationService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class RegistrationHttpIntegrationTest {
    private static final AtomicInteger ADDRESS = new AtomicInteger();
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @MockitoSpyBean private PasswordEncoder passwords;
    @MockitoSpyBean private VerificationService verification;
    @MockitoSpyBean private LocalAuthNotificationStore notifications;

    @Test
    void duplicateRegistrationStillRunsPasswordEncoding() throws Exception {
        String email = email();
        register(email, null);
        verify(passwords, times(1)).encode("correct-horse-42");
        register(email, null);
        verify(passwords, times(2)).encode("correct-horse-42");
    }

    @Test
    void resendPreparesChallengeForKnownAndUnknownIdentifiers() throws Exception {
        String known = email();
        register(known, null);
        clearInvocations(verification);
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + known + "\"}"))
                .andExpect(status().isAccepted());
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + email() + "\"}"))
                .andExpect(status().isAccepted());
        verify(verification, times(2)).prepareForResend(AccountIdentifierType.EMAIL);
    }

    @Test
    void notificationOutageReturnsSame503BeforeAccountLookup() throws Exception {
        String known = email();
        register(known, null);
        doReturn(false).when(notifications).isAvailable();
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + known + "\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AUTH_SERVICE_UNAVAILABLE"));
        mvc.perform(write("resend-verification", "{\"identifier\":\"" + email() + "\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AUTH_SERVICE_UNAVAILABLE"));
        mvc.perform(write("register", "{\"fullName\":\"Test\",\"email\":\"" + email()
                        + "\",\"password\":\"correct-horse-42\",\"agreementAccepted\":true,\"privacyAccepted\":true}"))
                .andExpect(status().isServiceUnavailable());
        mvc.perform(write("register", "{\"fullName\":\"Test\",\"email\":\"" + known
                        + "\",\"password\":\"correct-horse-42\",\"agreementAccepted\":true,\"privacyAccepted\":true}"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void unexpectedPostCommitDeliveryFailureDoesNotExposeAccountExistence() throws Exception {
        String known = email();
        register(known, null);
        doThrow(new IllegalStateException("secret-provider-message")).when(notifications)
                .sendEmailVerification(anyString(), anyString(), any(), anyLong());
        String knownResponse = mvc.perform(write("resend-verification", "{\"identifier\":\"" + known + "\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        String unknownResponse = mvc.perform(write("resend-verification", "{\"identifier\":\"" + email() + "\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        assertThat(knownResponse).isEqualTo(unknownResponse);
    }

    @Test
    void registersEmailAccountWithoutExposingTokenAndConsumesItOnce() throws Exception {
        String email = email();
        String response = register(email.toUpperCase(), null);
        assertThat(JsonPath.<String>read(response, "$.verificationMethod")).isEqualTo("EMAIL");
        assertThat(response).doesNotContain("token", "password", "userId");
        String hash = jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE normalized_email = ?", String.class, email);
        assertThat(passwords.matches("correct-horse-42", hash)).isTrue();
        String notification = latest(email);
        String token = JsonPath.read(notification, "$.token");
        assertThat(jdbc.queryForObject("SELECT token_hash FROM user_verification_tokens WHERE user_id = (SELECT id FROM user_accounts WHERE normalized_email = ?)", String.class, email))
                .hasSize(64).isNotEqualTo(token);
        mvc.perform(write("verify-email", "{\"token\":\"" + token + "\"}")).andExpect(status().isNoContent());
        assertThat(jdbc.queryForObject("SELECT status FROM user_accounts WHERE normalized_email = ?", String.class, email)).isEqualTo("ACTIVE");
        mvc.perform(write("verify-email", "{\"token\":\"" + token + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_VERIFICATION_TOKEN"));
    }

    @Test
    void duplicateRegistrationIsGenericAndDoesNotReplacePasswordOrToken() throws Exception {
        String email = email();
        String first = register(email, null);
        String token = latest(email);
        assertThat(register(email, null)).isEqualTo(first);
        mvc.perform(get("/api/dev/auth/notifications/latest").param("identifier", email))
                .andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE normalized_email = ?", Integer.class, email)).isEqualTo(1);
        assertThat(token).contains("token");
    }

    @Test
    void verifiesPhoneAndUsesGenericFailureForUnknownAndIncorrectCodes() throws Exception {
        String phone = "+60" + String.format("%010d", Math.abs(UUID.randomUUID().getLeastSignificantBits() % 10000000000L));
        register(null, phone);
        String code = JsonPath.read(latest(phone), "$.token");
        mvc.perform(write("verify-phone", "{\"phone\":\"" + phone + "\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(write("verify-phone", "{\"phone\":\"+601111111111\",\"code\":\"000000\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_VERIFICATION_TOKEN"));
    }

    @Test
    void localRetrievalRequiresExactIdentifierLoopbackAndDeletesOnRead() throws Exception {
        String email = email();
        register(email, null);
        mvc.perform(get("/api/dev/auth/notifications/latest").param("identifier", email)
                        .with(request -> { request.setRemoteAddr("198.51.100.10"); return request; })
                        .header("X-Forwarded-For", "127.0.0.1"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/dev/auth/notifications/latest").param("identifier", email.toUpperCase()))
                .andExpect(status().isNotFound());
        latest(email);
        mvc.perform(get("/api/dev/auth/notifications/latest").param("identifier", email))
                .andExpect(status().isNotFound());
    }

    @Test
    void validatesContactsConsentAndPasswordAndProtectsEveryWrite() throws Exception {
        for (String endpoint : new String[] {"register", "verify-email", "verify-phone", "resend-verification"}) {
            mvc.perform(post("/api/v1/auth/" + endpoint).contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
            mvc.perform(write(endpoint, "{\"padding\":\"" + "x".repeat(8300) + "\"}"))
                    .andExpect(status().is(413)).andExpect(jsonPath("$.code").value("AUTH_PAYLOAD_TOO_LARGE"));
        }
        mvc.perform(write("register", """
                {"fullName":"Test","email":"a@example.com","phone":"+60123456789","password":"correct-horse-42",
                 "agreementAccepted":true,"privacyAccepted":true}
                """)).andExpect(status().isBadRequest());
        mvc.perform(write("register", """
                {"fullName":"Test","email":"a@example.com","password":"short","agreementAccepted":false,"privacyAccepted":true}
                """)).andExpect(status().isBadRequest());
    }

    @Test
    void resendIsGenericAndInvalidatesPreviousToken() throws Exception {
        String email = email();
        register(email, null);
        String old = JsonPath.read(latest(email), "$.token");
        var known = mvc.perform(write("resend-verification", "{\"identifier\":\"" + email + "\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        var unknown = mvc.perform(write("resend-verification", "{\"identifier\":\"" + email() + "\"}"))
                .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        assertThat(known).isEqualTo(unknown);
        mvc.perform(write("verify-email", "{\"token\":\"" + old + "\"}"))
                .andExpect(status().isBadRequest());
        String fresh = JsonPath.read(latest(email), "$.token");
        mvc.perform(write("verify-email", "{\"token\":\"" + fresh + "\"}"))
                .andExpect(status().isNoContent());
    }

    private String register(String email, String phone) throws Exception {
        String contact = email == null ? "\"phone\":\"" + phone + "\"" : "\"email\":\"" + email + "\"";
        return mvc.perform(write("register", "{\"fullName\":\"Wang Xin\"," + contact
                        + ",\"password\":\"correct-horse-42\",\"agreementAccepted\":true,\"privacyAccepted\":true}"))
                .andExpect(status().isAccepted()).andExpect(header().exists("X-Trace-Id"))
                .andReturn().getResponse().getContentAsString();
    }

    private String latest(String identifier) throws Exception {
        return mvc.perform(get("/api/dev/auth/notifications/latest").param("identifier", identifier))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andReturn().getResponse().getContentAsString();
    }

    private MockHttpServletRequestBuilder write(String endpoint, String json) {
        int address = ADDRESS.incrementAndGet();
        return post("/api/v1/auth/" + endpoint).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(json)
                .with(request -> { request.setRemoteAddr("198.51." + address / 250 + "." + (address % 250 + 1)); return request; });
    }

    private String email() { return "task5-" + UUID.randomUUID() + "@example.com"; }
}
