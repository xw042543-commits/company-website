package com.yangdoujiao.website.admin;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public final class AdminImportDtos {
    private AdminImportDtos() {}

    public enum EntityType { UNIVERSITY, PROGRAMME, COURSE }
    public enum Classification { NEW, EXACT_DUPLICATE, POSSIBLE_DUPLICATE, CONFLICT, INVALID }

    public record ImportBatch(UUID id, EntityType entityType, String originalFilename, long uploadedByUserId,
            String uploadedByName, String status, int totalRows, int draftRows, int exactDuplicateRows,
            int possibleDuplicateRows, int conflictRows, int invalidRows, int publishedRows, int failedRows,
            String failureReason, OffsetDateTime createdAt, OffsetDateTime updatedAt, OffsetDateTime publishedAt) {}

    public record ImportRow(long id, UUID batchId, int rowNumber, EntityType entityType,
            Classification classification, String draftStatus, Map<String, Object> payload,
            String duplicateReason, Long matchedRecordId, Long publishedRecordId, String errorMessage,
            OffsetDateTime updatedAt, String parseError) {}

    public record UploadResult(ImportBatch batch, List<ImportRow> preview) {}
    public record PublishRequest(@NotEmpty List<@NotNull Long> rowIds) {}
    public record PublishResult(ImportBatch batch, int publishedCount) {}
    public record DraftUpdate(@NotNull Map<String, Object> payload) {}

    public record ExistingUniversity(long id, String code, String slug, String countryCode,
            String nameZh, String nameEn, List<String> aliases) {}
    public record ExistingProgramme(long id, String code, long universityId, String slug,
            String levelCode, String campus, String nameZh, String nameEn, List<String> aliases) {}
}
