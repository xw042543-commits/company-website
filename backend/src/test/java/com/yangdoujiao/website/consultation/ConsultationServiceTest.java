package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.common.exception.ApiException;

class ConsultationServiceTest {

    @Test
    void refusesUnicodeBlankOrOversizedPrivacyNoticeVersions() {
        assertUnavailable(new ConsultationService(null, true, "　　"));
        assertUnavailable(new ConsultationService(null, true, "v".repeat(51)));
    }

    private void assertUnavailable(ConsultationService service) {
        ConsultationRequest request = new ConsultationRequest(
                "Wang Xin", "wx-123", null, null, null, null, "zh", true
        );

        assertThatThrownBy(() -> service.submit(request))
                .isInstanceOfSatisfying(ApiException.class, exception ->
                        assertThat(exception.getCode()).isEqualTo("CONSULTATION_SUBMISSION_UNAVAILABLE")
                );
    }
}
