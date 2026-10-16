package com.yangdoujiao.website.planningagent.agent;

import tools.jackson.databind.ObjectMapper;
import com.yangdoujiao.website.planningagent.session.*;
import com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;

/** Bounded read-only model loop. No model provider is wired by this module. */
public class PlanningOrchestrator implements PlanningWorker.Runner {
    public static final Set<String> QUESTIONS=Set.of("CONFIRM_PROFILE","TARGET_LEVEL","INTAKE","EDUCATION","LANGUAGE","BUDGET");
    public static class ModelUnavailable extends RuntimeException {}
    public static class InvalidReply extends RuntimeException {}
    private final PlanningModel model;
    private final ToolDispatcher dispatcher;
    private final PlanValidator validator;
    private final ModelInputSanitizer sanitizer;
    private final ObjectMapper json;
    private final Clock clock;
    private final java.util.function.Consumer<RunInput> beforeCall;
    public PlanningOrchestrator(PlanningModel model,ToolDispatcher dispatcher,PlanValidator validator,
            ModelInputSanitizer sanitizer,ObjectMapper json,Clock clock) {
        this(model,dispatcher,validator,sanitizer,json,clock,input->{});
    }
    public PlanningOrchestrator(PlanningModel model,ToolDispatcher dispatcher,PlanValidator validator,
            ModelInputSanitizer sanitizer,ObjectMapper json,Clock clock,java.util.function.Consumer<RunInput> beforeCall) {
        this.model=model;this.dispatcher=dispatcher;this.validator=validator;this.sanitizer=sanitizer;this.json=json;this.clock=clock;
        this.beforeCall=beforeCall;
    }
    public record Response(String type,List<String> questions,ValidatedPlan plan) {}
    @Override public String execute(RunInput input,PlanningWorker.Guard leaseGuard) throws Exception {
        if(model==null) throw new ModelUnavailable();
        Instant deadline=input.deadline().isBefore(clock.instant().plusSeconds(60))?input.deadline():clock.instant().plusSeconds(60);
        PlanningWorker.Guard guard=()->{
            leaseGuard.check();
            if(Thread.currentThread().isInterrupted() || !clock.instant().isBefore(deadline)) throw new PlanningWorker.RunExpired();
        };
        guard.check();
        if(input.intent()==Intent.GENERATE) {
            if(input.profile().version()<=0) throw new InvalidReply();
            List<String> missing=new ArrayList<>();
            if(!Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR").contains(input.profile().facts().getOrDefault("targetLevel",""))) missing.add("TARGET_LEVEL");
            if(input.profile().facts().getOrDefault("intake","").isBlank()) missing.add("INTAKE");
            if(!missing.isEmpty()) return json.writeValueAsString(new Response("QUESTIONS",missing,null));
        }
        ToolDispatcher.State state=new ToolDispatcher.State(input.profile(),guard);
        int repairs=0;
        while(true) {
            List<ToolResult> modelResults=new ArrayList<>(state.results());
            if(repairs>0) modelResults.add(new ToolResult("format_repair",json.valueToTree(Map.of("code","INVALID_REPLY_SCHEMA"))));
            ModelContext context=sanitizer.sanitize(input,modelResults);
            // The server deadline overrides any sanitizer/provider deadline change.
            context=new ModelContext(context.redactedMessages(),context.confirmedProfile(),context.results(),deadline);
            AgentReply reply;
            try { reply=next(input,context,guard,deadline); }
            catch(InvalidReply invalid) { if(repairs++>=1) throw invalid;continue; }
            if(!shape(reply)) {
                if(repairs++>=1) throw new InvalidReply();
                continue;
            }
            if(!reply.questions().isEmpty()) return json.writeValueAsString(new Response("QUESTIONS",List.copyOf(reply.questions()),null));
            if(input.intent()!=Intent.GENERATE) throw new InvalidReply();
            if(reply.plan()!=null) {
                guard.check();
                var serverContext=new ModelContext(List.of(),input.profile(),state.results(),deadline);
                ValidatedPlan plan=validator.validate(reply.plan(),serverContext,state);
                guard.check();
                return json.writeValueAsString(new Response("PLAN",List.of(),plan));
            }
            for(ToolCall call:reply.calls()) { guard.check();dispatcher.dispatch(call,state); }
        }
    }
    private AgentReply next(RunInput input,ModelContext context,PlanningWorker.Guard guard,Instant deadline) throws Exception {
        ExecutorService executor=Executors.newVirtualThreadPerTaskExecutor();
        Future<AgentReply> pending=null;
        try {
            guard.check();
            pending=executor.submit(()->{guard.check();beforeCall.accept(input);guard.check();return model.next(context);});
            long remaining=Duration.between(clock.instant(),deadline).toNanos();
            if(remaining<=0) throw new PlanningWorker.RunExpired();
            AgentReply reply=pending.get(remaining,TimeUnit.NANOSECONDS);
            guard.check();return reply;
        } catch(TimeoutException timeout) { throw new PlanningWorker.RunExpired(); }
        catch(ExecutionException failed) {
            if(failed.getCause() instanceof RuntimeException runtime) throw runtime;
            throw new InvalidReply();
        } finally { if(pending!=null) pending.cancel(true);executor.shutdownNow(); }
    }
    private static boolean shape(AgentReply reply) {
        if(reply==null || reply.questions()==null || reply.calls()==null || reply.questions().size()>2 || reply.calls().size()>8
                || reply.questions().stream().anyMatch(q->q==null || !QUESTIONS.contains(q))) return false;
        int kinds=(reply.questions().isEmpty()?0:1)+(reply.calls().isEmpty()?0:1)+(reply.plan()==null?0:1);
        return kinds==1;
    }
}
