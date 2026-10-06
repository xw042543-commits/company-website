package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

@Service
@Transactional(readOnly = true)
public class AdviserConsultationService {
    private final ConsultationEnquiryRepository repository;
    private final ConsultationAuditLogger audit;

    public AdviserConsultationService(ConsultationEnquiryRepository repository, ConsultationAuditLogger audit) {
        this.repository = repository;
        this.audit = audit;
    }

    public AdviserConsultationPage list(Integer page, Integer size, ConsultationStatus status, String query) {
        int pageNumber = page == null ? 0 : page;
        int pageSize = size == null ? 20 : size;
        String search = query == null ? "" : query.strip();
        if (pageNumber < 0 || pageSize < 1 || pageSize > 100
                || (long) pageNumber * pageSize > Integer.MAX_VALUE || search.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed");
        }

        PageRequest pageable = PageRequest.of(pageNumber, pageSize,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        var result = repository.findAll(filters(status, search), pageable);
        ConsultationStatusCounts counts = new ConsultationStatusCounts(
                repository.countByStatus(ConsultationStatus.NEW),
                repository.countByStatus(ConsultationStatus.IN_PROGRESS),
                repository.countByStatus(ConsultationStatus.COMPLETED));
        return new AdviserConsultationPage(result.getContent().stream().map(AdviserConsultationSummary::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), counts);
    }

    public AdviserConsultationDetail detail(UUID referenceCode) {
        return repository.findByReferenceCode(referenceCode).map(AdviserConsultationDetail::from)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
    }

    @Transactional
    public ConsultationStatusUpdateResponse updateStatus(UUID referenceCode, ConsultationStatusUpdateRequest request,
            UserPrincipal actor) {
        String traceId = MDC.get(RequestTraceFilter.TRACE_ID_MDC_KEY);
        Long actorId = actor == null ? null : actor.userId();
        ConsultationStatus next = request == null ? null : request.status();
        if (actor == null || !actor.isAdviser()) {
            audit.record(referenceCode, actorId, null, next, "FORBIDDEN", traceId);
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access is denied");
        }
        if (request == null || next == null || request.version() == null || request.version() < 0) {
            audit.record(referenceCode, actorId, null, next, "INVALID_REQUEST", traceId);
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed");
        }
        ConsultationEnquiry enquiry = repository.findByReferenceCode(referenceCode).orElse(null);
        if (enquiry == null) {
            audit.record(referenceCode, actorId, null, next, "NOT_FOUND", traceId);
            throw new ResourceNotFoundException("Consultation not found");
        }
        ConsultationStatus prior = enquiry.getStatus();
        OffsetDateTime updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
        if (repository.updateStatus(referenceCode, next, updatedAt, actor.userId(), request.version()) == 0) {
            audit.record(referenceCode, actorId, prior, next, "CONFLICT", traceId);
            throw new ApiException(HttpStatus.CONFLICT, "CONSULTATION_CONFLICT", "Consultation was updated; refresh and retry");
        }
        Runnable recordSuccess = () -> audit.record(referenceCode, actorId, prior, next, "SUCCEEDED", traceId);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { recordSuccess.run(); }
            });
        } else {
            recordSuccess.run();
        }
        return new ConsultationStatusUpdateResponse(referenceCode, next, updatedAt, actor.userId(), request.version() + 1);
    }

    private Specification<ConsultationEnquiry> filters(ConsultationStatus status, String search) {
        Specification<ConsultationEnquiry> statusFilter = status == null ? null
                : (root, query, builder) -> builder.equal(root.get("status"), status);
        Specification<ConsultationEnquiry> searchFilter = search.isEmpty() ? null : searchFilter(search);
        if (statusFilter == null && searchFilter == null) {
            return (root, query, builder) -> builder.conjunction();
        }
        if (statusFilter == null) {
            return searchFilter;
        }
        return searchFilter == null ? statusFilter : statusFilter.and(searchFilter);
    }

    private Specification<ConsultationEnquiry> searchFilter(String search) {
        String pattern = "%" + search.toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        UUID reference = exactReference(search);
        return (root, query, builder) -> {
            var textMatch = builder.or(
                    builder.like(builder.lower(root.get("name")), pattern, '\\'),
                    builder.like(builder.lower(root.get("contact")), pattern, '\\'));
            return reference == null ? textMatch
                    : builder.or(textMatch, builder.equal(root.get("referenceCode"), reference));
        };
    }

    private UUID exactReference(String search) {
        try {
            UUID reference = UUID.fromString(search);
            return reference.toString().equalsIgnoreCase(search) ? reference : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
