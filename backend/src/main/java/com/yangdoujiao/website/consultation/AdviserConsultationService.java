package com.yangdoujiao.website.consultation;

import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class AdviserConsultationService {
    private final ConsultationEnquiryRepository repository;

    public AdviserConsultationService(ConsultationEnquiryRepository repository) {
        this.repository = repository;
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
