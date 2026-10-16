package com.yangdoujiao.website.application;

import static com.yangdoujiao.website.application.ApplicationModels.*;
import java.util.UUID;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/applications")
public class AdminApplicationController {
    private final ApplicationService service;
    public AdminApplicationController(ApplicationService service) { this.service=service; }

    @GetMapping public ResponseEntity<Page> list(@RequestParam(defaultValue="0") int page,@RequestParam(required=false) Status status) {
        return response(service.listAll(status,page));
    }
    @GetMapping("/{id}") public ResponseEntity<Detail> detail(@PathVariable UUID id) { return response(service.detailAll(id)); }
    @PutMapping("/{id}/assignment") public ResponseEntity<Detail> assign(@PathVariable UUID id,@Valid @RequestBody Assignment value) {
        return response(service.assign(id,value));
    }
    @GetMapping("/flow-stages") public ResponseEntity<List<FlowStage>> flowStages() { return response(service.flowStages()); }
    @PutMapping("/flow-stages/{stage}") public ResponseEntity<List<FlowStage>> flowStage(@PathVariable int stage,@Valid @RequestBody FlowStageUpdate value) {
        return response(service.updateFlowStage(stage,value));
    }
    private static <T> ResponseEntity<T> response(T body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
