package com.yangdoujiao.website.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.*;

public final class ApplicationModels {
    private ApplicationModels() {}
    public enum Status { UNPAID, PAID, IN_PROGRESS, NEEDS_DOCUMENTS, SUBMITTED, COMPLETED, CANCELLED }
    public enum DocumentStatus { MISSING, SUBMITTED, APPROVED, REJECTED }
    public enum FeeStatus { DUE, PAID, WAIVED }
    public record Summary(UUID id, String reference, String universitySlug, String universityName,
        String programmeName, String level, String subject, Status status, int stage, String note, OffsetDateTime createdAt) {}
    public record Document(UUID id, String title, int stage, DocumentStatus status, String reviewNote,
        String filename, OffsetDateTime updatedAt) {}
    public record Fee(UUID id, String title, BigDecimal amount, String currency, FeeStatus status, int stage) {}
    public record Event(UUID id, int stage, String message, OffsetDateTime createdAt) {}
    public record Payment(UUID orderId, String reference, String status, Long amountFen, String currency,
        boolean ready, List<String> missingConfiguration) {}
    public record Detail(Summary application, List<Document> documents, List<Fee> fees, List<Event> history,
        Payment payment) {}
    public record Page(List<Summary> items, boolean hasMore) {}
    public record CheckoutRequest(@NotEmpty @Size(max=20) List<@NotNull @Positive Long> programmeIds) {}
    public record Checkout(UUID orderId, String reference, String status, Long amountFen, String currency,
        List<Detail> applications, List<String> missingConfiguration) {}
    public record Create(@NotNull @Positive Long userId, @NotNull @Positive Long programmeId) {}
    public record Progress(@NotNull Status status, @Min(1) @Max(8) int stage, @NotBlank @Size(max=2000) String note) {}
    public record DocumentRequest(@NotBlank @Size(max=120) String title, @Min(1) @Max(8) int stage) {}
    public record Review(@NotNull DocumentStatus status, @NotBlank @Size(max=2000) String note) {}
    public record Upload(@NotBlank @Size(max=180) String filename, @NotBlank @Size(max=1398104) String contentBase64) {}
    public record File(String filename, String contentBase64) {}
    public record FeeRequest(@NotBlank @Size(max=120) String title, @NotNull @DecimalMin("0.00") @Digits(integer=10,fraction=2) BigDecimal amount,
        @NotBlank @Pattern(regexp="[A-Z]{3}") String currency, @NotNull FeeStatus status, @Min(1) @Max(8) int stage) {}
}
