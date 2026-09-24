package com.yangdoujiao.website.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    UserDetailsService noBridgeAccounts() {
        // Prevent Boot from creating and logging a generated development account.
        return username -> { throw new UsernameNotFoundException("No bridge accounts"); };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Task 2 -> Task 4 bridge: allow only APIs that were public before Security was added.
        // Task 4 must replace these rules and require CSRF for new account writes.
        http.formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/consultations"))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET,
                                "/api/hello",
                                "/api/universities",
                                "/api/universities/popular",
                                "/api/search",
                                "/api/v1/catalog/filter-options",
                                "/api/v1/articles/*",
                                "/api/v1/articles/*/*",
                                "/api/v1/universities/search",
                                "/api/v1/universities/*",
                                "/api/v1/universities/*/programmes").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/consultations").permitAll()
                        .anyRequest().denyAll());
        return http.build();
    }
}
