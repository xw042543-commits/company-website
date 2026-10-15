package com.yangdoujiao.website.planningagent.session;

import java.time.*;
import java.util.concurrent.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;

@Component
public class PlanningWorker {
    /** Implementations must invoke guard.check() before EVERY tool/model call; no database transaction spans execute. */
    @FunctionalInterface public interface Runner { String execute(RunInput input,Guard guard) throws Exception; }
    @FunctionalInterface public interface Guard { void check(); }
    public static class RunExpired extends RuntimeException {}
    public static class LeaseLost extends RuntimeException {}
    private final PlanningSessionRepository repository;
    private final Clock clock;
    private final Runner runner;
    private boolean schedulingEnabled;
    @Autowired
    public PlanningWorker(PlanningSessionRepository repository,Clock clock,ObjectProvider<Runner> runners,
            @Value("${app.planning-agent.enabled:false}") boolean enabled,
            @Value("${app.planning-agent.scheduling-enabled:true}") boolean schedulingEnabled) {
        this(repository,clock,runners.getIfAvailable()); this.schedulingEnabled=enabled && schedulingEnabled;
    }
    public PlanningWorker(PlanningSessionRepository repository,Clock clock,Runner runner) {
        this.repository=repository; this.clock=clock; this.runner=runner;
    }
    @Scheduled(fixedDelayString="${app.planning-agent.poll-interval-ms:1000}")
    public void poll() { if(schedulingEnabled) runOnce(); }
    public void runOnce() {
        var claimed=repository.claim(clock.instant()); if(claimed.isEmpty()) return;
        var lease=claimed.get();
        Guard guard=() -> {
            if(isExpired(lease.input().deadline(),clock.instant())) throw new RunExpired();
            if(!repository.valid(lease,clock.instant())) throw new LeaseLost();
        };
        if(runner==null) { repository.finish(lease,clock.instant(),"FAILED",null,"RUNNER_UNAVAILABLE"); return; }
        // Do not close a per-call executor: close() would wait indefinitely for an uncooperative runner.
        ExecutorService executor=Executors.newVirtualThreadPerTaskExecutor();
        Future<String> result=null;
        try {
            guard.check();
            result=executor.submit(() -> { guard.check(); return runner.execute(lease.input(),guard); });
            long nanos=Duration.between(clock.instant(),lease.input().deadline()).toNanos();
            if(nanos<=0) throw new RunExpired();
            String text=result.get(nanos,TimeUnit.NANOSECONDS);
            guard.check();
            if(text==null || text.isBlank() || text.length()>64000) throw new IllegalStateException("Invalid runner result");
            repository.finish(lease,clock.instant(),"SUCCEEDED",text,null);
        } catch(TimeoutException | RunExpired expired) {
            repository.finish(lease,lease.input().deadline(),"TIMED_OUT",null,"DEADLINE_EXCEEDED");
        } catch(LeaseLost lost) {
            // Another worker or deletion invalidated this execution. It owns no further writes.
        } catch(ExecutionException execution) {
            if(execution.getCause() instanceof com.yangdoujiao.website.planningagent.agent.PlanningOrchestrator.ModelUnavailable) {
                repository.finish(lease,clock.instant(),"FAILED",null,"RUNNER_UNAVAILABLE");
            } else if(execution.getCause() instanceof RunExpired) {
                repository.finish(lease,lease.input().deadline(),"TIMED_OUT",null,"DEADLINE_EXCEEDED");
            } else if(!(execution.getCause() instanceof LeaseLost)) {
                repository.finish(lease,clock.instant(),"FAILED",null,"RUN_FAILED");
            }
        } catch(InterruptedException interrupted) {
            Thread.currentThread().interrupt(); repository.finish(lease,clock.instant(),"FAILED",null,"RUN_INTERRUPTED");
        } catch(Exception failed) {
            repository.finish(lease,clock.instant(),"FAILED",null,"RUN_FAILED");
        } finally {
            if(result!=null) result.cancel(true); executor.shutdownNow();
        }
    }
    public static boolean isExpired(Instant deadline,Instant now) { return !now.isBefore(deadline); }
}
