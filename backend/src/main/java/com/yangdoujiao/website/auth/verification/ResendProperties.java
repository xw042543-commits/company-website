package com.yangdoujiao.website.auth.verification;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth.resend")
public record ResendProperties(String apiKey, String from, URI endpoint, Duration requestTimeout) {
}
