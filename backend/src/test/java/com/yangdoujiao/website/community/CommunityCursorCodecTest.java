package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.json.JsonMapper;

class CommunityCursorCodecTest {
    private static final String SECRET = "test-community-cursor-secret-32-bytes";
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-08T00:00:00Z"), ZoneOffset.UTC);
    private final CommunityCursorCodec codec = new CommunityCursorCodec(JsonMapper.builder().build(), CLOCK, SECRET);

    @Test
    void roundTripsFullLongIdAndTimestampWithoutNumericJsonIdentifier() {
        String encoded = codec.encode(OffsetDateTime.parse("2026-10-07T23:00:00.123456Z"), Long.MAX_VALUE, "latest");
        var decoded = codec.decode(encoded, "latest");
        assertThat(decoded.id()).isEqualTo(Long.MAX_VALUE);
        assertThat(decoded.timestamp()).isEqualTo(OffsetDateTime.parse("2026-10-07T23:00:00.123456Z"));
        String payload = new String(Base64.getUrlDecoder().decode(encoded.split("\\.")[0]), StandardCharsets.UTF_8);
        assertThat(payload).contains("\"id\":\"9223372036854775807\"");
    }

    @Test
    void rejectsMalformedTamperedAndWrongScopeCursorsWithStableCode() {
        String valid = codec.encode(OffsetDateTime.now(CLOCK), 1L, "latest");
        for (String bad : new String[] { "", "not-base64", valid + "!", valid.substring(1), "a".repeat(4097) }) {
            invalid(() -> codec.decode(bad, "latest"));
        }
        invalid(() -> codec.decode(valid, "comments:1"));
        String[] parts = valid.split("\\.");
        invalid(() -> codec.decode(parts[0] + "." + "A".repeat(43), "latest"));
    }

    @Test
    void rejectsSignedInvalidTimestampUnsafeIdsAndExpiredCursors() throws Exception {
        for (String id : new String[] { "0", "-1", "9223372036854775808", "1.5", "01" }) {
            invalid(() -> codec.decode(signed("2026-10-07T00:00:00Z", id, "2026-10-09T00:00:00Z"), "latest"));
        }
        invalid(() -> codec.decode(signed("invalid", "1", "2026-10-09T00:00:00Z"), "latest"));
        invalid(() -> codec.decode(signed("2026-10-07T00:00:00Z", "1", "2026-10-08T00:00:00Z"), "latest"));
    }

    @Test
    void rejectsSignedNumericIdentifierInsteadOfDecimalString() throws Exception {
        String json = "{\"timestamp\":\"2026-10-07T00:00:00Z\",\"id\":1,\"sort\":\"latest\",\"expiresAt\":\"2026-10-09T00:00:00Z\"}";
        invalid(() -> codec.decode(signJson(json), "latest"));
    }

    private String signed(String timestamp, String id, String expiresAt) throws Exception {
        String json = "{\"timestamp\":\"" + timestamp + "\",\"id\":\"" + id
                + "\",\"sort\":\"latest\",\"expiresAt\":\"" + expiresAt + "\"}";
        return signJson(json);
    }

    private String signJson(String json) throws Exception {
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return payload + "." + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }

    private void invalid(org.assertj.core.api.ThrowableAssert.ThrowingCallable action) {
        assertThatThrownBy(action).isInstanceOfSatisfying(ApiException.class,
                error -> assertThat(error.getCode()).isEqualTo("INVALID_COMMUNITY_CURSOR"));
    }
}
