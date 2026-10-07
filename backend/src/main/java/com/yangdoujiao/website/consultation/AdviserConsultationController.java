package com.yangdoujiao.website.consultation;

import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.session.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/adviser/consultations")
public class AdviserConsultationController {
    private final AdviserConsultationService service;

    public AdviserConsultationController(AdviserConsultationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<AdviserConsultationPage> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) ConsultationStatus status,
            @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate())
                .body(service.list(page, size, status, query));
    }

    @GetMapping("/{referenceCode}")
    public ResponseEntity<AdviserConsultationDetail> detail(@PathVariable UUID referenceCode) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate())
                .body(service.detail(referenceCode));
    }

    @PatchMapping("/{referenceCode}/status")
    public ResponseEntity<ConsultationStatusUpdateResponse> updateStatus(@PathVariable UUID referenceCode,
            @Valid @RequestBody ConsultationStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal actor) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate())
                .body(service.updateStatus(referenceCode, request, actor));
    }
}
