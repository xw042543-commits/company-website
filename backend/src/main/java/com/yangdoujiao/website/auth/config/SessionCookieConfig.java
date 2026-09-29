package com.yangdoujiao.website.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.convert.DurationStyle;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionCookieConfig {
    public static final String REMEMBER_ME_REQUEST_ATTRIBUTE =
            SessionCookieConfig.class.getName() + ".REMEMBER_ME";

    @Bean
    DefaultCookieSerializer cookieSerializer(
            @Value("${server.servlet.session.cookie.secure:false}") boolean secureCookie,
            @Value("${app.auth.remembered-session-timeout:30d}") String rememberedSessionTimeout) {
        int rememberedSeconds = Math.toIntExact(
                DurationStyle.detectAndParse(rememberedSessionTimeout).toSeconds());
        DefaultCookieSerializer serializer = new DefaultCookieSerializer() {
            @Override
            public void writeCookieValue(CookieSerializer.CookieValue cookieValue) {
                if (cookieValue.getCookieMaxAge() < 0
                        && Boolean.TRUE.equals(cookieValue.getRequest().getAttribute(REMEMBER_ME_REQUEST_ATTRIBUTE))) {
                    cookieValue.setCookieMaxAge(rememberedSeconds);
                }
                super.writeCookieValue(cookieValue);
            }
        };
        serializer.setCookieName("JSESSIONID");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Lax");
        // Share the exact Secure setting checked by ProductionRegistrationGuard.
        serializer.setUseSecureCookie(secureCookie);
        return serializer;
    }
}
