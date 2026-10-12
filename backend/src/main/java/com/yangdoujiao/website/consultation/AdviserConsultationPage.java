package com.yangdoujiao.website.consultation;

import java.util.List;

public record AdviserConsultationPage(
        List<AdviserConsultationSummary> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        ConsultationStatusCounts counts,
        boolean submissionEnabled
) {}
