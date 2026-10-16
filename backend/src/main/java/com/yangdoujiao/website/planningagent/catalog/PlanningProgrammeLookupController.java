package com.yangdoujiao.website.planningagent.catalog;

import com.yangdoujiao.website.planningagent.tools.PlanningProgrammeLookup;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.common.exception.ApiException;

/** Uses the existing /api/v1/admin/** authorization boundary. */
@RestController
@RequestMapping("/api/v1/admin/planning/programme-lookup")
public class PlanningProgrammeLookupController {
    private final PlanningProgrammeLookup lookup;
    public PlanningProgrammeLookupController(PlanningProgrammeLookup lookup) { this.lookup = lookup; }

    @GetMapping
    public ResponseEntity<PlanningProgrammeLookup.Result> search(
            @RequestParam(defaultValue="") String keyword,
            @RequestParam(required=false) String level,
            @RequestParam(defaultValue="0") int page) {
        try {
            return ResponseEntity.ok().header("Cache-Control", "no-store").body(lookup.search(keyword, level, page));
        } catch (IllegalArgumentException error) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid lookup filters");
        }
    }
}
