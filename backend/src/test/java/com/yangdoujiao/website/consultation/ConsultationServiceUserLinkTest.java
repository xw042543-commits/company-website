package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ConsultationServiceUserLinkTest {
    @Test
    void linksAuthenticatedMiniappSubmissionToTheUserAccount() {
        ConsultationEnquiryRepository repository = mock(ConsultationEnquiryRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        ConsultationService service = new ConsultationService(repository, true, "privacy-2026-10");

        service.submit(new ConsultationRequest("小洋", "13800000000", "示例大学", "计算机科学",
                "bachelor", null, "zh", true), 42L);

        ArgumentCaptor<ConsultationEnquiry> saved = ArgumentCaptor.forClass(ConsultationEnquiry.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getUserAccountId()).isEqualTo(42L);
        assertThat(saved.getValue().getStatus()).isEqualTo("NEW");
    }
}
