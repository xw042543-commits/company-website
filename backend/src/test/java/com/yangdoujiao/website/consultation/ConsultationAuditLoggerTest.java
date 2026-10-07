package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.slf4j.LoggerFactory;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;

class ConsultationAuditLoggerTest {
    @Test
    void statusAuditContainsOnlyWorkflowIdentifiersAndNeverSubmittedData() throws Exception {
        Logger logger = (Logger) LoggerFactory.getLogger(ConsultationAuditLogger.class);
        ListAppender<ILoggingEvent> captured = new ListAppender<>();
        captured.start();
        logger.addAppender(captured);
        try {
            new ConsultationAuditLogger().record(UUID.fromString("00000000-0000-0000-0000-000000000123"),
                    42L, ConsultationStatus.NEW, ConsultationStatus.IN_PROGRESS, "SUCCEEDED", "status-trace-123");
            assertThat(captured.list).hasSize(1);
            assertThat(captured.list.getFirst().getFormattedMessage())
                    .contains("event=consultation_status_update", "outcome=SUCCEEDED", "actorId=42",
                            "referenceHash=fc4ce5c20a6cd10567936d02f6c47d4f0ab86fa5d2b96a3bfc60af84aa8f94e4",
                            "priorStatus=NEW", "newStatus=IN_PROGRESS", "traceId=sha256:")
                    .doesNotContain("00000000-0000-0000-0000-000000000123", "Lim", "lim@example.test",
                            "School", "Course", "Submitted notes");
        } finally {
            logger.detachAppender(captured);
            captured.stop();
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/adviser/consultations/status", "/api/v1/adviser/consultations//status"})
    void malformedStatusPathWithoutReferenceDoesNotThrowOrPreventDownstreamHandling(String path) {
        var request = new org.springframework.mock.web.MockHttpServletRequest("PATCH", path);
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        org.assertj.core.api.Assertions.assertThatCode(() -> new ConsultationAuditLogger().doFilter(request, response,
                (incoming, outgoing) -> ((jakarta.servlet.http.HttpServletResponse) outgoing).setStatus(404)))
                .doesNotThrowAnyException();
        assertThat(response.getStatus()).isEqualTo(404);
    }

    @Test
    void sanitizesSupplementaryUnicodeWithoutBreakingStatusAudit() {
        org.assertj.core.api.Assertions.assertThatCode(() -> new ConsultationAuditLogger()
                .record(null, null, null, null, "REJECTED\n😀", "trace\n😀"))
                .doesNotThrowAnyException();
    }

    @Test
    void successAuditWaitsUntilTransactionCommits() {
        Logger logger = (Logger) LoggerFactory.getLogger(ConsultationAuditLogger.class);
        ListAppender<ILoggingEvent> captured = new ListAppender<>();
        captured.start();
        logger.addAppender(captured);
        var repository = org.mockito.Mockito.mock(ConsultationEnquiryRepository.class);
        var enquiry = AdviserConsultationServiceTest.fixture();
        org.mockito.Mockito.when(repository.findByReferenceCode(enquiry.getReferenceCode()))
                .thenReturn(java.util.Optional.of(enquiry));
        org.mockito.Mockito.when(repository.updateStatus(org.mockito.ArgumentMatchers.eq(enquiry.getReferenceCode()),
                org.mockito.ArgumentMatchers.eq(ConsultationStatus.COMPLETED), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(42L), org.mockito.ArgumentMatchers.eq(0L))).thenReturn(1);
        UserAccount account = UserAccount.external("Adviser", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 42L);
        ReflectionTestUtils.setField(account, "role", UserAccountRole.ADVISER);
        TransactionSynchronizationManager.initSynchronization();
        try {
            new AdviserConsultationService(repository, new ConsultationAuditLogger()).updateStatus(
                    enquiry.getReferenceCode(), new ConsultationStatusUpdateRequest(ConsultationStatus.COMPLETED, 0L),
                    UserPrincipal.from(account));
            assertThat(captured.list).isEmpty();
            TransactionSynchronizationManager.getSynchronizations().forEach(synchronization -> synchronization.afterCommit());
            assertThat(captured.list).hasSize(1);
            assertThat(captured.list.getFirst().getFormattedMessage()).contains("outcome=SUCCEEDED");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
            logger.detachAppender(captured);
            captured.stop();
        }
    }
}
