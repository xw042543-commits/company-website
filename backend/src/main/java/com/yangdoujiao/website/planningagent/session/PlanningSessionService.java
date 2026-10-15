package com.yangdoujiao.website.planningagent.session;

import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Clock;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class PlanningSessionService {
    private static final Set<String> PROFILE_FIELDS=Set.of("targetLevel","education","qualification","curriculum","institution","major",
            "degreeAwarded","graduationStatus","grade","grade.scale","languageTest","languageTotal","languageTotal.scale",
            "languageListening","languageListening.scale","languageReading","languageReading.scale","languageWriting","languageWriting.scale",
            "languageSpeaking","languageSpeaking.scale","math","math.scale","science","science.scale","budget","budgetCurrency","budgetPeriod",
            "budgetIncludesLiving","intake","subject","city","studyMode","researchDirection","researchExperience","researchPlanReady","transferCredits","crossMajor");
    private final PlanningSessionRepository repository;
    private final Clock clock;
    private final boolean enabled;
    private final String privacyVersion;
    public PlanningSessionService(PlanningSessionRepository repository,Clock clock,
            @Value("${app.planning-agent.enabled:false}") boolean enabled,
            @Value("${app.planning-agent.privacy-version:}") String privacyVersion) {
        this.repository=repository; this.clock=clock; this.enabled=enabled; this.privacyVersion=privacyVersion;
    }
    public SessionCreated create(long owner,CreateSession request) {
        available();
        if(request==null || !Set.of("AGE_14_17","AGE_18_PLUS").contains(Objects.toString(request.ageBand(),"")))
            throw error(HttpStatus.FORBIDDEN,"AGE_RESTRICTED");
        if(privacyVersion.isBlank() || privacyVersion.length()>50 || !privacyVersion.equals(request.privacyVersion()))
            throw error(HttpStatus.FORBIDDEN,"PRIVACY_CONSENT_REQUIRED");
        UUID id=UUID.randomUUID(); repository.create(owner,id,request,clock.instant()); return new SessionCreated(id);
    }
    public RunAccepted message(long owner,UUID session,MessageRequest request) {
        available();
        if(request==null || blank(request.requestKey()) || request.requestKey().length()>100 || blank(request.text()) || request.text().length()>4000)
            throw error(HttpStatus.BAD_REQUEST,"INVALID_MESSAGE");
        String hash=hash(request.intent().name()+"\n"+request.text());
        return repository.transaction(() -> {
            long version=require(owner,session,true);
            var previous=repository.existing(owner,session,request.requestKey());
            if(previous.isPresent()) {
                var old=previous.get();
                if(!old.hash().equals(hash)) throw error(HttpStatus.CONFLICT,"IDEMPOTENCY_CONFLICT");
                return new RunAccepted(old.id(),old.status());
            }
            if(repository.active(owner,session)) throw error(HttpStatus.CONFLICT,"RUN_ACTIVE");
            if(request.intent()==Intent.GENERATE && version==0) throw error(HttpStatus.CONFLICT,"PROFILE_CONFIRMATION_REQUIRED");
            UUID run=UUID.randomUUID(); repository.enqueue(owner,session,run,request,hash,version,clock.instant());
            return new RunAccepted(run,"QUEUED");
        });
    }
    public ProfileConfirmed confirm(long owner,UUID session,ProfileConfirmation request) {
        available();
        return repository.transaction(() -> {
            long current=require(owner,session,true);
            if(request==null || request.version()!=current) throw error(HttpStatus.CONFLICT,"PROFILE_VERSION_CONFLICT");
            if(request.facts()==null || request.facts().isEmpty() || !PROFILE_FIELDS.containsAll(request.facts().keySet())
                    || request.facts().values().stream().anyMatch(v -> blank(v) || v.length()>500)) throw error(HttpStatus.BAD_REQUEST,"INVALID_PROFILE");
            String level=request.facts().get("targetLevel");
            if(level!=null && !Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR").contains(level)) throw error(HttpStatus.BAD_REQUEST,"INVALID_PROFILE");
            if(repository.active(owner,session)) throw error(HttpStatus.CONFLICT,"RUN_ACTIVE");
            repository.confirm(owner,session,current+1,Map.copyOf(request.facts()),clock.instant());
            return new ProfileConfirmed(current+1);
        });
    }
    public SessionView get(long owner,UUID session) {
        available();
        return repository.transaction(() -> {
            long version=require(owner,session,true);
            return new SessionView(session,repository.profile(owner,session,version),repository.messages(owner,session),repository.runs(owner,session));
        });
    }
    public RunView run(long owner,UUID session,UUID run) {
        available(); return repository.run(owner,session,run).orElseThrow(() -> error(HttpStatus.NOT_FOUND,"NOT_FOUND"));
    }
    public void delete(long owner,UUID session) {
        available(); if(repository.delete(owner,session)==0) throw error(HttpStatus.NOT_FOUND,"NOT_FOUND");
    }
    private long require(long owner,UUID session,boolean lock) {
        return repository.version(owner,session,lock).orElseThrow(() -> error(HttpStatus.NOT_FOUND,"NOT_FOUND"));
    }
    private void available() { if(!enabled) throw error(HttpStatus.SERVICE_UNAVAILABLE,"PLANNING_DISABLED"); }
    private static boolean blank(String value) { return value==null || value.isBlank(); }
    private static ApiException error(HttpStatus status,String code) { return new ApiException(status,code,code); }
    private static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch(NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
}
