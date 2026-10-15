package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;

import java.net.URI;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.common.exception.ApiException;

@Service
@Transactional
public class AdminCatalogService {
    private final AdminCatalogRepository repository;

    public AdminCatalogService(AdminCatalogRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public PageResponse<UniversityItem> universities(String query, String status, String country, int page, int size) {
        return repository.universities(normalizeQuery(query), normalizeStatus(status), normalizeCountry(country), page, size);
    }

    @Transactional(readOnly = true)
    public UniversityItem university(long id) { return required(repository.university(id), "University"); }

    public UniversityItem createUniversity(UniversityInput input) {
        validateUniversity(input);
        try {
            long id = repository.createUniversity(input);
            repository.replaceLogo(id, input.logoUrl(), input.officialUrl());
            repository.enqueue(id);
            return required(repository.university(id), "University");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("University code or slug already exists");
        }
    }

    @CacheEvict(cacheNames = "popularUniversities", allEntries = true)
    public UniversityItem updateUniversity(long id, UniversityInput input) {
        required(repository.university(id), "University");
        validateUniversity(input);
        try {
            repository.updateUniversity(id, input);
            repository.replaceLogo(id, input.logoUrl(), input.officialUrl());
            repository.enqueue(id);
            return required(repository.university(id), "University");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("University code or slug already exists");
        }
    }

    @CacheEvict(cacheNames = "popularUniversities", allEntries = true)
    public UniversityItem setUniversityStatus(long id, boolean enabled) {
        if (repository.setUniversityStatus(id, enabled) == 0) throw missing("University");
        repository.enqueue(id);
        return required(repository.university(id), "University");
    }

    @Transactional(readOnly = true)
    public PageResponse<ProgrammeItem> programmes(String query, Long universityId, String status, String country, Long categoryId, Long studyLevelId, int page, int size) {
        return repository.programmes(normalizeQuery(query), universityId, normalizeStatus(status), normalizeCountry(country), categoryId, studyLevelId, page, size);
    }

    @Transactional(readOnly = true)
    public ProgrammeItem programme(long id) { return required(repository.programme(id), "Programme"); }

    public ProgrammeItem createProgramme(ProgrammeInput input) {
        validateProgramme(input);
        try {
            long id = repository.createProgramme(input);
            updateSections(id, input);
            repository.enqueue(input.universityId());
            return required(repository.programme(id), "Programme");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("Programme code or university slug already exists");
        }
    }

    public ProgrammeItem updateProgramme(long id, ProgrammeInput input) {
        ProgrammeItem existing = required(repository.programme(id), "Programme");
        validateProgramme(input);
        try {
            repository.updateProgramme(id, input);
            updateSections(id, input);
            repository.enqueue(existing.universityId());
            if (!existing.universityId().equals(input.universityId())) repository.enqueue(input.universityId());
            return required(repository.programme(id), "Programme");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("Programme code or university slug already exists");
        }
    }

    public ProgrammeItem setProgrammeStatus(long id, boolean enabled) {
        Long universityId = repository.programmeUniversityId(id);
        if (universityId == null || repository.setProgrammeStatus(id, enabled) == 0) throw missing("Programme");
        repository.enqueue(universityId);
        return required(repository.programme(id), "Programme");
    }

    @Transactional(readOnly = true)
    public Options options() { return repository.options(); }

    private void updateSections(long id, ProgrammeInput input) {
        repository.upsertSection(id, "ADMISSIONS", "录取要求", "Admission requirements",
                input.admissionsZh(), input.admissionsEn(), 10, input.officialUrl());
        repository.upsertSection(id, "CURRICULUM", "专业课程", "Curriculum",
                input.curriculumZh(), input.curriculumEn(), 20, input.officialUrl());
    }

    private void validateUniversity(UniversityInput input) {
        if (AdminCatalogRepository.blank(input.nameZh()) == null && AdminCatalogRepository.blank(input.nameEn()) == null)
            throw invalid("At least one university name is required");
        if (!repository.countryExists(input.countryCode())) throw invalid("Country does not exist");
        validateUrl(input.officialUrl(), "Official URL");
        validateUrl(input.logoUrl(), "Logo URL");
    }

    private void validateProgramme(ProgrammeInput input) {
        if (AdminCatalogRepository.blank(input.nameZh()) == null && AdminCatalogRepository.blank(input.nameEn()) == null)
            throw invalid("At least one programme name is required");
        if (!repository.universityExists(input.universityId())) throw invalid("University does not exist");
        if (!repository.categoryExists(input.categoryId())) throw invalid("Subject category does not exist");
        if (!repository.studyLevelExists(input.studyLevelId())) throw invalid("Study level does not exist");
        if (!repository.courseModeExists(input.courseModeId())) throw invalid("Course mode does not exist");
        if (input.tuitionMin() != null && input.tuitionMax() != null && input.tuitionMin().compareTo(input.tuitionMax()) > 0)
            throw invalid("Minimum tuition cannot exceed maximum tuition");
        if ((input.tuitionMin() != null || input.tuitionMax() != null) && AdminCatalogRepository.blank(input.tuitionCurrency()) == null)
            throw invalid("Tuition currency is required when an amount is entered");
        validateUrl(input.officialUrl(), "Official URL");
    }

    private static void validateUrl(String value, String field) {
        if (AdminCatalogRepository.blank(value) == null) return;
        try {
            URI uri = URI.create(value.trim());
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException exception) { throw invalid(field + " must be a valid HTTP(S) URL"); }
    }

    private static String normalizeQuery(String value) {
        String result = AdminCatalogRepository.trim(value);
        return result.length() > 100 ? result.substring(0, 100) : result;
    }

    private static String normalizeCountry(String value) {
        String country = AdminCatalogRepository.trim(value).toUpperCase(java.util.Locale.ROOT);
        if (!country.isEmpty() && !country.matches("[A-Z]{2}"))
            throw invalid("国家筛选必须为两位国家代码");
        return country;
    }

    private static String normalizeStatus(String value) {
        String normalized = AdminCatalogRepository.trim(value).toUpperCase();
        if (normalized.isEmpty()) return "";
        if (!normalized.equals("PUBLISHED") && !normalized.equals("ARCHIVED") && !normalized.equals("DRAFT"))
            throw invalid("Invalid status");
        return normalized;
    }

    private static <T> T required(T value, String type) { if (value == null) throw missing(type); return value; }
    private static ApiException missing(String type) { return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", type + " not found"); }
    private static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
    private static ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "DUPLICATE_DATA", message); }
}
