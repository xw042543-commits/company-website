package com.yangdoujiao.website.miniapp;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/miniapp/me")
public class MiniappUserDataController {
    private final MiniappUserDataService service;

    public MiniappUserDataController(MiniappUserDataService service) {
        this.service = service;
    }

    @GetMapping
    public MiniappUserDataService.Overview overview(@AuthenticationPrincipal UserPrincipal principal) {
        return service.overview(userId(principal));
    }

    @GetMapping("/favorites")
    public List<MiniappUserDataService.FavoriteResponse> favorites(@AuthenticationPrincipal UserPrincipal principal) {
        return service.favorites(userId(principal));
    }

    @PostMapping("/favorites/{programmeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MiniappUserDataService.FavoriteResponse addFavorite(@PathVariable Long programmeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.addFavorite(userId(principal), programmeId);
    }

    @DeleteMapping("/favorites/{programmeId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long programmeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        service.removeFavorite(userId(principal), programmeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/plans")
    public List<MiniappUserDataService.PlanResponse> plans(@AuthenticationPrincipal UserPrincipal principal) {
        return service.plans(userId(principal));
    }

    @PostMapping("/plans")
    @ResponseStatus(HttpStatus.CREATED)
    public MiniappUserDataService.PlanResponse createPlan(@Valid @RequestBody MiniappStudyPlanRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.createPlan(userId(principal), request);
    }

    @PutMapping("/plans/{planId}")
    public MiniappUserDataService.PlanResponse updatePlan(@PathVariable Long planId,
            @Valid @RequestBody MiniappStudyPlanRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return service.updatePlan(userId(principal), planId, request);
    }

    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<Void> removePlan(@PathVariable Long planId,
            @AuthenticationPrincipal UserPrincipal principal) {
        service.removePlan(userId(principal), planId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/consultations")
    public List<MiniappUserDataService.ConsultationRecordResponse> consultations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.consultations(userId(principal));
    }

    @GetMapping("/orders")
    public List<MiniappUserDataService.ApplicationOrderSummary> orders(
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.orders(userId(principal));
    }

    @GetMapping("/orders/{referenceCode}")
    public MiniappUserDataService.ApplicationOrderDetail order(
            @PathVariable UUID referenceCode, @AuthenticationPrincipal UserPrincipal principal) {
        return service.order(userId(principal), referenceCode);
    }

    private long userId(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Authentication required");
        }
        return principal.userId();
    }
}
