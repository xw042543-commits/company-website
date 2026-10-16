package com.yangdoujiao.website.planningagent.session;

import static org.assertj.core.api.Assertions.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;

class PlanningWorkerTest extends PlanningSessionIntegrationTest {
    @org.springframework.beans.factory.annotation.Autowired
    com.yangdoujiao.website.planningagent.agent.PlanningOrchestrator orchestrator;

    @Test void registeredOrchestratorWithoutProviderFailsAsUnavailable() {
        UUID id=session(); var accepted=service.message(owner,id,chat("no-provider","hello"));
        new PlanningWorker(repository,Clock.systemUTC(),orchestrator).runOnce();
        assertThat(service.run(owner,id,accepted.runId()).errorCode()).isEqualTo("RUNNER_UNAVAILABLE");
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    @Test void competingWorkersExecuteOnlyOnePersistedRun() throws Exception {
        UUID id=session(); var accepted=service.message(owner,id,chat("claim-once","hello"));
        var executions=new CopyOnWriteArrayList<UUID>(); var gate=new CountDownLatch(1);
        PlanningWorker.Runner runner=(input,guard) -> { executions.add(input.runId()); return "Only reply"; };
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            Runnable work=() -> { try { gate.await(); } catch(InterruptedException e) { throw new RuntimeException(e); }
                new PlanningWorker(repository,Clock.systemUTC(),runner).runOnce(); };
            var a=executor.submit(work); var b=executor.submit(work); gate.countDown(); a.get(5,TimeUnit.SECONDS); b.get(5,TimeUnit.SECONDS);
        }
        assertThat(executions).containsExactly(accepted.runId());
        assertThat(service.get(owner,id).messages()).extracting(Message::role).containsExactly("USER","ASSISTANT");
    }
    @Test void waitingForSessionLockCannotCommitSuccessAfterDeadline() throws Exception {
        UUID id=session(); var accepted=service.message(owner,id,chat("locking","hello"));
        Instant deadline=Instant.now().plusMillis(800);
        jdbc.update("UPDATE planning_runs SET deadline=? WHERE id=?",java.sql.Timestamp.from(deadline),accepted.runId());
        var locked=new CountDownLatch(1);
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            new PlanningWorker(repository,Clock.systemUTC(),(input,guard) -> {
                executor.submit(() -> repository.transaction(() -> {
                    repository.version(owner,id,true); locked.countDown();
                    try { Thread.sleep(Math.max(1,Duration.between(Instant.now(),deadline.plusMillis(100)).toMillis())); }
                    catch(InterruptedException interrupted) { Thread.currentThread().interrupt(); }
                    return null;
                }));
                assertThat(locked.await(3,TimeUnit.SECONDS)).isTrue(); return "late commit";
            }).runOnce();
        }
        assertThat(service.run(owner,id,accepted.runId()).status()).isEqualTo("TIMED_OUT");
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    @Test void uncooperativeRunnerIsBoundedByPersistedDeadlineAndCannotWriteAfterTimeout() throws Exception {
        UUID id=session(); var accepted=service.message(owner,id,chat("bounded","hello"));
        Instant deadline=Instant.now().plusMillis(800);
        jdbc.update("UPDATE planning_runs SET deadline=? WHERE id=?",java.sql.Timestamp.from(deadline),accepted.runId());
        var release=new CountDownLatch(1); var exited=new CountDownLatch(1);
        long started=System.nanoTime();
        try {
            new PlanningWorker(repository,Clock.systemUTC(),(input,guard) -> {
                try { while(release.getCount()>0) { try { release.await(); } catch(InterruptedException ignored) {} } return "late"; }
                finally { exited.countDown(); }
            }).runOnce();
            assertThat(Duration.ofNanos(System.nanoTime()-started)).isLessThan(Duration.ofSeconds(3));
            assertThat(service.run(owner,id,accepted.runId()).status()).isEqualTo("TIMED_OUT");
        } finally { release.countDown(); }
        assertThat(exited.await(3,TimeUnit.SECONDS)).isTrue();
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    @Test void restartExpiresQueuedAndAbandonedRunningRunsAtDeadline() {
        UUID id=session(); var accepted=service.message(owner,id,chat("one","hello"));
        Instant deadline=jdbc.queryForObject("SELECT deadline FROM planning_runs WHERE id=?",java.sql.Timestamp.class,accepted.runId()).toInstant();
        var clock=Clock.fixed(deadline,ZoneOffset.UTC);
        new PlanningWorker(repository,clock,(input,guard) -> "unexpected").runOnce();
        assertThat(service.run(owner,id,accepted.runId()).status()).isEqualTo("TIMED_OUT");
        var next=service.message(owner,id,chat("two","hello again"));
        repository.claim(Instant.now());
        jdbc.update("UPDATE planning_runs SET deadline=? WHERE id=?",java.sql.Timestamp.from(deadline),next.runId());
        new PlanningWorker(repository,clock,(input,guard) -> "unexpected").runOnce();
        assertThat(service.run(owner,id,next.runId()).status()).isEqualTo("TIMED_OUT");
    }
    @Test void successfulExecutionPersistsAssistantMessageOutsideDatabaseTransaction() {
        UUID id=session(); var accepted=service.message(owner,id,chat("one","hello"));
        new PlanningWorker(repository,Clock.systemUTC(),(input,guard) -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            assertThat(input.text()).isEqualTo("hello"); guard.check(); return "Reply";
        }).runOnce();
        assertThat(service.run(owner,id,accepted.runId()).result()).isEqualTo("Reply");
        assertThat(service.get(owner,id).messages()).extracting(Message::role).containsExactly("USER","ASSISTANT");
        assertThat(service.message(owner,id,chat("next","next")).status()).isEqualTo("QUEUED");
    }
    @Test void staleLeaseAndDeletedSessionCannotReceiveLateResult() {
        UUID id=session(); var accepted=service.message(owner,id,chat("one","hello"));
        new PlanningWorker(repository,Clock.systemUTC(),(input,guard) -> {
            jdbc.update("UPDATE planning_runs SET lease_token=? WHERE id=?",UUID.randomUUID(),input.runId()); return "stale";
        }).runOnce();
        assertThat(service.run(owner,id,accepted.runId()).result()).isNull();
        assertThat(service.get(owner,id).messages()).hasSize(1);
        UUID deleted=session(); var run=service.message(owner,deleted,chat("delete","hello"));
        new PlanningWorker(repository,Clock.systemUTC(),(input,guard) -> { service.delete(owner,deleted); return "late"; }).runOnce();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM planning_runs WHERE id=?",Integer.class,run.runId())).isZero();
    }
    @Test void unavailableRunnerFailsExplicitlyAndDoesNotLeakExceptionText() {
        UUID id=session(); var accepted=service.message(owner,id,chat("one","hello"));
        new PlanningWorker(repository,Clock.systemUTC(),null).runOnce();
        var result=service.run(owner,id,accepted.runId());
        assertThat(result.status()).isEqualTo("FAILED"); assertThat(result.errorCode()).isEqualTo("RUNNER_UNAVAILABLE");
    }
    @Test void responseAfterDeadlineIsDiscardedAndToolGuardChecksDeadline() {
        UUID id=session(); var accepted=service.message(owner,id,chat("one","hello"));
        var clock=new MutableClock();
        new PlanningWorker(repository,clock,(input,guard) -> {
            clock.now=input.deadline(); assertThatThrownBy(guard::check).isInstanceOf(PlanningWorker.RunExpired.class); return "late";
        }).runOnce();
        assertThat(service.run(owner,id,accepted.runId()).status()).isEqualTo("TIMED_OUT");
        assertThat(service.get(owner,id).messages()).hasSize(1);
    }
    static class MutableClock extends Clock {
        Instant now=Instant.now(); public ZoneId getZone(){return ZoneOffset.UTC;}
        public Clock withZone(ZoneId zone){return this;} public Instant instant(){return now;}
    }
}
