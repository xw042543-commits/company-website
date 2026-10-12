package com.yangdoujiao.website.community;

import java.time.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CommunityImageReviewAccessTest {
    final Instant now=Instant.parse("2026-10-12T08:00:00Z");
    final String id="a".repeat(32);
    @Test void signatureIsBoundToImageAndExpiry() {
        var access=new CommunityImageReviewAccess("https://example.com","test-secret-32-characters-minimum",Clock.fixed(now,ZoneOffset.UTC));
        String url=access.url(id);
        assertTrue(url.startsWith("https://example.com/api/v1/community/image-review/media/"+id+"?expires="));
        var query=url.substring(url.indexOf('?')+1).split("&");
        long expires=Long.parseLong(query[0].substring("expires=".length()));
        String signature=query[1].substring("signature=".length());
        assertTrue(access.verify(id,expires,signature));
        assertFalse(access.verify("b".repeat(32),expires,signature));
        assertFalse(access.verify(id,expires+1,signature));
        var later=new CommunityImageReviewAccess("https://example.com","test-secret-32-characters-minimum",Clock.fixed(now.plusSeconds(3601),ZoneOffset.UTC));
        assertFalse(later.verify(id,expires,signature));
        assertThrows(IllegalArgumentException.class,()->access.url("../escape"));
    }
    @Test void refusesInsecureOrAmbiguousOriginAndWeakSecret() {
        for(String origin:new String[]{"http://example.com","https://user:pass@example.com","https://example.com/path","https://example.com?query"})
            assertThrows(IllegalArgumentException.class,()->new CommunityImageReviewAccess(origin,"test-secret-32-characters-minimum",Clock.systemUTC()));
        assertThrows(IllegalArgumentException.class,()->new CommunityImageReviewAccess("https://example.com","weak",Clock.systemUTC()));
    }
}
