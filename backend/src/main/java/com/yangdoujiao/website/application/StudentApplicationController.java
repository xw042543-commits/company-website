package com.yangdoujiao.website.application;
import static com.yangdoujiao.website.application.ApplicationModels.*;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.yangdoujiao.website.auth.session.UserPrincipal;
@RestController
@RequestMapping("/api/v1/miniapp/me/applications")
public class StudentApplicationController {
    private final ApplicationService service;
    public StudentApplicationController(ApplicationService service) { this.service=service; }
    @GetMapping public ResponseEntity<Page> list(@AuthenticationPrincipal UserPrincipal actor,@RequestParam(defaultValue="0") int page,@RequestParam(required=false) Status status) { return response(service.list(actor.userId(),false,status,page)); }
    @GetMapping("/{id}") public ResponseEntity<Detail> detail(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id) { return response(service.detail(actor.userId(),false,id)); }
    @GetMapping("/{id}/documents/{document}") public ResponseEntity<File> file(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID document) { return response(service.file(actor.userId(),false,id,document)); }
    
    @PutMapping("/{id}/documents/{document}") public ResponseEntity<Detail> upload(@AuthenticationPrincipal UserPrincipal actor,@PathVariable UUID id,@PathVariable UUID document,@Valid @RequestBody Upload value) { return response(service.upload(actor.userId(),id,document,value)); }

    private static <T> ResponseEntity<T> response(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body); }
}
