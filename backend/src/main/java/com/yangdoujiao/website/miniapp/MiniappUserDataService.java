package com.yangdoujiao.website.miniapp;

import java.time.OffsetDateTime;
import com.yangdoujiao.website.application.ApplicationRepository;
import java.util.ArrayList;
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
    private final ApplicationRepository applications;
    private final MiniappWalletRepository wallet;

    public MiniappUserDataService(MiniappProgrammeFavoriteRepository favorites, MiniappStudyPlanRepository plans,
            ConsultationEnquiryRepository consultations, ProgrammeRepository programmes,
            ApplicationRepository applications, MiniappWalletRepository wallet) {
        this.favorites = favorites;
        this.plans = plans;
        this.consultations = consultations;
        this.programmes = programmes;
        this.applications = applications;
        this.wallet = wallet;
    }

    @Transactional(readOnly = true)
    public Overview overview(long userId) {
        long orderCount = consultations.countByUserAccountId(userId);
        return new Overview(favorites.countByUserAccountId(userId), plans.countByUserAccountId(userId),
                orderCount, applications.countByUser(userId));
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

    @Transactional(readOnly = true)
    public List<ApplicationOrderSummary> orders(long userId) {
        return consultations.findAllByUserAccountIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(ApplicationOrderSummary::from).toList();
    }

    @Transactional(readOnly = true)
    public ApplicationOrderDetail order(long userId, UUID referenceCode) {
        ConsultationEnquiry enquiry = consultations.findByReferenceCodeAndUserAccountId(referenceCode, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "Application order not found"));
        return ApplicationOrderDetail.from(enquiry);
    }

    @Transactional
    public WalletResponse wallet(long userId) {
        var account = wallet.findOrCreate(userId);
        return new WalletResponse(account.balance(), account.points(), wallet.entries(userId));
    }

    public record WalletResponse(java.math.BigDecimal balance, long points,
            List<MiniappWalletRepository.WalletEntry> entries) {}

    private Programme publishedProgramme(long programmeId) {
        return programmes.findPublishedForFavorite(programmeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROGRAMME_NOT_FOUND", "Programme not found"));
    }

    private MiniappStudyPlan ownedPlan(long userId, long planId) {
        return plans.findByIdAndUserAccountId(planId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PLAN_NOT_FOUND", "Study plan not found"));
    }

    public record Overview(long favorites, long plans, long consultations, long orders) {
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

    public record ApplicationOrderSummary(UUID referenceCode, String universityName, String programmeName,
            String qualification, String status, String statusLabel, OffsetDateTime submittedAt) {
        static ApplicationOrderSummary from(ConsultationEnquiry enquiry) {
            String status = switch (enquiry.getStatus()) {
                case COMPLETED -> "COMPLETED";
                case NEW, IN_PROGRESS -> "IN_PROGRESS";
            };
            return new ApplicationOrderSummary(enquiry.getReferenceCode(), enquiry.getIntendedSchool(),
                    enquiry.getIntendedCourse(), enquiry.getQualification(), status,
                    "COMPLETED".equals(status) ? "已完成" : "进行中", enquiry.getCreatedAt());
        }
    }

    public record ApplicationOrderDetail(ApplicationOrderSummary order, int activeStage,
            List<ApplicationStage> stages, List<ApplicationMaterial> materials,
            PaymentStatus payment, List<ApplicationHistory> history, String currentMessage) {
        static ApplicationOrderDetail from(ConsultationEnquiry enquiry) {
            ApplicationOrderSummary summary = ApplicationOrderSummary.from(enquiry);
            int activeStage = switch (enquiry.getStatus()) {
                case NEW -> 1;
                case IN_PROGRESS -> 2;
                case COMPLETED -> 8;
            };
            List<String[]> definitions = List.of(
                    new String[]{"材料准备", "整理申请所需资料"},
                    new String[]{"材料初审", "顾问检查材料完整性"},
                    new String[]{"申请递交", "按院校要求递交申请"},
                    new String[]{"院校审核", "等待院校审核结果"},
                    new String[]{"录取结果", "接收录取决定"},
                    new String[]{"签证办理", "准备签证材料与进度"},
                    new String[]{"入学报到", "完成注册与报到"},
                    new String[]{"结案", "申请服务已完成"});
            List<ApplicationStage> stages = new ArrayList<>();
            for (int index = 1; index <= definitions.size(); index++) {
                String state = index < activeStage || enquiry.getStatus() == com.yangdoujiao.website.consultation.ConsultationStatus.COMPLETED
                        ? "COMPLETED" : index == activeStage ? "ACTIVE" : "PENDING";
                stages.add(new ApplicationStage(index, definitions.get(index - 1)[0], definitions.get(index - 1)[1], state));
            }
            List<ApplicationMaterial> materials = List.of(
                    new ApplicationMaterial("申请人学历", first(enquiry.getQualification(), "待确认"), "RECORDED"),
                    new ApplicationMaterial("身份证明", "请按顾问通知准备", "PENDING"),
                    new ApplicationMaterial("成绩与语言材料", "请按院校要求补充", "PENDING"));
            List<ApplicationHistory> history = new ArrayList<>();
            history.add(new ApplicationHistory("申请已创建", enquiry.getCreatedAt()));
            if (enquiry.getStatusUpdatedAt() != null && !enquiry.getStatusUpdatedAt().equals(enquiry.getCreatedAt())) {
                history.add(new ApplicationHistory(enquiry.getStatus() == com.yangdoujiao.website.consultation.ConsultationStatus.COMPLETED
                        ? "申请处理完成" : "顾问开始处理", enquiry.getStatusUpdatedAt()));
            }
            String message = switch (enquiry.getStatus()) {
                case NEW -> "资料已提交，顾问将尽快联系你确认申请材料。";
                case IN_PROGRESS -> "当前正在进行材料初审，如需补充资料我们会及时通知你。";
                case COMPLETED -> "本次申请服务已完成，如有疑问请联系顾问。";
            };
            return new ApplicationOrderDetail(summary, activeStage, List.copyOf(stages), materials,
                    new PaymentStatus(false, "当前阶段无需支付"), List.copyOf(history), message);
        }
    }

    public record ApplicationStage(int number, String title, String description, String state) {
    }

    public record ApplicationMaterial(String name, String description, String state) {
    }

    public record PaymentStatus(boolean paymentRequired, String message) {
    }

    public record ApplicationHistory(String title, OffsetDateTime occurredAt) {
    }

    private static String first(String preferred, String fallback) {
        return preferred == null || preferred.isBlank() ? fallback : preferred;
    }
}
