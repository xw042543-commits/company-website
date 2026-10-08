package com.yangdoujiao.website.miniapp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationEnquiry;
import com.yangdoujiao.website.consultation.ConsultationEnquiryRepository;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeRepository;

@Service
public class MiniappUserDataService {
    private final MiniappProgrammeFavoriteRepository favorites;
    private final MiniappStudyPlanRepository plans;
    private final ConsultationEnquiryRepository consultations;
    private final ProgrammeRepository programmes;

    public MiniappUserDataService(MiniappProgrammeFavoriteRepository favorites, MiniappStudyPlanRepository plans,
            ConsultationEnquiryRepository consultations, ProgrammeRepository programmes) {
        this.favorites = favorites;
        this.plans = plans;
        this.consultations = consultations;
        this.programmes = programmes;
    }

    @Transactional(readOnly = true)
    public Overview overview(long userId) {
        return new Overview(favorites.countByUserAccountId(userId), plans.countByUserAccountId(userId),
                consultations.countByUserAccountId(userId));
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> favorites(long userId) {
        return favorites.findAllByUserAccountIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(favorite -> programmes.findPublishedForFavorite(favorite.getProgrammeId())
                        .map(programme -> FavoriteResponse.from(programme, favorite.getCreatedAt())).orElse(null))
                .filter(item -> item != null).toList();
    }

    @Transactional
    public FavoriteResponse addFavorite(long userId, long programmeId) {
        Programme programme = publishedProgramme(programmeId);
        MiniappProgrammeFavorite favorite = favorites.findByUserAccountIdAndProgrammeId(userId, programmeId)
                .orElseGet(() -> favorites.save(new MiniappProgrammeFavorite(userId, programmeId)));
        return FavoriteResponse.from(programme, favorite.getCreatedAt());
    }

    @Transactional
    public void removeFavorite(long userId, long programmeId) {
        favorites.deleteByUserAccountIdAndProgrammeId(userId, programmeId);
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> plans(long userId) {
        return plans.findAllByUserAccountIdOrderByUpdatedAtDescIdDesc(userId).stream().map(PlanResponse::from).toList();
    }

    @Transactional
    public PlanResponse createPlan(long userId, MiniappStudyPlanRequest request) {
        return PlanResponse.from(plans.save(new MiniappStudyPlan(userId, request)));
    }

    @Transactional
    public PlanResponse updatePlan(long userId, long planId, MiniappStudyPlanRequest request) {
        MiniappStudyPlan plan = ownedPlan(userId, planId);
        plan.update(request);
        return PlanResponse.from(plan);
    }

    @Transactional
    public void removePlan(long userId, long planId) {
        plans.delete(ownedPlan(userId, planId));
    }

    @Transactional(readOnly = true)
    public List<ConsultationRecordResponse> consultations(long userId) {
        return consultations.findAllByUserAccountIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(ConsultationRecordResponse::from).toList();
    }

    private Programme publishedProgramme(long programmeId) {
        return programmes.findPublishedForFavorite(programmeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROGRAMME_NOT_FOUND", "Programme not found"));
    }

    private MiniappStudyPlan ownedPlan(long userId, long planId) {
        return plans.findByIdAndUserAccountId(planId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PLAN_NOT_FOUND", "Study plan not found"));
    }

    public record Overview(long favorites, long plans, long consultations) {
    }

    public record FavoriteResponse(Long id, String universitySlug, String name, String universityName,
            String level, OffsetDateTime savedAt) {
        static FavoriteResponse from(Programme programme, OffsetDateTime savedAt) {
            return new FavoriteResponse(programme.getId(), programme.getUniversity().getSlug(),
                    first(programme.getNameZh(), programme.getNameEn()),
                    first(programme.getUniversity().getNameZh(), programme.getUniversity().getNameEn()),
                    programme.getStudyLevel() == null ? null : programme.getStudyLevel().getCode(), savedAt);
        }
    }

    public record PlanResponse(Long id, PlanForm form, OffsetDateTime createdAt, OffsetDateTime updatedAt,
            String status) {
        static PlanResponse from(MiniappStudyPlan plan) {
            return new PlanResponse(plan.getId(), new PlanForm(plan.getGoal(), plan.getSubjects(), plan.getCountry(),
                    plan.getIntake(), plan.getEducation(), plan.getGrade(), plan.getLanguage(), plan.getBudget()),
                    plan.getCreatedAt(), plan.getUpdatedAt(), plan.getStatus());
        }
    }

    public record PlanForm(String goal, List<String> subjects, String country, String intake, String education,
            String grade, String language, String budget) {
    }

    public record ConsultationRecordResponse(UUID referenceCode, String intendedSchool, String intendedCourse,
            String qualification, String status, OffsetDateTime submittedAt) {
        static ConsultationRecordResponse from(ConsultationEnquiry enquiry) {
            return new ConsultationRecordResponse(enquiry.getReferenceCode(), enquiry.getIntendedSchool(),
                    enquiry.getIntendedCourse(), enquiry.getQualification(), enquiry.getStatus().name(),
                    enquiry.getCreatedAt());
        }
    }

    private static String first(String preferred, String fallback) {
        return preferred == null || preferred.isBlank() ? fallback : preferred;
    }
}
