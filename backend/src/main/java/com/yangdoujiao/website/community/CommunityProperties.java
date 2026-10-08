package com.yangdoujiao.website.community;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("app.community")
public record CommunityProperties(@DefaultValue("false") boolean enabled,
        @DefaultValue("2") int postPerMinute, @DefaultValue("30") int postPerDay,
        @DefaultValue("10") int commentPerMinute, @DefaultValue("300") int commentPerDay,
        @DefaultValue("30") int reportPerDay, @DefaultValue("") String cursorSecret,
        List<String> reviewTerms, List<String> rejectTerms) {
    public CommunityProperties {
        if (postPerMinute < 1 || postPerMinute > 100 || postPerDay < postPerMinute || postPerDay > 1000
                || commentPerMinute < 1 || commentPerMinute > 300 || commentPerDay < commentPerMinute || commentPerDay > 10000
                || reportPerDay < 1 || reportPerDay > 300) throw new IllegalArgumentException("Invalid community limits");
        if (enabled && (cursorSecret == null || cursorSecret.getBytes(StandardCharsets.UTF_8).length < 32))
            throw new IllegalArgumentException("Enabled community requires a shared cursor secret of at least 32 bytes");
        reviewTerms = terms(reviewTerms);
        rejectTerms = terms(rejectTerms);
    }
    private static List<String> terms(List<String> input) {
        if (input == null) return List.of();
        if (input.size() > 1000 || input.stream().anyMatch(term -> term == null || term.length() > 200))
            throw new IllegalArgumentException("Invalid community policy terms");
        return input.stream().filter(term -> !term.isBlank()).distinct().toList();
    }
}
