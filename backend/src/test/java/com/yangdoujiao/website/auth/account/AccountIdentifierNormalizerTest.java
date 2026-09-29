package com.yangdoujiao.website.auth.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class AccountIdentifierNormalizerTest {
    private final AccountIdentifierNormalizer normalizer = new AccountIdentifierNormalizer();

    @Test
    void canonicalizesEmailWithUnicodeOuterWhitespace() {
        NormalizedIdentifier result = normalizer.normalizeLogin("\u2003Student.Name+tag@Example.COM\u00a0");
        assertThat(result.type()).isEqualTo(AccountIdentifierType.EMAIL);
        assertThat(result.value()).isEqualTo("student.name+tag@example.com");
    }

    @Test
    void acceptsOnlyCanonicalE164Phone() {
        assertThat(normalizer.normalizeLogin("+60123456789"))
                .isEqualTo(new NormalizedIdentifier(AccountIdentifierType.PHONE, "+60123456789"));
        for (String invalid : new String[] {"012-3456789", "+60 123456789", "+0123456789", "+1234567", "+1234567890123456"}) {
            assertThatThrownBy(() -> normalizer.normalizeLogin(invalid))
                    .isInstanceOf(AuthValidationException.class)
                    .hasMessageNotContaining(invalid);
        }
    }

    @Test
    void rejectsMissingAndMalformedEmailWithoutEchoingInput() {
        for (String invalid : new String[] {"\u2003\u00a0", "a..b@example.com", "bad@", "a b@example.com", "a@bad..example", "a@example.com<script>"}) {
            assertThatThrownBy(() -> normalizer.normalizeLogin(invalid))
                    .isInstanceOf(AuthValidationException.class)
                    .hasMessageNotContaining(invalid);
        }
        assertThatThrownBy(() -> normalizer.normalizeLogin(null)).isInstanceOf(AuthValidationException.class);
        assertThatThrownBy(() -> normalizer.normalizeLogin("a".repeat(245) + "@test.com"))
                .isInstanceOf(AuthValidationException.class);
    }

    @Test
    void rejectsUnicodeConfusablesAndControlsBeforeTrimming() {
        for (String invalid : new String[] {
                "ѕtudent@example.com", "student@exаmple.com", "student@example.com\r\n",
                "\tstudent@example.com", "student@example.com\u0000", "student@@example.com"
        }) {
            assertThatThrownBy(() -> normalizer.normalizeLogin(invalid))
                    .isInstanceOf(AuthValidationException.class)
                    .hasMessageNotContaining(invalid);
        }
    }

    @Test
    void acceptsMaximumLocalAndOverallEmailLengthsButRejectsOverflow() {
        String local = "a".repeat(64);
        String domain = "b".repeat(63) + "." + "c".repeat(63) + "." + "d".repeat(61);
        assertThat(normalizer.normalizeLogin(local + "@" + domain).value()).hasSize(254);
        assertThatThrownBy(() -> normalizer.normalizeLogin("a".repeat(65) + "@example.com"))
                .isInstanceOf(AuthValidationException.class);
        assertThatThrownBy(() -> normalizer.normalizeLogin(local + "@" + domain + "x"))
                .isInstanceOf(AuthValidationException.class);
    }
}
