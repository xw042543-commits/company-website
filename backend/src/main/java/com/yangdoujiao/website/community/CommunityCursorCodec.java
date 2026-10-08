package com.yangdoujiao.website.community;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.ObjectMapper;

/** Signed, scope-bound keyset cursors. A shared secret preserves cursors across replicas/restarts. */
@Component
public class CommunityCursorCodec {
    private final ObjectMapper json;
    private final Clock clock;
    private final byte[] key;

    public CommunityCursorCodec(ObjectMapper json, Clock clock,
            @Value("${app.community.cursor-secret:}") String secret) {
        this.json = json;
        this.clock = clock;
        if (secret.isBlank()) {
            key = new byte[32];
            new SecureRandom().nextBytes(key);
        } else {
            key = secret.getBytes(StandardCharsets.UTF_8);
            if (key.length < 32) throw new IllegalArgumentException("Community cursor secret must contain at least 32 bytes");
        }
    }

    public String encode(OffsetDateTime timestamp, long id, String sort) {
        return encode(timestamp, id, sort, null, null);
    }

    public String encode(OffsetDateTime timestamp, long id, String sort, OffsetDateTime snapshotAt, BigDecimal score) {
        Payload payload = new Payload(timestamp.toString(), Long.toString(id), sort,
                OffsetDateTime.now(clock).plusHours(24).toString(),
                snapshotAt == null ? null : snapshotAt.toString(), score == null ? null : score.toPlainString());
        String encoded = base64(json.writeValueAsBytes(payload));
        return encoded + "." + base64(sign(encoded));
    }

    public Position decode(String cursor, String expectedSort) {
        try {
            if (cursor == null || cursor.length() > 4096 || !cursor.matches("[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]{43}")) throw invalid();
            String[] parts = cursor.split("\\.");
            byte[] signature = Base64.getUrlDecoder().decode(parts[1]);
            if (!base64(signature).equals(parts[1]) || !MessageDigest.isEqual(signature, sign(parts[0]))) throw invalid();
            byte[] bytes = Base64.getUrlDecoder().decode(parts[0]);
            if (!base64(bytes).equals(parts[0])) throw invalid();
            if (!json.readTree(bytes).path("id").isString()) throw invalid();
            Payload payload = json.readValue(bytes, Payload.class);
            if (!expectedSort.equals(payload.sort()) || payload.id() == null || !payload.id().matches("[1-9][0-9]{0,18}")) throw invalid();
            long id = Long.parseLong(payload.id());
            OffsetDateTime timestamp = OffsetDateTime.parse(payload.timestamp());
            if (!OffsetDateTime.parse(payload.expiresAt()).isAfter(OffsetDateTime.now(clock))) throw invalid();
            OffsetDateTime snapshot = payload.snapshotAt() == null ? null : OffsetDateTime.parse(payload.snapshotAt());
            BigDecimal score = payload.score() == null ? null : new BigDecimal(payload.score());
            if ("hot".equals(expectedSort)) {
                if (snapshot == null || score == null || score.signum() < 0 || score.scale() > 12
                        || score.precision() > 30 || timestamp.isAfter(snapshot) || snapshot.isAfter(OffsetDateTime.now(clock))) throw invalid();
            } else if (snapshot != null || score != null) throw invalid();
            return new Position(timestamp, id, snapshot, score);
        } catch (RuntimeException exception) {
            throw invalid();
        }
    }

    private byte[] sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (java.security.GeneralSecurityException exception) {
            throw new IllegalStateException("Community cursor signing unavailable", exception);
        }
    }

    private static String base64(byte[] bytes) { return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private static ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_COMMUNITY_CURSOR", "Community cursor is invalid or expired");
    }
    private record Payload(String timestamp, String id, String sort, String expiresAt, String snapshotAt, String score) {}
    public record Position(OffsetDateTime timestamp, long id, OffsetDateTime snapshotAt, BigDecimal score) {}
}
