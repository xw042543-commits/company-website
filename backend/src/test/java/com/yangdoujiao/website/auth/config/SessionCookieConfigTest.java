package com.yangdoujiao.website.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockCookie;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.session.web.http.CookieSerializer;

class SessionCookieConfigTest {

    @Test
    void sessionCookieSecureFlagUsesExplicitConfigurationEvenWhenRequestSecurityDiffers() {
        for (boolean secure : new boolean[] {true, false}) {
            try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
                context.getEnvironment().getPropertySources().addFirst(new MapPropertySource(
                        "test", Map.of("server.servlet.session.cookie.secure", secure)));
                context.register(SessionCookieConfig.class);
                context.refresh();

                MockHttpServletRequest request = new MockHttpServletRequest();
                request.setSecure(!secure);
                MockHttpServletResponse response = new MockHttpServletResponse();
                context.getBean(CookieSerializer.class).writeCookieValue(
                        new CookieSerializer.CookieValue(request, response, "session-id"));

                MockCookie cookie = MockCookie.parse(response.getHeader(HttpHeaders.SET_COOKIE));
                assertThat(cookie.getSecure()).isEqualTo(secure);
            }
        }
    }
}
