package com.yangdoujiao.website.miniapp;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MiniappStudyPlanRequest(
        @NotBlank @Size(max = 30) String goal,
        @Size(max = 12) List<@NotBlank @Size(max = 50) String> subjects,
        @NotBlank @Size(max = 100) String country,
        @Size(max = 100) String intake,
        @NotBlank @Size(max = 100) String education,
        @Size(max = 100) String grade,
        @Size(max = 100) String language,
        @Size(max = 100) String budget
) {
}
