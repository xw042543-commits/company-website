package com.yangdoujiao.website.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import com.yangdoujiao.website.auth.api.AuthSecurityErrorWriter;

import jakarta.servlet.DispatcherType;

@Configuration
public class SecurityConfig {

    private static final String[] PUBLIC_READ_PATHS = {
            "/api/hello",
            "/api/universities",
            "/api/universities/popular",
            "/api/search",
            "/api/v1/catalog/filter-options",
            "/api/v1/articles/*",
            "/api/v1/articles/*/*",
            "/api/v1/universities/search",
            "/api/v1/universities/*",
            "/api/v1/universities/*/programmes"
    };

    @Bean
    UserDetailsService noBridgeAccounts() {
        // Prevent Boot from creating and logging a generated development account.
        return username -> { throw new UsernameNotFoundException("No bridge accounts"); };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthSecurityErrorWriter errors) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            if (request.getDispatcherType() == DispatcherType.ASYNC
                                    || request.getDispatcherType() == DispatcherType.INCLUDE) {
                                errors.writeForbidden(request, response);
                            } else {
                                errors.writeUnauthorized(request, response);
                            }
                        })
                        .accessDeniedHandler((request, response, exception) ->
                                errors.writeAccessDenied(request, response, exception)))
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD).permitAll()
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.INCLUDE).denyAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf", "/api/v1/auth/session").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/account", "/api/v1/account/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.HEAD, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/consultations").permitAll()
                        .anyRequest().permitAll())
                .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
