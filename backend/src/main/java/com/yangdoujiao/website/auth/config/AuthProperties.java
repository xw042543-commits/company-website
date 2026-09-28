package com.yangdoujiao.website.auth.config;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties("app.auth")
public record AuthProperties(
        boolean registrationEnabled,
        String agreementVersion,
        String privacyVersion,
        Duration sessionTimeout,
        Duration rememberedSessionTimeout,
        Duration emailVerificationTtl,
        Duration phoneVerificationTtl,
        Duration passwordResetTtl,
        DataSize maximumBodySize,
        String[] trustedProxies
) {
    @PostConstruct
    public void validate() {
        if (registrationEnabled && (blank(agreementVersion) || blank(privacyVersion))) {
            throw new IllegalStateException("app.auth agreement-version and privacy-version are required when registration is enabled");
        }
        positive(sessionTimeout, "session-timeout");
        positive(rememberedSessionTimeout, "remembered-session-timeout");
        positive(emailVerificationTtl, "email-verification-ttl");
        positive(phoneVerificationTtl, "phone-verification-ttl");
        positive(passwordResetTtl, "password-reset-ttl");
        if (rememberedSessionTimeout.compareTo(sessionTimeout) < 0) {
            throw new IllegalStateException("app.auth remembered-session-timeout must be at least session-timeout");
        }
        if (maximumBodySize == null || maximumBodySize.toBytes() <= 0 || maximumBodySize.toBytes() > 1024 * 1024) {
            throw new IllegalStateException("app.auth maximum-body-size must be between 1 byte and 1 MB");
        }
        if (trustedProxies == null) throw new IllegalStateException("app.auth trusted-proxies is required");
        for (String proxy : trustedProxies) {
            if (!validProxy(proxy)) throw new IllegalStateException("app.auth trusted-proxies must contain literal IP or CIDR entries");
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static void positive(Duration value, String name) {
        if (value == null || value.isZero() || value.isNegative() || value.compareTo(Duration.ofDays(365)) > 0) {
            throw new IllegalStateException("app.auth " + name + " must be positive and no more than 365 days");
        }
    }

    private static boolean validProxy(String raw) {
        if (raw == null || raw.isBlank()) return false;
        String[] parts = raw.trim().split("/", -1);
        if (parts.length > 2) return false;
        String address = parts[0];
        boolean ipv6 = address.contains(":");
        if (ipv6) {
            if (!address.matches("[0-9A-Fa-f:.]+")) return false;
            try {
                if (!(InetAddress.getByName(address) instanceof Inet6Address)) return false;
            } catch (UnknownHostException exception) {
                return false;
            }
        } else {
            String[] octets = address.split("\\.", -1);
            if (octets.length != 4) return false;
            for (String octet : octets) {
                if (!octet.matches("0|[1-9][0-9]{0,2}") || Integer.parseInt(octet) > 255) return false;
            }
        }
        if (parts.length == 1) return true;
        String prefix = parts[1];
        return prefix.matches("0|[1-9][0-9]{0,2}") && Integer.parseInt(prefix) <= (ipv6 ? 128 : 32);
    }
}
