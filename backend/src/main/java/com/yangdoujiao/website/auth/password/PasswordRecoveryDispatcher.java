package com.yangdoujiao.website.auth.password;

import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.common.exception.ApiException;

@Component
public class PasswordRecoveryDispatcher {
    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryDispatcher.class);
    private final Executor executor;

    public PasswordRecoveryDispatcher(@Qualifier("authPasswordRecoveryExecutor") Executor executor) {
        this.executor = executor;
    }

    public void dispatch(Runnable recovery) {
        try {
            executor.execute(() -> {
                try {
                    recovery.run();
                } catch (RuntimeException exception) {
                    log.error("Password recovery processing failed after acceptance");
                }
            });
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                    "Authentication service is temporarily unavailable");
        }
    }
}
