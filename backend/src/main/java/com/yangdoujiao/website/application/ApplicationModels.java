package com.yangdoujiao.website.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

public final class ApplicationModels {
    private ApplicationModels() {}
    public enum Status { UNPAID, PAID, IN_PROGRESS, NEEDS_DOCUMENTS, SUBMITTED, COMPLETED, CANCELLED }
    public enum DocumentStatus { MISSING, SUBMITTED, APPROVED, REJECTED }
    public enum FeeStatus { DUE, PAID, WAIVED }
    public enum FollowUpChannel { PHONE, WECHAT, EMAIL, MEETING, OTHER }
    public enum UrgeType { DOCUMENT_REVIEW, SUBMISSION, VISA, OTHER }
    public enum UrgeStatus { OPEN, ACKNOWLEDGED, RESOLVED }
    public record Summary(UUID id, String reference, String universitySlug, String universityName,
        String programmeName, String level, String subject, Status status, int stage, String note,
        @JsonIgnore long userId, @JsonIgnore Long adviserId, @JsonIgnore Long applicationStaffId, OffsetDateTime currentStageStartedAt,
        OffsetDateTime currentStageDueAt, String stageName, OffsetDateTime createdAt) {}
    public record Document(UUID id, String title, int stage, DocumentStatus status, String reviewNote,
        String filename, OffsetDateTime updatedAt) {}
    public record Fee(UUID id, String title, BigDecimal amount, String currency, FeeStatus status, int stage) {}
    public record Event(UUID id, int stage, String message, OffsetDateTime createdAt) {}
    public record Payment(UUID orderId, String reference, String status, Long amountFen, String currency,
        boolean ready, List<String> missingConfiguration) {}
    public record FollowUp(UUID id, FollowUpChannel channel, String content, String result,
        OffsetDateTime nextFollowUpAt, OffsetDateTime createdAt) {}
    public record Urge(UUID id, UrgeType type, String detail, UrgeStatus status, String response,
        OffsetDateTime createdAt, OffsetDateTime acknowledgedAt, OffsetDateTime resolvedAt) {}
    public record Detail(Summary application, List<Document> documents, List<Fee> fees, List<Event> history,
        Payment payment, List<FollowUp> followUps, List<Urge> urges) {}
    public record Page(List<Summary> items, boolean hasMore) {}
    public record CheckoutRequest(@NotEmpty @Size(max=20) List<@NotNull @Positive Long> programmeIds) {}
    public record Checkout(UUID orderId, String reference, String status, Long amountFen, String currency,
        List<Detail> applications, List<String> missingConfiguration) {}
    public record Create(@NotNull @Positive Long userId, @NotNull @Positive Long programmeId) {}
    public record Progress(@NotNull Status status, @Min(1) @Max(10) int stage, @NotBlank @Size(max=2000) String note) {}
    public record DocumentRequest(@NotBlank @Size(max=120) String title, @Min(1) @Max(10) int stage) {}
    public record Review(@NotNull DocumentStatus status, @NotBlank @Size(max=2000) String note) {}
    public record Upload(@NotBlank @Size(max=180) String filename, @NotBlank @Size(max=1398104) String contentBase64) {}
    public record File(String filename, String contentBase64) {}
    public record FeeRequest(@NotBlank @Size(max=120) String title, @NotNull @DecimalMin("0.00") @Digits(integer=10,fraction=2) BigDecimal amount,
        @NotBlank @Pattern(regexp="[A-Z]{3}") String currency, @NotNull FeeStatus status, @Min(1) @Max(10) int stage) {}
    public record FollowUpRequest(@NotNull FollowUpChannel channel, @NotBlank @Size(max=2000) String content,
        @NotBlank @Size(max=2000) String result, OffsetDateTime nextFollowUpAt) {}
    public record UrgeRequest(@NotNull UrgeType type, @Size(max=500) String detail) {}
    public record UrgeResponse(@NotNull UrgeStatus status, @NotBlank @Size(max=1000) String response) {}
    public record Assignment(@Positive Long adviserId, @Positive Long applicationStaffId) {}
    public record FlowStage(int stage, String nameZh, Integer slaHours, boolean active, OffsetDateTime updatedAt) {}
    public record FlowStageUpdate(@NotBlank @Size(max=60) String nameZh, @Positive Integer slaHours, boolean active) {}
}
