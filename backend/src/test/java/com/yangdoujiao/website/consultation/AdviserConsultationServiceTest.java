package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.session.UserPrincipal;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@SuppressWarnings("unchecked")
class AdviserConsultationServiceTest {
    private ConsultationEnquiryRepository repository;
    private AdviserConsultationService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        repository = mock(ConsultationEnquiryRepository.class);
        service = new AdviserConsultationService(repository, new ConsultationAuditLogger(), false);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(), invocation.getArgument(1), 0));
    }

    @ParameterizedTest
    @CsvSource({"-1,20", "0,0", "0,-1", "0,101"})
    void rejectsOutOfBoundsPagination(int page, int size) {
        assertBadRequest(() -> service.list(page, size, null, null));
    }

    @ParameterizedTest
    @CsvSource({"2147483647,20", "1073741824,2", "107374183,20"})
    void rejectsOffsetAboveJpaIntegerLimitBeforeRepositoryAccess(int page, int size) {
        assertBadRequest(() -> service.list(page, size, null, null));
        verifyNoInteractions(repository);
    }

    @ParameterizedTest
    @CsvSource({"2147483647,1", "107374182,20"})
    void acceptsOffsetAtOrBelowJpaIntegerLimit(int page, int size) {
        assertThat(service.list(page, size, null, null).page()).isEqualTo(page);
    }

    @Test
    void rejectsQueryAboveOneHundredCharactersAfterTrimming() {
        assertBadRequest(() -> service.list(0, 20, null, "x".repeat(101)));
    }

    @Test
    void acceptsBoundaryPageSizesAndOneHundredCharactersAfterTrimming() {
        assertThat(service.list(0, 1, null, "  " + "x".repeat(100) + "　").size()).isEqualTo(1);
        assertThat(service.list(0, 100, null, null).size()).isEqualTo(100);
    }

    @Test
    void defaultsPaginationAndUsesStableNewestFirstOrdering() {
        AdviserConsultationPage result = service.list(null, null, null, null);
        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(20);
        ArgumentCaptor<Pageable> page = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(any(Specification.class), page.capture());
        assertThat(page.getValue().getSort()).containsExactly(
                Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
    }

    @Test
    void usesOneSpecificationForPageContentAndTotalAndGlobalStatusCounts() {
        ConsultationEnquiry enquiry = fixture();
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(enquiry), invocation.getArgument(1), 5));
        when(repository.countByStatus(ConsultationStatus.NEW)).thenReturn(7L);
        when(repository.countByStatus(ConsultationStatus.IN_PROGRESS)).thenReturn(3L);
        when(repository.countByStatus(ConsultationStatus.COMPLETED)).thenReturn(2L);

        AdviserConsultationPage result = service.list(1, 2, ConsultationStatus.NEW, "Lim");

        assertThat(result.items()).extracting(AdviserConsultationSummary::referenceCode)
                .containsExactly(enquiry.getReferenceCode());
        assertThat(result.totalElements()).isEqualTo(5);
        assertThat(result.totalPages()).isEqualTo(3);
        assertThat(result.page()).isEqualTo(1);
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.counts()).isEqualTo(new ConsultationStatusCounts(7, 3, 2));
    }

    @Test
    void listReportsWhetherPublicSubmissionIsEnabled() {
        AdviserConsultationService enabled = new AdviserConsultationService(
                repository, new ConsultationAuditLogger(), true);
        AdviserConsultationService paused = new AdviserConsultationService(
                repository, new ConsultationAuditLogger(), false);

        assertThat(enabled.list(0, 20, null, null).submissionEnabled()).isTrue();
        assertThat(paused.list(0, 20, null, null).submissionEnabled()).isFalse();
    }

    @Test
    @SuppressWarnings("unchecked")
    void combinesStatusAndTrimmedCaseInsensitiveNameOrContactWithAnd() {
        service.list(0, 20, ConsultationStatus.NEW, "　 LiM  ");
        ArgumentCaptor<Specification<ConsultationEnquiry>> capture = ArgumentCaptor.forClass(Specification.class);
        verify(repository).findAll(capture.capture(), any(Pageable.class));
        Root<ConsultationEnquiry> root = mock(Root.class);
        CriteriaBuilder builder = mock(CriteriaBuilder.class);
        Path<Object> status = mock(Path.class);
        Path<String> name = mock(Path.class);
        Path<String> contact = mock(Path.class);
        Expression<String> lowerName = mock(Expression.class);
        Expression<String> lowerContact = mock(Expression.class);
        when(root.get("status")).thenReturn(status);
        when(root.<String>get("name")).thenReturn(name);
        when(root.<String>get("contact")).thenReturn(contact);
        when(builder.lower(name)).thenReturn(lowerName);
        when(builder.lower(contact)).thenReturn(lowerContact);
        Predicate statusPredicate = mock(Predicate.class);
        Predicate namePredicate = mock(Predicate.class);
        Predicate contactPredicate = mock(Predicate.class);
        Predicate searchPredicate = mock(Predicate.class);
        Predicate combined = mock(Predicate.class);
        when(builder.equal(status, ConsultationStatus.NEW)).thenReturn(statusPredicate);
        when(builder.like(lowerName, "%lim%", '\\')).thenReturn(namePredicate);
        when(builder.like(lowerContact, "%lim%", '\\')).thenReturn(contactPredicate);
        when(builder.or(namePredicate, contactPredicate)).thenReturn(searchPredicate);
        when(builder.and(statusPredicate, searchPredicate)).thenReturn(combined);

        assertThat(capture.getValue().toPredicate(root, null, builder)).isSameAs(combined);
    }

    @Test
    @SuppressWarnings("unchecked")
    void blankQueryHasNoSearchPredicateAndLiteralWildcardsAreEscaped() {
        service.list(0, 100, null, "　 ");
        ArgumentCaptor<Specification<ConsultationEnquiry>> capture = ArgumentCaptor.forClass(Specification.class);
        verify(repository).findAll(capture.capture(), any(Pageable.class));
        CriteriaBuilder builder = mock(CriteriaBuilder.class);
        Predicate unfiltered = mock(Predicate.class);
        when(builder.conjunction()).thenReturn(unfiltered);
        assertThat(capture.getValue().toPredicate(mock(Root.class), null, builder)).isSameAs(unfiltered);

        repository = mock(ConsultationEnquiryRepository.class);
        service = new AdviserConsultationService(repository, new ConsultationAuditLogger(), false);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
        service.list(0, 20, null, "  %_\\  ");
        verify(repository).findAll(capture.capture(), any(Pageable.class));
        Root<ConsultationEnquiry> root = mock(Root.class);
        capture.getValue().toPredicate(root, null, builder);
        verify(builder, org.mockito.Mockito.times(2)).like(any(), eq("%\\%\\_\\\\%"), eq('\\'));
    }

    @Test
    @SuppressWarnings("unchecked")
    void uuidQueryAlsoMatchesExactReference() {
        UUID reference = UUID.fromString("00000000-0000-0000-0000-000000000123");
        service.list(0, 20, null, reference.toString());
        ArgumentCaptor<Specification<ConsultationEnquiry>> capture = ArgumentCaptor.forClass(Specification.class);
        verify(repository).findAll(capture.capture(), any(Pageable.class));
        Root<ConsultationEnquiry> root = mock(Root.class);
        CriteriaBuilder builder = mock(CriteriaBuilder.class);
        Path<Object> referencePath = mock(Path.class);
        when(root.get("referenceCode")).thenReturn(referencePath);
        capture.getValue().toPredicate(root, null, builder);
        verify(builder).equal(referencePath, reference);
    }

    @Test
    void detailContainsSubmittedFieldsAndWorkflowMetadata() {
        ConsultationEnquiry enquiry = fixture();
        ReflectionTestUtils.setField(enquiry, "statusUpdatedByUserId", 42L);
        ReflectionTestUtils.setField(enquiry, "version", 3L);
        when(repository.findByReferenceCode(enquiry.getReferenceCode())).thenReturn(Optional.of(enquiry));
        AdviserConsultationDetail detail = service.detail(enquiry.getReferenceCode());
        assertThat(detail.referenceCode()).isEqualTo(enquiry.getReferenceCode());
        assertThat(detail.name()).isEqualTo("Lim");
        assertThat(detail.contact()).isEqualTo("lim@example.test");
        assertThat(detail.intendedSchool()).isEqualTo("School");
        assertThat(detail.intendedCourse()).isEqualTo("Course");
        assertThat(detail.qualification()).isEqualTo("bachelor");
        assertThat(detail.notes()).isEqualTo("Submitted notes");
        assertThat(detail.locale()).isEqualTo("en");
        assertThat(detail.privacyNoticeVersion()).isEqualTo("privacy-v1");
        assertThat(detail.status()).isEqualTo(ConsultationStatus.NEW);
        assertThat(detail.createdAt()).isEqualTo(enquiry.getCreatedAt());
        assertThat(detail.statusUpdatedAt()).isEqualTo(enquiry.getCreatedAt());
        assertThat(detail.statusUpdatedByUserId()).isEqualTo(42L);
        assertThat(detail.version()).isEqualTo(3);
    }

    @Test
    void missingReferenceIsNotFound() {
        UUID reference = UUID.randomUUID();
        when(repository.findByReferenceCode(reference)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.detail(reference)).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void statusUpdateAlsoEnforcesAdviserAuthorityWhenCalledWithoutHttpSecurity() {
        UserAccount account = UserAccount.external("Ordinary", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", 7L);
        UserPrincipal ordinary = UserPrincipal.from(account);
        assertThatThrownBy(() -> service.updateStatus(fixture().getReferenceCode(),
                new ConsultationStatusUpdateRequest(ConsultationStatus.COMPLETED, 0L), ordinary))
                .isInstanceOfSatisfying(ApiException.class,
                        exception -> assertThat(exception.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatThrownBy(() -> service.updateStatus(fixture().getReferenceCode(),
                new ConsultationStatusUpdateRequest(ConsultationStatus.COMPLETED, 0L), null))
                .isInstanceOfSatisfying(ApiException.class,
                        exception -> assertThat(exception.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
        verifyNoInteractions(repository);
    }

    private void assertBadRequest(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    static ConsultationEnquiry fixture() {
        return new ConsultationEnquiry(UUID.fromString("00000000-0000-0000-0000-000000000123"),
                "Lim", "lim@example.test", "School", "Course", "bachelor", "Submitted notes", "en",
                "privacy-v1", OffsetDateTime.parse("2026-10-06T09:00:00Z"));
    }
}
