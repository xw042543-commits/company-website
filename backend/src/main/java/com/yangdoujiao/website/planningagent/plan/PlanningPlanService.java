package com.yangdoujiao.website.planningagent.plan;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Clock;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import tools.jackson.databind.*;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.*;
import com.yangdoujiao.website.planningagent.agent.*;
import com.yangdoujiao.website.planningagent.catalog.PlanningCatalogue;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
import com.yangdoujiao.website.planningagent.evidence.*;
import com.yangdoujiao.website.planningagent.session.PlanningSessionRepository;

@Service
public class PlanningPlanService {
    public record SaveRequest(UUID runId,boolean confirmed,String requestKey) {}
    public record ShareRequest(boolean confirmed,String requestKey,@Valid ConsultationRequest consultationRequest) {}
    public record Saved(UUID planId,long version) {}
    public record Snapshot(Profile profile,ValidatedPlan plan) {}
    public record View(Snapshot snapshot,List<String> revalidationWarnings) {}
    private final PlanningPlanRepository plans;
    private final PlanningSessionRepository sessions;
    private final PlanningCatalogue catalogue;
    private final EvidenceRepository evidence;
    private final PlanningSourceSnapshot sources;
    private final ConsultationService consultations;
    private final Validator validation;
    private final ObjectMapper json;
    private final Clock clock;
    public PlanningPlanService(PlanningPlanRepository plans,PlanningSessionRepository sessions,PlanningCatalogue catalogue,
            EvidenceRepository evidence,PlanningSourceSnapshot sources,ConsultationService consultations,
            Validator validation,ObjectMapper json,Clock clock) {
        this.plans=plans;this.sessions=sessions;this.catalogue=catalogue;this.evidence=evidence;this.sources=sources;
        this.consultations=consultations;this.validation=validation;this.json=json;this.clock=clock;
    }
    public static void requireConfirmation(boolean confirmed) {
        if(!confirmed) throw new IllegalArgumentException("CONFIRMATION_REQUIRED");
    }
    @Transactional
    public Saved save(long owner,UUID session,SaveRequest request) {
        if(request==null) throw error(HttpStatus.BAD_REQUEST,"INVALID_PLAN_REQUEST");
        requireConfirmation(request.confirmed());key(request.requestKey());
        if(request.runId()==null) throw error(HttpStatus.BAD_REQUEST,"INVALID_PLAN_REQUEST");
        sessions.lockActiveOwner(owner);
        long version=sessions.version(owner,session,true).orElseThrow(PlanningPlanService::missing);
        String hash=hash(request.runId().toString());
        var old=plans.existing(owner,session,request.requestKey());
        if(old.isPresent()) {
            if(!old.get().hash().equals(hash)) throw conflict();
            sessions.touch(owner,session,clock.instant());
            return new Saved(old.get().id(),old.get().version());
        }
        var run=sessions.run(owner,session,request.runId()).orElseThrow(PlanningPlanService::missing);
        if(!sessions.matchingGeneration(owner,session,request.runId(),version) || run.result()==null)
            throw error(HttpStatus.CONFLICT,"SUCCESSFUL_PLAN_REQUIRED");
        PlanningOrchestrator.Response response;
        try { response=json.readValue(run.result(),PlanningOrchestrator.Response.class); }
        catch(RuntimeException invalid) { throw error(HttpStatus.CONFLICT,"SUCCESSFUL_PLAN_REQUIRED"); }
        if(!"PLAN".equals(response.type()) || response.plan()==null || version<=0 || response.plan().profileVersion()!=version)
            throw error(HttpStatus.CONFLICT,"PROFILE_VERSION_CONFLICT");
        Snapshot snapshot=new Snapshot(sessions.profile(owner,session,version),response.plan());
        UUID id=UUID.randomUUID();
        plans.insert(owner,id,session,request.runId(),request.requestKey(),hash,snapshot,baseline(snapshot),clock.instant());
        sessions.touch(owner,session,clock.instant());
        return new Saved(id,1);
    }
    @Transactional(readOnly=true)
    public List<Saved> list(long owner) { return plans.list(owner); }
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public View get(long owner,UUID id) {
        var stored=plans.find(owner,id,false).orElseThrow(PlanningPlanService::missing);
        List<String> warnings=new ArrayList<>();
        Snapshot snapshot=stored.snapshot();
        for(var programme:snapshot.plan().programmes()) {
            long programmeId=programme.programmeId();
            if(!catalogue.isPublishedMalaysianProgramme(programmeId)) warnings.add("PROGRAMME_UNAVAILABLE:"+programmeId);
            var current=evidence.findByProgrammeId(programmeId);
            for(var source:programme.evidenceSnapshot()) {
                if(current.stream().noneMatch(e->e.id()==source.id() && new EvidencePolicy().assess(e,clock.instant(),snapshot.profile().facts().get("intake"))==EvidenceState.VERIFIED))
                    warnings.add("EVIDENCE_REVIEW_REQUIRED:"+source.id());
            }
        }
        try {
            String generated=snapshot.plan().sourceFingerprint();
            if(generated==null || !generated.matches("[a-f0-9]{64}")) warnings.add("GENERATION_SOURCES_UNVERIFIED");
            boolean changed=!stored.baseline().equals(baseline(snapshot));
            if(generated!=null && !generated.equals(sources.fingerprint(snapshot.plan(),()->{}))) changed=true;
            if(changed) warnings.add("SOURCE_DATA_CHANGED");
        } catch(IllegalStateException | org.springframework.dao.InvalidDataAccessApiUsageException invalidCurrentRule) {
            // The repository rejects a source moved across programme boundaries.
            // Preserve the historical document and require review of current data.
            warnings.add("SOURCE_DATA_CHANGED");
        }
        return new View(snapshot,List.copyOf(warnings));
    }
    @Transactional
    public void delete(long owner,UUID id) { if(plans.delete(owner,id)!=1) throw missing(); }
    @Transactional
    public ConsultationResponse consult(long owner,UUID id,ShareRequest request) {
        if(request==null) throw error(HttpStatus.BAD_REQUEST,"INVALID_PLAN_REQUEST");
        requireConfirmation(request.confirmed());key(request.requestKey());
        if(request.consultationRequest()==null || !validation.validate(request.consultationRequest()).isEmpty())
            throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
        sessions.lockActiveOwner(owner);
        plans.find(owner,id,true).orElseThrow(PlanningPlanService::missing);
        String hash=hash(json.writeValueAsString(request.consultationRequest()));
        var previous=plans.shared(id,request.requestKey());
        if(previous.isPresent()) {
            if(!previous.get().hash().equals(hash)) throw conflict();
            return previous.get().response();
        }
        var original=request.consultationRequest();
        String notes="Planning plan: "+id+"\n"+Objects.toString(original.notes(),"");
        if(notes.length()>2000) throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
        var selected=new ConsultationRequest(original.name(),original.contact(),original.intendedSchool(),original.intendedCourse(),
                original.qualification(),notes,original.locale(),original.privacyConsent());
        var response=consultations.submit(selected,owner);
        plans.share(id,request.requestKey(),hash,response);
        return response;
    }
    private JsonNode baseline(Snapshot snapshot) {
        return sources.baseline(snapshot.plan());
    }
    private static void key(String key) {
        if(key==null || key.isBlank() || key.length()>100) throw error(HttpStatus.BAD_REQUEST,"INVALID_REQUEST_KEY");
    }
    private static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch(NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static ApiException conflict() { return error(HttpStatus.CONFLICT,"IDEMPOTENCY_CONFLICT"); }
    private static ApiException missing() { return error(HttpStatus.NOT_FOUND,"NOT_FOUND"); }
    private static ApiException error(HttpStatus status,String code) { return new ApiException(status,code,code); }
}
