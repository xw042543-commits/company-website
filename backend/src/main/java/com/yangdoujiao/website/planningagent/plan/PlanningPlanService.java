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
    public record ShareRequest(boolean confirmed,String requestKey,@Valid ConsultationRequest consultationRequest,Long programmeId,String previewFingerprint) {
        public ShareRequest(boolean confirmed,String requestKey,ConsultationRequest consultationRequest) { this(confirmed,requestKey,consultationRequest,null,null); }
    }
    public record ConsultationPreview(long programmeId,String summary,String fingerprint) {}
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
    @Transactional(readOnly=true)
    public ConsultationPreview consultationPreview(long owner,UUID id,long programmeId) {
        return preview(id,plans.find(owner,id,false).orElseThrow(PlanningPlanService::missing).snapshot(),programmeId);
    }
    private ConsultationPreview preview(UUID id,Snapshot snapshot,long programmeId) {
        var selected=snapshot.plan().programmes().stream().filter(p->p.programmeId()==programmeId).findFirst()
                .orElseThrow(()->error(HttpStatus.BAD_REQUEST,"INVALID_PLAN_REQUEST"));
        var text=new StringBuilder("已确认规划背景（版本 ").append(snapshot.profile().version()).append("）\n");
        String[][] fields={{"targetLevel","目标学历"},{"education","当前学历"},{"qualification","学历资格"},
                {"grade","成绩"},{"grade.scale","成绩计分制"},{"languageTest","语言考试"},{"languageTotal","语言总分"},
                {"intake","入学时间"},{"budget","预算金额"},{"budgetCurrency","预算币种"},{"budgetPeriod","预算周期"},{"budgetIncludesLiving","预算含生活费"}};
        for(var field:fields) {
            String value=snapshot.profile().facts().get(field[0]);
            if(value!=null && !value.isBlank()) text.append(field[1]).append("：").append(value).append('\n');
        }
        text.append("选定项目 #").append(programmeId).append("：").append(name(selected.universityNameZh(),selected.universityNameEn()))
                .append(" / ").append(name(selected.programmeNameZh(),selected.programmeNameEn()));
        text.append("\n仅供顾问核实，不代表录取或费用承诺。");
        String summary=text.toString();
        if(summary.length()>1400) throw error(HttpStatus.BAD_REQUEST,"CONSULTATION_PREVIEW_TOO_LARGE");
        return new ConsultationPreview(programmeId,summary,hash(id+"\n"+programmeId+"\n"+summary));
    }
    private static String name(String zh,String en) { return zh!=null && !zh.isBlank()?zh:Objects.toString(en,"名称待核实"); }
    @Transactional
    public ConsultationResponse consult(long owner,UUID id,ShareRequest request) {
        if(request==null) throw error(HttpStatus.BAD_REQUEST,"INVALID_PLAN_REQUEST");
        requireConfirmation(request.confirmed());key(request.requestKey());
        if(request.consultationRequest()==null || !validation.validate(request.consultationRequest()).isEmpty())
            throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
        sessions.lockActiveOwner(owner);
        var stored=plans.find(owner,id,true).orElseThrow(PlanningPlanService::missing);
        if(request.programmeId()==null || request.previewFingerprint()==null) throw error(HttpStatus.BAD_REQUEST,"CONSULTATION_PREVIEW_REQUIRED");
        var preview=preview(id,stored.snapshot(),request.programmeId());
        if(!preview.fingerprint().equals(request.previewFingerprint())) throw error(HttpStatus.CONFLICT,"CONSULTATION_PREVIEW_CHANGED");
        String hash=hash(json.writeValueAsString(request));
        var previous=plans.shared(id,request.requestKey());
        if(previous.isPresent()) {
            if(!previous.get().hash().equals(hash)) throw conflict();
            return previous.get().response();
        }
        var original=request.consultationRequest();
        String manual=Objects.toString(original.notes(),"");
        if(manual.length()>500) throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
        String notes=preview.summary()+(manual.isBlank()?"":"\n补充："+manual);
        if(notes.length()>2000) throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
        var programme=stored.snapshot().plan().programmes().stream().filter(p->p.programmeId()==request.programmeId()).findFirst().orElseThrow();
        var selected=new ConsultationRequest(original.name(),original.contact(),name(programme.universityNameZh(),programme.universityNameEn()),name(programme.programmeNameZh(),programme.programmeNameEn()),
                original.qualification(),notes,original.locale(),original.privacyConsent());
        if(!validation.validate(selected).isEmpty()) throw error(HttpStatus.BAD_REQUEST,"INVALID_CONSULTATION_REQUEST");
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
