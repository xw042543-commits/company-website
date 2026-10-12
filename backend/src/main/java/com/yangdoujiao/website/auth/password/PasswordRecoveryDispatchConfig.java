package com.yangdoujiao.website.auth.password;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PasswordRecoveryDispatchConfig {
    @Bean(name = "authPasswordRecoveryExecutor", destroyMethod = "shutdown")
    ExecutorService authPasswordRecoveryExecutor() {
        return new ThreadPoolExecutor(2, 2, 0L, TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(256),
                Thread.ofPlatform().name("auth-password-recovery-", 0).factory(),
                new ThreadPoolExecutor.AbortPolicy());
    }
}
