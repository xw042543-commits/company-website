package com.yangdoujiao.website.auth.verification;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.yangdoujiao.website.auth.config.ProductionNotificationReadiness;
import com.yangdoujiao.website.auth.config.ProductionRegistrationProperties;

@Component
@Profile("prod")
public class ResendAuthNotificationSender implements AuthNotificationSender, ProductionNotificationReadiness {
    private final RestClient client;
    private final ResendProperties properties;
    private final URI publicSiteOrigin;

    @Autowired
    public ResendAuthNotificationSender(
            @Qualifier("resendRestClientBuilder") RestClient.Builder builder,
            ResendProperties properties,
            ProductionRegistrationProperties production) {
        this(builder, properties, production.publicSiteOrigin());
    }

    ResendAuthNotificationSender(RestClient.Builder builder, ResendProperties properties, URI publicSiteOrigin) {
        this.client = builder.build();
        this.properties = properties;
        this.publicSiteOrigin = publicSiteOrigin;
    }

    @Override
    public boolean isReady() {
        return hasText(properties.apiKey())
                && hasText(properties.from())
                && isOfficialResendEndpoint(properties.endpoint())
                && properties.requestTimeout() != null
                && !properties.requestTimeout().isNegative()
                && !properties.requestTimeout().isZero()
                && publicSiteOrigin != null
                && "https".equalsIgnoreCase(publicSiteOrigin.getScheme());
    }

    @Override
    public boolean isAvailable() {
        return isReady();
    }

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale) {
        sendEmailVerification(normalizedEmail, rawToken, locale, 0L, Instant.MAX);
    }

    @Override
    public void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale,
            long issueSequence, Instant expiresAt) {
        boolean chinese = Locale.CHINESE.getLanguage().equals(locale == null ? "" : locale.getLanguage());
        String url = actionUrl(chinese ? "zh" : "en", "verify-email", rawToken);
        String subject = chinese ? "验证您的 UDAJO 洋豆角账户" : "Verify your UDAJO account";
        String heading = chinese ? "验证邮箱" : "Verify your email";
        String instruction = chinese
                ? "请点击下面的链接完成邮箱验证。此链接有时效，请勿转发。"
                : "Use the link below to verify your email. This link expires and must not be shared.";
        send(normalizedEmail, subject, heading, instruction, url, chinese ? "验证邮箱" : "Verify email");
    }

    @Override
    public void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale) {
        throw new UnsupportedOperationException("Phone verification is not enabled");
    }

    @Override
    public void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale) {
        sendPasswordReset(normalizedIdentifier, rawToken, locale, 0L, Instant.MAX);
    }

    @Override
    public void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale,
            long issueSequence, Instant expiresAt) {
        boolean chinese = Locale.CHINESE.getLanguage().equals(locale == null ? "" : locale.getLanguage());
        String url = actionUrl(chinese ? "zh" : "en", "reset-password", rawToken);
        String subject = chinese ? "重设您的 UDAJO 洋豆角密码" : "Reset your UDAJO password";
        String heading = chinese ? "重设密码" : "Reset your password";
        String instruction = chinese
                ? "请点击下面的链接设置新密码。如果不是您本人操作，请忽略此邮件。"
                : "Use the link below to choose a new password. Ignore this email if you did not request it.";
        send(normalizedIdentifier, subject, heading, instruction, url, chinese ? "重设密码" : "Reset password");
    }

    private void send(String recipient, String subject, String heading, String instruction,
            String url, String buttonLabel) {
        if (!isReady()) throw new IllegalStateException("Resend notification provider is not configured");
        String html = """
                <!doctype html><html><body style="font-family:Arial,sans-serif;color:#173f36">
                <h1>%s</h1><p>%s</p><p><a href="%s">%s</a></p>
                <p style="color:#61756f">UDAJO 洋豆角 · yangdoujiao.com</p>
                </body></html>
                """.formatted(heading, instruction, url, buttonLabel);
        String text = heading + "\n\n" + instruction + "\n\n" + url + "\n\nUDAJO 洋豆角";
        Map<String, Object> payload = Map.of(
                "from", properties.from(),
                "to", List.of(recipient),
                "subject", subject,
                "html", html,
                "text", text);
        client.post()
                .uri(properties.endpoint())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + properties.apiKey())
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }

    private String actionUrl(String locale, String page, String token) {
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        return publicSiteOrigin + "/" + locale + "/" + page + "?token=" + encoded;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean isOfficialResendEndpoint(URI endpoint) {
        return endpoint != null
                && "https".equalsIgnoreCase(endpoint.getScheme())
                && "api.resend.com".equalsIgnoreCase(endpoint.getHost())
                && endpoint.getPort() == -1
                && endpoint.getRawUserInfo() == null
                && "/emails".equals(endpoint.getRawPath())
                && endpoint.getRawQuery() == null
                && endpoint.getRawFragment() == null;
    }
}
