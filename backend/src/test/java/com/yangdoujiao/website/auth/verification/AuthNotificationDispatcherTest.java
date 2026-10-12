package com.yangdoujiao.website.auth.verification;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayDeque;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.Test;

class AuthNotificationDispatcherTest {
    @Test
    void dispatchReturnsBeforeSenderRuns() {
        ArrayDeque<Runnable> pending = new ArrayDeque<>();
        Executor executor = pending::add;
        AuthNotificationDispatcher dispatcher = new AuthNotificationDispatcher(executor);
        AtomicBoolean sent = new AtomicBoolean();

        dispatcher.dispatch(() -> sent.set(true));

        assertThat(sent).isFalse();
        assertThat(pending).hasSize(1);
        pending.removeFirst().run();
        assertThat(sent).isTrue();
    }

    @Test
    void rejectionDoesNotChangeAcceptedResponsePath() {
        AuthNotificationDispatcher dispatcher = new AuthNotificationDispatcher(task -> {
            throw new java.util.concurrent.RejectedExecutionException("secret");
        });
        dispatcher.dispatch(() -> { throw new AssertionError("must not run"); });
    }

    @Test
    void senderFailureIsContainedAfterDispatch() {
        ArrayDeque<Runnable> pending = new ArrayDeque<>();
        AuthNotificationDispatcher dispatcher = new AuthNotificationDispatcher(pending::add);
        dispatcher.dispatch(() -> { throw new IllegalStateException("secret"); });
        pending.removeFirst().run();
    }
}
