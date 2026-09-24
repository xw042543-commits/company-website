package com.yangdoujiao.website.common.web;

import java.net.InetAddress;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class ClientAddressResolver {

    private static final int MAXIMUM_FORWARDED_HEADER_LENGTH = 2_048;

    private final Set<String> trustedProxies;

    public ClientAddressResolver(
            @Value("${app.consultation.trusted-proxies:}") String[] trustedProxies
    ) {
        this.trustedProxies = new HashSet<>();
        Arrays.stream(trustedProxies)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(this::normalizeLiteralAddress)
                .forEach(this.trustedProxies::add);
    }

    public String resolve(HttpServletRequest request) {
        String directAddress = normalizeOrUnknown(request.getRemoteAddr());
        if (!trustedProxies.contains(directAddress)) {
            return directAddress;
        }

        Enumeration<String> headerValues = request.getHeaders("X-Forwarded-For");
        if (headerValues == null) {
            return directAddress;
        }

        ArrayList<String> chain = new ArrayList<>();
        int totalLength = 0;
        while (headerValues.hasMoreElements()) {
            String headerValue = headerValues.nextElement();
            totalLength += headerValue.length();
            if (totalLength > MAXIMUM_FORWARDED_HEADER_LENGTH) {
                return directAddress;
            }
            chain.addAll(Arrays.asList(headerValue.split(",", -1)));
        }
        if (chain.isEmpty()) {
            return directAddress;
        }

        for (int index = chain.size() - 1; index >= 0; index--) {
            String address = normalizeOrNull(chain.get(index));
            if (address == null) {
                return directAddress;
            }
            if (!trustedProxies.contains(address)) {
                return address;
            }
        }
        return directAddress;
    }

    private String normalizeOrUnknown(String value) {
        String normalized = normalizeOrNull(value);
        return normalized == null ? "unknown" : normalized;
    }

    private String normalizeOrNull(String value) {
        if (value == null) {
            return null;
        }
        String candidate = value.trim();
        if (candidate.isEmpty()) {
            return null;
        }
        String ipv4 = normalizeIpv4(candidate);
        if (ipv4 != null) {
            return ipv4;
        }
        if (!candidate.contains(":") || !candidate.matches("[0-9A-Fa-f:.]+")) {
            return null;
        }
        try {
            InetAddress address = InetAddress.getByName(candidate);
            if (address instanceof Inet6Address) {
                return address.getHostAddress();
            }
            if (address instanceof Inet4Address) {
                return address.getHostAddress();
            }
            return null;
        } catch (UnknownHostException exception) {
            return null;
        }
    }

    private String normalizeIpv4(String candidate) {
        String[] octets = candidate.split("\\.", -1);
        if (octets.length != 4) {
            return null;
        }
        int[] values = new int[4];
        for (int index = 0; index < octets.length; index++) {
            String octet = octets[index];
            if (!octet.matches("0|[1-9][0-9]{0,2}")) {
                return null;
            }
            int value = Integer.parseInt(octet);
            if (value > 255) {
                return null;
            }
            values[index] = value;
        }
        return values[0] + "." + values[1] + "." + values[2] + "." + values[3];
    }

    private String normalizeLiteralAddress(String value) {
        String normalized = normalizeOrNull(value);
        if (normalized == null) {
            throw new IllegalArgumentException("Trusted proxy must be a literal IP address: " + value);
        }
        return normalized;
    }
}
