package com.yangdoujiao.website.auth.verification;

import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/** Bounded, best-effort delivery after commit; no durable retry is promised. */
@Component
public class AuthNotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(AuthNotificationDispatcher.class);
    private final Executor executor;

    public AuthNotificationDispatcher(@Qualifier("authNotificationExecutor") Executor executor) {
        this.executor = executor;
    }

    public void dispatch(Runnable delivery) {
        try {
            executor.execute(() -> {
                try {
                    delivery.run();
                } catch (RuntimeException exception) {
                    log.error("Authentication notification delivery failed after commit");
                }
            });
        } catch (RuntimeException exception) {
            log.error("Authentication notification scheduling failed after commit");
        }
    }
}
