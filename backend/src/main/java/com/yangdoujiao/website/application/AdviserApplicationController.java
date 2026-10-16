package com.yangdoujiao.website.application;
import static com.yangdoujiao.website.application.ApplicationModels.*;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.yangdoujiao.website.auth.session.UserPrincipal;
@RestController
@RequestMapping("/api/v1/adviser/applications")
public class AdviserApplicationController {
    private final ApplicationService service;
    public AdviserApplicationController(ApplicationService service) { this.service=service; }
    @GetMapping public ResponseEntity<Page> list(@AuthenticationPrincipal UserPrincipal actor,@RequestParam(defaultValue="0") int page,@RequestParam(required=false) Status status) { return response(service.list(actor.userId(),true,status,page)); }
    @GetMapping("/{id}") public ResponseEntity<Detail> detail(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id) { return response(service.detail(actor.userId(),true,id)); }
    @GetMapping("/{id}/documents/{document}") public ResponseEntity<File> file(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID document) { return response(service.file(actor.userId(),true,id,document)); }
    
    @PostMapping public ResponseEntity<Detail> create(@AuthenticationPrincipal UserPrincipal actor,@Valid @RequestBody Create value) { return response(service.create(actor.userId(),value)); }
    @PutMapping("/{id}/progress") public ResponseEntity<Detail> progress(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@Valid @RequestBody Progress value) { return response(service.progress(actor.userId(),id,value)); }
    @PostMapping("/{id}/documents") public ResponseEntity<Detail> document(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@Valid @RequestBody DocumentRequest value) { return response(service.addDocument(actor.userId(),id,value)); }
    @PutMapping("/{id}/documents/{document}/review") public ResponseEntity<Detail> review(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID document,@Valid @RequestBody Review value) { return response(service.review(actor.userId(),id,document,value)); }
    @PutMapping("/{id}/fees/{fee}") public ResponseEntity<Detail> fee(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID fee,@Valid @RequestBody FeeRequest value) { return response(service.fee(actor.userId(),id,fee,value)); }
    @PostMapping("/{id}/follow-ups") public ResponseEntity<Detail> followUp(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@Valid @RequestBody FollowUpRequest value) { return response(service.addFollowUp(actor.userId(),id,value)); }
    @PutMapping("/{id}/urges/{urge}") public ResponseEntity<Detail> urge(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID urge,@Valid @RequestBody UrgeResponse value) { return response(service.respondToUrge(actor.userId(),id,urge,value)); }

    private static <T> ResponseEntity<T> response(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body); }
}
