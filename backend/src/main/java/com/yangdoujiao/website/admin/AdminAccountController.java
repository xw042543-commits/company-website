package com.yangdoujiao.website.admin;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import jakarta.validation.constraints.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@Validated
public class AdminAccountController {
    private final AdminAccountService service;
    public AdminAccountController(AdminAccountService service) { this.service = service; }
    @GetMapping public AdminAccountService.Page<AdminAccountService.Account> list(@AuthenticationPrincipal UserPrincipal actor,
        @RequestParam(defaultValue="") String q, @RequestParam(defaultValue="") String status, @RequestParam(defaultValue="") String identity,
        @RequestParam(defaultValue="1") @Min(1) int page, @RequestParam(defaultValue="20") @Min(1) @Max(100) int size) {
        return service.list(actor.userId(), q, status, identity, page, size);
    }
    @GetMapping("/audit") public AdminAccountService.Page<java.util.Map<String,Object>> audit(@AuthenticationPrincipal UserPrincipal actor,
        @RequestParam(required=false) @Positive Long target, @RequestParam(defaultValue="1") @Min(1) int page, @RequestParam(defaultValue="20") @Min(1) @Max(100) int size) {
        return service.audit(actor.userId(), target, page, size);
    }
    @GetMapping("/{id}") public AdminAccountService.Account detail(@AuthenticationPrincipal UserPrincipal actor, @PathVariable @Positive long id) { return service.detail(actor.userId(), id); }
    @PatchMapping("/{id}/role") public AdminAccountService.Account role(@AuthenticationPrincipal UserPrincipal actor, @PathVariable @Positive long id, @RequestBody AdminAccountService.Change input) { return service.change(actor.userId(), id, input, true); }
    @PatchMapping("/{id}/permissions/{permission}") public AdminAccountService.Account permission(@AuthenticationPrincipal UserPrincipal actor,
            @PathVariable @Positive long id, @PathVariable String permission, @RequestBody AdminAccountService.PermissionChange input,
            jakarta.servlet.http.HttpServletRequest request) {
        var updated = service.permission(actor.userId(), id, permission, input);
        if (actor.userId() == id && !updated.updatedAt().isEqual(input.expectedUpdatedAt())) {
            var session = request.getSession(false);
            if (session != null) session.invalidate();
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
        return updated;
    }
    @PatchMapping("/{id}/status") public AdminAccountService.Account status(@AuthenticationPrincipal UserPrincipal actor, @PathVariable @Positive long id, @RequestBody AdminAccountService.Change input) { return service.change(actor.userId(), id, input, false); }
    @PatchMapping("/{id}/profile") public AdminAccountService.Account profile(@AuthenticationPrincipal UserPrincipal actor, @PathVariable @Positive long id, @RequestBody com.yangdoujiao.website.auth.account.ProfileEdit input) { return service.edit(actor.userId(), id, input); }
}
