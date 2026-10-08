package com.yangdoujiao.website.miniapp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/miniapp/universities")
public class MiniappProgrammeController {
    private final MiniappProgrammeService service;

    public MiniappProgrammeController(MiniappProgrammeService service) {
        this.service = service;
    }

    @GetMapping("/{universitySlug}/programmes/{programmeIdentifier}")
    public MiniappProgrammeDetailResponse getProgramme(@PathVariable String universitySlug,
            @PathVariable String programmeIdentifier) {
        return service.getPublished(universitySlug, programmeIdentifier);
    }
}
