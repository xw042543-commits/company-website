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
    private final CatalogIdentityService identities;

    public AdminCatalogService(AdminCatalogRepository repository, CatalogIdentityService identities) { this.repository = repository; this.identities=identities; }

    @Transactional(readOnly = true)
    public PageResponse<UniversityItem> universities(String query, String status, String country, int page, int size) {
        return repository.universities(normalizeQuery(query), normalizeStatus(status), normalizeCountry(country), page, size);
    }

    @Transactional(readOnly = true)
    public UniversityItem university(long id) { return required(repository.university(id), "University"); }

    public UniversityItem createUniversity(UniversityInput input) {
        identities.lockCatalog();
        input=identities.university(input,null);
        validateUniversity(input);
        if(repository.sameUniversity(input)) throw conflict("已有同名院校，请搜索并编辑原记录，避免重复新增");
        try {
            long id = repository.createUniversity(input);
            repository.replaceLogo(id, input.logoUrl(), input.officialUrl());
            repository.enqueue(id);
            return required(repository.university(id), "University");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("院校编码或页面名称已存在，请使用原记录或修改后重试");
        }
    }

    @CacheEvict(cacheNames = "popularUniversities", allEntries = true)
    public UniversityItem updateUniversity(long id, UniversityInput input) {
        identities.lockCatalog();
        var existing=required(repository.university(id), "院校");
        input=identities.university(input,existing.universityCode());
        validateUniversity(input);
        try {
            repository.updateUniversity(id, input);
            repository.replaceLogo(id, input.logoUrl(), input.officialUrl());
            repository.enqueue(id);
            return required(repository.university(id), "University");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("院校编码或页面名称已存在，请使用原记录或修改后重试");
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
        identities.lockCatalog();
        input=identities.programme(input,null);
        validateProgramme(input);
        if(repository.sameProgramme(input)) throw conflict("已有相同院校、名称和学历的专业，请编辑原记录或使用导入流程核对校区");
        try {
            long id = repository.createProgramme(input);
            updateSections(id, input);
            repository.enqueue(input.universityId());
            return required(repository.programme(id), "Programme");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("专业编码或页面名称已存在，请使用原记录或修改后重试");
        }
    }

    public ProgrammeItem updateProgramme(long id, ProgrammeInput input) {
        identities.lockCatalog();
        ProgrammeItem existing = required(repository.programme(id), "专业");
        input=identities.programme(input,existing.programmeCode());
        validateProgramme(input);
        try {
            repository.updateProgramme(id, input);
            updateSections(id, input);
            repository.enqueue(existing.universityId());
            if (!existing.universityId().equals(input.universityId())) repository.enqueue(input.universityId());
            return required(repository.programme(id), "Programme");
        } catch (DataIntegrityViolationException exception) {
            throw conflict("专业编码或页面名称已存在，请使用原记录或修改后重试");
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
        var existing=repository.programme(id);
        if(existing==null || !java.util.Objects.equals(AdminCatalogRepository.blank(input.admissionsZh()),existing.admissionsZh()) || !java.util.Objects.equals(AdminCatalogRepository.blank(input.admissionsEn()),existing.admissionsEn())) repository.upsertSection(id, "ADMISSIONS", "录取要求", "Admission requirements",
                input.admissionsZh(), input.admissionsEn(), 10, input.officialUrl());
        if(existing==null || !java.util.Objects.equals(AdminCatalogRepository.blank(input.curriculumZh()),existing.curriculumZh()) || !java.util.Objects.equals(AdminCatalogRepository.blank(input.curriculumEn()),existing.curriculumEn())) repository.upsertSection(id, "CURRICULUM", "专业课程", "Curriculum",
                input.curriculumZh(), input.curriculumEn(), 20, input.officialUrl());
    }

    private void validateUniversity(UniversityInput input) {
        if (AdminCatalogRepository.blank(input.nameZh()) == null && AdminCatalogRepository.blank(input.nameEn()) == null)
            throw invalid("院校中文或英文名称至少填写一个");
        if (!repository.countryExists(input.countryCode())) throw invalid("国家不存在，请选择已有国家");
        validateUrl(input.officialUrl(), "官网链接");
        validateUrl(input.logoUrl(), "校徽图片链接");
    }

    private void validateProgramme(ProgrammeInput input) {
        if (AdminCatalogRepository.blank(input.nameZh()) == null && AdminCatalogRepository.blank(input.nameEn()) == null)
            throw invalid("专业中文或英文名称至少填写一个");
        if (!repository.universityExists(input.universityId())) throw invalid("所属院校不存在或已移入回收站，请先恢复或选择其他院校");
        if (!repository.categoryExists(input.categoryId())) throw invalid("学科分类不存在，请选择已有分类");
        if (!repository.studyLevelExists(input.studyLevelId())) throw invalid("学历层次不存在，请选择已有学历");
        if (!repository.courseModeExists(input.courseModeId())) throw invalid("授课方式不存在，请选择已有方式");
        if (input.tuitionMin() != null && input.tuitionMax() != null && input.tuitionMin().compareTo(input.tuitionMax()) > 0)
            throw invalid("最低学费不能超过最高学费");
        if ((input.tuitionMin() != null || input.tuitionMax() != null) && AdminCatalogRepository.blank(input.tuitionCurrency()) == null)
            throw invalid("填写学费时请同时填写币种");
        validateUrl(input.officialUrl(), "官网链接");
    }

    private static void validateUrl(String value, String field) {
        if (AdminCatalogRepository.blank(value) == null) return;
        try {
            URI uri = URI.create(value.trim());
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException exception) { throw invalid(field + "请填写有效的 http:// 或 https:// 链接"); }
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
        if (!normalized.equals("PUBLISHED") && !normalized.equals("ARCHIVED") && !normalized.equals("DRAFT") && !normalized.equals("TRASH"))
            throw invalid("状态无效，请重新选择");
        return normalized;
    }

    private static <T> T required(T value, String type) { if (value == null) throw missing(type); return value; }
    private static ApiException missing(String type) { return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", type + " not found"); }
    private static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
    private static ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "DUPLICATE_DATA", message); }
}
