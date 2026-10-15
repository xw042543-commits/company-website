package com.yangdoujiao.website.planningagent.plan;

import java.util.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationResponse;
import com.yangdoujiao.website.planningagent.agent.PlanningModel;
import com.yangdoujiao.website.planningagent.config.PlanningAgentProperties;
import static com.yangdoujiao.website.planningagent.plan.PlanningPlanService.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/miniapp/me/planning-agent")
public class PlanningPlanController {
    public record Capability(boolean enabled,boolean available,String privacyVersion) {}
    private final PlanningPlanService plans;
    private final PlanningAgentProperties properties;
    private final ObjectProvider<PlanningModel> model;
    public PlanningPlanController(PlanningPlanService plans,PlanningAgentProperties properties,ObjectProvider<PlanningModel> model) {
        this.plans=plans;this.properties=properties;this.model=model;
    }
    @GetMapping("/capability")
    public Capability capability(@AuthenticationPrincipal UserPrincipal user) {
        owner(user);
        boolean available=properties.available(model.getIfAvailable());
        return new Capability(properties.enabled(),available,available?properties.privacyVersion():null);
    }
    @PostMapping("/sessions/{id}/plans") @ResponseStatus(HttpStatus.CREATED)
    public Saved save(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@RequestBody SaveRequest request) {
        return plans.save(owner(user),id,request);
    }
    @GetMapping("/plans")
    public List<Saved> list(@AuthenticationPrincipal UserPrincipal user) { return plans.list(owner(user)); }
    @GetMapping("/plans/{id}")
    public View get(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id) { return plans.get(owner(user),id); }
    @DeleteMapping("/plans/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id) { plans.delete(owner(user),id); }
    @PostMapping("/plans/{id}/consultations")
    public ConsultationResponse consult(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@Valid @RequestBody ShareRequest request) {
        return plans.consult(owner(user),id,request);
    }
    @GetMapping("/plans/{id}/consultation-preview")
    public ConsultationPreview consultationPreview(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@RequestParam long programmeId) {
        return plans.consultationPreview(owner(user),id,programmeId);
    }
    private static long owner(UserPrincipal user) {
        if(user==null) throw new ApiException(HttpStatus.UNAUTHORIZED,"AUTH_REQUIRED","Authentication required");
        return user.userId();
    }
    @ExceptionHandler(IllegalArgumentException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,String> confirmation(IllegalArgumentException exception) {
        return Map.of("code","CONFIRMATION_REQUIRED","message","Explicit confirmation is required");
    }
}
