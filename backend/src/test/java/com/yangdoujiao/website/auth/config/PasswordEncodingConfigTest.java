package com.yangdoujiao.website.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class PasswordEncodingConfigTest {

    private final PasswordEncoder encoder = new PasswordEncodingConfig().passwordEncoder();

    @Test
    void encodesTheFullSupportedPasswordLengthWithoutBcryptTruncation() {
        String password = "密".repeat(128);

        String encoded = encoder.encode(password);

        assertThat(encoded).startsWith("{pbkdf2}");
        assertThat(encoder.matches(password, encoded)).isTrue();
        assertThat(encoder.matches(password.substring(0, 127), encoded)).isFalse();
    }

    @Test
    void stillMatchesLegacyRawBcryptHashes() {
        String password = "legacy-password-42";
        String legacyHash = new BCryptPasswordEncoder(12).encode(password);

        assertThat(encoder.matches(password, legacyHash)).isTrue();
    }
}
