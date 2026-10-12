package com.yangdoujiao.website.common.web;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** One explicit trust boundary for client-address and production HTTPS forwarding. */
@Component
public class TrustedProxySettings {
    private final String[] addresses;

    public TrustedProxySettings(@Value("${app.trusted-proxies:}") String[] site,
            @Value("${app.auth.trusted-proxies:}") String[] authLegacy,
            @Value("${app.consultation.trusted-proxies:}") String[] consultationLegacy) {
        Set<String> siteValues = normalized(site);
        Set<String> authValues = normalized(authLegacy);
        Set<String> consultationValues = normalized(consultationLegacy);
        Set<String> selected = !siteValues.isEmpty() ? siteValues
                : !authValues.isEmpty() ? authValues : consultationValues;
        if ((!authValues.isEmpty() && !authValues.equals(selected))
                || (!consultationValues.isEmpty() && !consultationValues.equals(selected))) {
            throw new IllegalStateException("Trusted proxy configurations disagree; use app.trusted-proxies");
        }
        addresses = selected.toArray(String[]::new);
    }

    public String[] addresses() { return addresses.clone(); }

    private Set<String> normalized(String[] input) {
        Set<String> values = new LinkedHashSet<>();
        if (input != null) Arrays.stream(input).map(String::trim).filter(value -> !value.isEmpty())
                .forEach(values::add);
        return values;
    }
}
