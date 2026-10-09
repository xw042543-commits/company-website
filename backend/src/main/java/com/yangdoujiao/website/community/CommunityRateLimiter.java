package com.yangdoujiao.website.community;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import com.yangdoujiao.website.common.exception.ApiException;

@Component
public class CommunityRateLimiter {
    private static final DefaultRedisScript<Long> CONSUME = new DefaultRedisScript<>("""
            local count = redis.call('INCR', KEYS[1])
            if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
            return count
            """, Long.class);
    private final StringRedisTemplate redis;
    private final CommunityProperties properties;
    private final CommunityMetrics metrics;
    public CommunityRateLimiter(StringRedisTemplate redis, CommunityProperties properties, CommunityMetrics metrics) {
        this.redis = redis; this.properties = properties; this.metrics = metrics;
    }
    public void checkPost(long accountId, String address) {
        check("post", accountId, address, properties.postPerMinute(), properties.postPerDay());
    }
    public void checkComment(long accountId, String address) {
        check("comment", accountId, address, properties.commentPerMinute(), properties.commentPerDay());
    }
    public void checkReport(long accountId, String address) {
        for (String subject : subjects(accountId, address)) consume("report", subject, "day", properties.reportPerDay(), 86400000);
    }
    private void check(String operation, long accountId, String address, int minute, int day) {
        for (String subject : subjects(accountId, address)) {
            consume(operation, subject, "minute", minute, 60000);
            consume(operation, subject, "day", day, 86400000);
        }
    }
    private List<String> subjects(long accountId, String address) {
        return List.of(hash("account:" + accountId), hash("address:" + address));
    }
    private String hash(String subject) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.cursorSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            // A distinct domain avoids reusing cursor MACs as address/account pseudonyms.
            return HexFormat.of().formatHex(mac.doFinal(("community-rate-v1:" + subject).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) { throw new IllegalStateException("Community rate hash unavailable"); }
    }
    private void consume(String operation, String subject, String window, int maximum, long milliseconds) {
        Long count;
        try {
            count = redis.execute(CONSUME, List.of("community:limit:v1:" + operation + ":" + subject + ":" + window),
                    Long.toString(milliseconds));
        } catch (DataAccessException exception) {
            metrics.redisUnavailable(command(operation));
            throw unavailable();
        }
        if (count == null) {
            metrics.redisUnavailable(command(operation));
            throw unavailable();
        }
        if (count > maximum) {
            metrics.rateLimited(command(operation));
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "COMMUNITY_RATE_LIMITED", "Too many community requests");
        }
    }
    private static CommunityMetrics.Command command(String operation) {
        return switch (operation) {
            case "post" -> CommunityMetrics.Command.POST;
            case "comment" -> CommunityMetrics.Command.COMMENT;
            default -> CommunityMetrics.Command.REPORT;
        };
    }
    static ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "COMMUNITY_WRITE_UNAVAILABLE", "Community writes are temporarily unavailable");
    }
}
