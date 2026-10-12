package com.yangdoujiao.website.consultation;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.common.exception.ApiException;

@Component
public class ConsultationRateLimiter {

    private static final String KEY_PREFIX = "consultation:rate:";
    private static final DefaultRedisScript<Long> INCREMENT_WITH_EXPIRY = new DefaultRedisScript<>("""
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('PEXPIRE', KEYS[1], ARGV[1])
            end
            return current
            """, Long.class);

    private final StringRedisTemplate redis;
    private final int maximumSubmissions;
    private final Duration window;

    public ConsultationRateLimiter(
            StringRedisTemplate redis,
            @Value("${app.consultation.rate-limit.maximum-submissions:5}") int maximumSubmissions,
            @Value("${app.consultation.rate-limit.window:10m}") Duration window
    ) {
        if (maximumSubmissions <= 0) {
            throw new IllegalArgumentException("Consultation rate-limit maximum submissions must be positive");
        }
        if (window == null || window.isNegative() || window.isZero()) {
            throw new IllegalArgumentException("Consultation rate-limit window must be positive");
        }
        if (window.toMillis() <= 0) {
            throw new IllegalArgumentException("Consultation rate-limit window must be at least one millisecond");
        }
        this.redis = redis;
        this.maximumSubmissions = maximumSubmissions;
        this.window = window;
    }

    public void check(String clientAddress) {
        try {
            Long submissions = redis.execute(
                    INCREMENT_WITH_EXPIRY,
                    List.of(KEY_PREFIX + hash(clientAddress)),
                    Long.toString(window.toMillis())
            );
            if (submissions == null) {
                throw unavailable();
            }
            if (submissions > maximumSubmissions) {
                throw new ApiException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "CONSULTATION_RATE_LIMITED",
                        "Too many consultation submissions"
                );
            }
        } catch (DataAccessException exception) {
            throw unavailable();
        }
    }

    private String hash(String clientAddress) {
        String value = clientAddress == null ? "unknown" : clientAddress;
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private ApiException unavailable() {
        return new ApiException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "CONSULTATION_SUBMISSION_UNAVAILABLE",
                "Consultation submission is not available"
        );
    }

}
