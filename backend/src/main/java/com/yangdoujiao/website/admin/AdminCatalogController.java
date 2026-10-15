package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/v1/admin/catalog")
@Validated
public class AdminCatalogController {
    private final AdminCatalogService service;
    public AdminCatalogController(AdminCatalogService service) { this.service = service; }

    @GetMapping("/options")
    public Options options() { return service.options(); }

    @GetMapping("/universities")
    public PageResponse<UniversityItem> universities(@RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String status, @RequestParam(defaultValue = "") String country, @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.universities(q, status, country, page, size);
    }

    @GetMapping("/universities/{id}") public UniversityItem university(@PathVariable long id) { return service.university(id); }
    @PostMapping("/universities") @ResponseStatus(HttpStatus.CREATED)
    public UniversityItem createUniversity(@Valid @RequestBody UniversityInput input) { return service.createUniversity(input); }
    @PutMapping("/universities/{id}")
    public UniversityItem updateUniversity(@PathVariable long id, @Valid @RequestBody UniversityInput input) { return service.updateUniversity(id, input); }
    @PatchMapping("/universities/{id}/status")
    public UniversityItem universityStatus(@PathVariable long id, @Valid @RequestBody StatusInput input) { return service.setUniversityStatus(id, input.enabled()); }

    @GetMapping("/programmes")
    public PageResponse<ProgrammeItem> programmes(@RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Long universityId, @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String country,
            @RequestParam(defaultValue = "1") @Min(1) int page, @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.programmes(q, universityId, status, country, page, size);
    }

    @GetMapping("/programmes/{id}") public ProgrammeItem programme(@PathVariable long id) { return service.programme(id); }
    @PostMapping("/programmes") @ResponseStatus(HttpStatus.CREATED)
    public ProgrammeItem createProgramme(@Valid @RequestBody ProgrammeInput input) { return service.createProgramme(input); }
    @PutMapping("/programmes/{id}")
    public ProgrammeItem updateProgramme(@PathVariable long id, @Valid @RequestBody ProgrammeInput input) { return service.updateProgramme(id, input); }
    @PatchMapping("/programmes/{id}/status")
    public ProgrammeItem programmeStatus(@PathVariable long id, @Valid @RequestBody StatusInput input) { return service.setProgrammeStatus(id, input.enabled()); }
}
