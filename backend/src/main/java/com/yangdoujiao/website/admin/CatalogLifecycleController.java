package com.yangdoujiao.website.admin;

import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController @RequestMapping("/api/v1/admin/catalog/lifecycle")
@org.springframework.validation.annotation.Validated
public class CatalogLifecycleController {
    private final CatalogLifecycleService service;
    public CatalogLifecycleController(CatalogLifecycleService service){this.service=service;}
    @GetMapping("/capabilities") public Map<String,Boolean> capabilities(@AuthenticationPrincipal UserPrincipal actor){return service.capabilities(actor.userId());}
    @GetMapping("/audit") public List<Map<String,Object>> audit(@AuthenticationPrincipal UserPrincipal actor,@RequestParam(defaultValue="1") @jakarta.validation.constraints.Min(1) int page,@RequestParam(defaultValue="20") @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(100) int size){return service.audit(actor.userId(),page,size);}
    @PostMapping("/preview") public List<CatalogLifecycleService.Impact> preview(@AuthenticationPrincipal UserPrincipal actor,@RequestBody CatalogLifecycleService.Selection input){return service.preview(actor.userId(),input);}
    @PostMapping public List<CatalogLifecycleService.Impact> execute(@AuthenticationPrincipal UserPrincipal actor,@RequestBody CatalogLifecycleService.Selection input){return service.execute(actor.userId(),input);}
}
