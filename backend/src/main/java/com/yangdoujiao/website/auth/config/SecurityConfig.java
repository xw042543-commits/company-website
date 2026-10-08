package com.yangdoujiao.website.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.yangdoujiao.website.auth.api.AuthSecurityErrorWriter;
import com.yangdoujiao.website.auth.miniapp.MiniappBearerFilter;
import com.yangdoujiao.website.auth.session.UserAccountDetailsService;

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
    AuthenticationManager authenticationManager(UserAccountDetailsService accounts, PasswordEncoder passwords) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accounts);
        provider.setPasswordEncoder(passwords);
        return new ProviderManager(provider);
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthSecurityErrorWriter errors,
            SecurityContextRepository contexts,
            ObjectProvider<MiniappBearerFilter> miniappBearerProvider) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/api/v1/miniapp/**")
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
                        .requestMatchers(HttpMethod.POST, "/api/v1/miniapp/auth/login",
                                "/api/v1/miniapp/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/miniapp/universities/*/programmes/*").permitAll()
                        .requestMatchers("/api/v1/miniapp/**").hasRole("USER")
                        .requestMatchers("/api/v1/account", "/api/v1/account/**").hasRole("USER")
                        .requestMatchers("/api/v1/adviser/**").hasRole("ADVISER")
                        .requestMatchers(HttpMethod.GET, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.HEAD, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/consultations").permitAll()
                        .anyRequest().permitAll())
                .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()))
                .securityContext(context -> context.securityContextRepository(contexts))
                .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpStatus.NO_CONTENT.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        }))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable);
        MiniappBearerFilter miniappBearer = miniappBearerProvider.getIfAvailable();
        if (miniappBearer != null) {
            http.addFilterBefore(miniappBearer, UsernamePasswordAuthenticationFilter.class);
        }
        return http.build();
    }
}
