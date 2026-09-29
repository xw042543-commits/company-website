package com.yangdoujiao.website.auth.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;

@Configuration
public class PasswordEncodingConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(12);
        PasswordEncoder legacyBcrypt = new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return bcrypt.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                try {
                    return bcrypt.matches(rawPassword, encodedPassword);
                } catch (IllegalArgumentException exception) {
                    return false;
                }
            }
        };
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        encoders.put("bcrypt", legacyBcrypt);
        encoders.put("pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8());
        DelegatingPasswordEncoder encoder = new DelegatingPasswordEncoder("pbkdf2", encoders);
        // Existing development accounts used raw BCrypt hashes before an encoding id was stored.
        encoder.setDefaultPasswordEncoderForMatches(legacyBcrypt);
        return encoder;
    }
}
