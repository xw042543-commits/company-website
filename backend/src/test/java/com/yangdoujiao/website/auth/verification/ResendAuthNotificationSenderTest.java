package com.yangdoujiao.website.auth.verification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class ResendAuthNotificationSenderTest {

    @Test
    void sendsLocalizedSixDigitEmailCodeThroughResendWithoutPuttingTheSecretInThePayload() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        var sender = new ResendAuthNotificationSender(builder,
                properties("re_test_secret"), URI.create("https://yangdoujiao.com"));

        server.expect(once(), requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer re_test_secret"))
                .andExpect(jsonPath("$.from").value("UDAJO 洋豆角 <no-reply@notify.yangdoujiao.com>"))
                .andExpect(jsonPath("$.to[0]").value("student@example.com"))
                .andExpect(jsonPath("$.subject").value("验证您的 UDAJO 洋豆角账户"))
                .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.containsString("123456")))
                .andExpect(jsonPath("$.text").value(org.hamcrest.Matchers.containsString("5 分钟")))
                .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("verify-email?token="))))
                .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("re_test_secret"))))
                .andRespond(withSuccess("{\"id\":\"email_123\"}", MediaType.APPLICATION_JSON));

        sender.sendEmailVerification("student@example.com", "123456", Locale.CHINESE,
                1L, Instant.now().plus(Duration.ofMinutes(5)));

        server.verify();
    }

    @Test
    void sendsPasswordResetToTheLocalizedResetPage() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        var sender = new ResendAuthNotificationSender(builder,
                properties("re_test_secret"), URI.create("https://yangdoujiao.com"));

        server.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(jsonPath("$.subject").value("Reset your UDAJO password"))
                .andExpect(jsonPath("$.text").value(org.hamcrest.Matchers.containsString(
                        "https://yangdoujiao.com/en/reset-password?token=reset-token")))
                .andRespond(withSuccess("{\"id\":\"email_456\"}", MediaType.APPLICATION_JSON));

        sender.sendPasswordReset("student@example.com", "reset-token", Locale.ENGLISH,
                2L, Instant.now().plus(Duration.ofMinutes(30)));

        server.verify();
    }

    @Test
    void isNotReadyWithoutASecretAndRejectsPhoneDelivery() {
        var sender = new ResendAuthNotificationSender(RestClient.builder(),
                properties(""), URI.create("https://yangdoujiao.com"));

        assertThat(sender.isReady()).isFalse();
        assertThat(sender.isAvailable()).isFalse();
        assertThatThrownBy(() -> sender.sendPhoneVerification("+60123456789", "123456", Locale.ENGLISH))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void rejectsAnyEndpointThatCouldSendTheApiKeyOutsideTheOfficialResendApi() {
        for (String endpoint : new String[] {
                "http://api.resend.com/emails",
                "https://api.resend.com.evil.example/emails",
                "https://user@api.resend.com/emails",
                "https://api.resend.com:8443/emails",
                "https://api.resend.com/emails?redirect=evil"
        }) {
            var unsafe = new ResendProperties("re_test_secret",
                    "UDAJO 洋豆角 <no-reply@notify.yangdoujiao.com>",
                    URI.create(endpoint), Duration.ofSeconds(10));
            var sender = new ResendAuthNotificationSender(RestClient.builder(), unsafe,
                    URI.create("https://yangdoujiao.com"));
            assertThat(sender.isReady()).as(endpoint).isFalse();
        }
    }

    private ResendProperties properties(String apiKey) {
        return new ResendProperties(apiKey,
                "UDAJO 洋豆角 <no-reply@notify.yangdoujiao.com>",
                URI.create("https://api.resend.com/emails"), Duration.ofSeconds(10));
    }
}
