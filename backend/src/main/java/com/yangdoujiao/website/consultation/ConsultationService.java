package com.yangdoujiao.website.consultation;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class ConsultationService {

    private final ConsultationEnquiryRepository repository;
    private final boolean submissionEnabled;
    private final String privacyNoticeVersion;

    public ConsultationService(
            ConsultationEnquiryRepository repository,
            @Value("${app.consultation.submission-enabled:false}") boolean submissionEnabled,
            @Value("${app.consultation.privacy-notice-version:}") String privacyNoticeVersion
    ) {
        this.repository = repository;
        this.submissionEnabled = submissionEnabled;
        this.privacyNoticeVersion = privacyNoticeVersion.strip();
    }

    @Transactional
    public ConsultationResponse submit(ConsultationRequest request) {
        if (!submissionEnabled || privacyNoticeVersion.isBlank() || privacyNoticeVersion.length() > 50) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "CONSULTATION_SUBMISSION_UNAVAILABLE",
                    "Consultation submission is not available"
            );
        }

        OffsetDateTime submittedAt = OffsetDateTime.now(ZoneOffset.UTC);
        ConsultationEnquiry enquiry = new ConsultationEnquiry(
                UUID.randomUUID(),
                request.name(),
                request.contact(),
                request.intendedSchool(),
                request.intendedCourse(),
                request.qualification(),
                request.notes(),
                request.locale(),
                privacyNoticeVersion,
                submittedAt
        );
        return ConsultationResponse.from(repository.save(enquiry));
    }
}
