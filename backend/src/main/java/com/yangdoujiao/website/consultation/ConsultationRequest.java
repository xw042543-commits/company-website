package com.yangdoujiao.website.consultation;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ConsultationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String contact,
        @Size(max = 200) String intendedSchool,
        @Size(max = 200) String intendedCourse,
        @Pattern(regexp = "foundation|bachelor|master|doctorate") String qualification,
        @Size(max = 2000) String notes,
        @NotBlank @Pattern(regexp = "zh|en") String locale,
        @AssertTrue boolean privacyConsent
) {
    public ConsultationRequest {
        name = strip(name);
        contact = strip(contact);
        intendedSchool = stripToNull(intendedSchool);
        intendedCourse = stripToNull(intendedCourse);
        qualification = stripToNull(qualification);
        notes = stripToNull(notes);
        locale = strip(locale);
    }

    private static String strip(String value) {
        return value == null ? null : value.strip();
    }

    private static String stripToNull(String value) {
        String normalized = strip(value);
        return normalized == null || normalized.isEmpty() ? null : normalized;
    }
}
