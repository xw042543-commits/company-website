package com.yangdoujiao.website.community;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
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

    @Autowired
    public CommunityCursorCodec(ObjectMapper json, Clock clock,
            @Value("${app.community.cursor-secret:}") String secret, Environment environment) {
        this(json, clock, secret, environment.acceptsProfiles(Profiles.of("prod")));
    }

    public CommunityCursorCodec(ObjectMapper json, Clock clock, String secret) {
        this(json, clock, secret, false);
    }

    private CommunityCursorCodec(ObjectMapper json, Clock clock, String secret, boolean production) {
        this.json = json;
        this.clock = clock;
        if (secret.isBlank()) {
            if (production) throw new IllegalStateException("APP_COMMUNITY_CURSOR_SECRET is required in production (at least 32 bytes)");
            key = new byte[32];
            new SecureRandom().nextBytes(key);
        } else {
            key = secret.getBytes(StandardCharsets.UTF_8);
            if (key.length < 32) throw new IllegalArgumentException("Community cursor secret must contain at least 32 bytes");
        }
    }

    public String encode(OffsetDateTime timestamp, long id, String sort) {
        Payload payload = new Payload(timestamp.toString(), Long.toString(id), sort,
                OffsetDateTime.now(clock).plusHours(24).toString());
        return signed(payload);
    }

    public Position decode(String cursor, String expectedSort) {
        try {
            byte[] bytes = verified(cursor);
            if (!json.readTree(bytes).path("id").isString()) throw invalid();
            Payload payload = json.readValue(bytes, Payload.class);
            if (!expectedSort.equals(payload.sort()) || payload.id() == null || !payload.id().matches("[1-9][0-9]{0,18}")) throw invalid();
            long id = Long.parseLong(payload.id());
            OffsetDateTime timestamp = OffsetDateTime.parse(payload.timestamp());
            if (!OffsetDateTime.parse(payload.expiresAt()).isAfter(OffsetDateTime.now(clock))) throw invalid();
            return new Position(timestamp, id);
        } catch (RuntimeException exception) {
            throw invalid();
        }
    }

    public String encodeHot(String version, int nextOffset, OffsetDateTime expiresAt) {
        return signed(new HotPayload("hot", version, nextOffset, expiresAt.toString()));
    }

    public HotPosition decodeHot(String cursor) {
        try {
            HotPayload payload = json.readValue(verified(cursor), HotPayload.class);
            if (!"hot".equals(payload.sort()) || payload.snapshotVersion() == null
                    || !java.util.UUID.fromString(payload.snapshotVersion()).toString().equals(payload.snapshotVersion())
                    || payload.nextOffset() < 1 || payload.nextOffset() > 100000) throw invalid();
            OffsetDateTime expires = OffsetDateTime.parse(payload.expiresAt());
            if (!expires.isAfter(OffsetDateTime.now(clock))) throw expiredHot();
            return new HotPosition(payload.snapshotVersion(), payload.nextOffset(), expires);
        } catch (ApiException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw invalid();
        }
    }

    static ApiException expiredHot() {
        return new ApiException(HttpStatus.CONFLICT, "COMMUNITY_HOT_SNAPSHOT_EXPIRED", "Hot feed snapshot expired; restart without a cursor");
    }

    private String signed(Object payload) {
        String encoded = base64(json.writeValueAsBytes(payload));
        return encoded + "." + base64(sign(encoded));
    }

    private byte[] verified(String cursor) {
        if (cursor == null || cursor.length() > 4096 || !cursor.matches("[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]{43}")) throw invalid();
        String[] parts = cursor.split("\\.");
        byte[] signature = Base64.getUrlDecoder().decode(parts[1]);
        if (!base64(signature).equals(parts[1]) || !MessageDigest.isEqual(signature, sign(parts[0]))) throw invalid();
        byte[] bytes = Base64.getUrlDecoder().decode(parts[0]);
        if (!base64(bytes).equals(parts[0])) throw invalid();
        return bytes;
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
    private record Payload(String timestamp, String id, String sort, String expiresAt) {}
    private record HotPayload(String sort, String snapshotVersion, int nextOffset, String expiresAt) {}
    public record Position(OffsetDateTime timestamp, long id) {}
    public record HotPosition(String snapshotVersion, int nextOffset, OffsetDateTime expiresAt) {}
}
