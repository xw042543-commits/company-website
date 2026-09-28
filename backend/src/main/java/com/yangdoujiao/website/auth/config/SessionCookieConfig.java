package com.yangdoujiao.website.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionCookieConfig {

    @Bean
    DefaultCookieSerializer cookieSerializer(
            @Value("${server.servlet.session.cookie.secure:false}") boolean secureCookie) {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("JSESSIONID");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Lax");
        // Share the exact Secure setting checked by ProductionRegistrationGuard.
        serializer.setUseSecureCookie(secureCookie);
        return serializer;
    }
}
