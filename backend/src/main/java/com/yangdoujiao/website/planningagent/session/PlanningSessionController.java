package com.yangdoujiao.website.planningagent.session;

import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/miniapp/me/planning-agent")
public class PlanningSessionController {
    private final PlanningSessionService service;
    public PlanningSessionController(PlanningSessionService service) { this.service=service; }
    @PostMapping("/sessions") @ResponseStatus(HttpStatus.CREATED)
    public SessionCreated create(@AuthenticationPrincipal UserPrincipal user,@Valid @RequestBody CreateSession request) { return service.create(owner(user),request); }
    @PostMapping("/sessions/{id}/messages") @ResponseStatus(HttpStatus.ACCEPTED)
    public RunAccepted message(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@Valid @RequestBody MessageRequest request) { return service.message(owner(user),id,request); }
    @GetMapping("/sessions/{id}")
    public SessionView get(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id) { return service.get(owner(user),id); }
    @GetMapping("/sessions/{id}/runs/{runId}")
    public RunView run(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@PathVariable UUID runId) { return service.run(owner(user),id,runId); }
    @PostMapping("/sessions/{id}/profile-confirmation")
    public ProfileConfirmed confirm(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id,@Valid @RequestBody ProfileConfirmation request) { return service.confirm(owner(user),id,request); }
    @DeleteMapping("/sessions/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal user,@PathVariable UUID id) { service.delete(owner(user),id); }
    private static long owner(UserPrincipal user) {
        if(user==null) throw new ApiException(HttpStatus.UNAUTHORIZED,"AUTH_REQUIRED","Authentication required");
        return user.userId();
    }
}
