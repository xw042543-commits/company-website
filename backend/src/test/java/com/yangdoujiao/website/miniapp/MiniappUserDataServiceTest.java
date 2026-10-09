package com.yangdoujiao.website.miniapp;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import com.yangdoujiao.website.application.ApplicationRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationEnquiryRepository;
import com.yangdoujiao.website.consultation.ConsultationEnquiry;
import com.yangdoujiao.website.consultation.ConsultationStatus;
import com.yangdoujiao.website.programme.ProgrammeRepository;

class MiniappUserDataServiceTest {
    @Test
    void neverDeletesAnotherUsersPlan() {
        MiniappProgrammeFavoriteRepository favorites = mock(MiniappProgrammeFavoriteRepository.class);
        MiniappStudyPlanRepository plans = mock(MiniappStudyPlanRepository.class);
        ConsultationEnquiryRepository consultations = mock(ConsultationEnquiryRepository.class);
        ProgrammeRepository programmes = mock(ProgrammeRepository.class);
        MiniappUserDataService service = new MiniappUserDataService(favorites, plans, consultations, programmes,
                mock(ApplicationRepository.class), mock(MiniappWalletRepository.class));
        when(plans.findByIdAndUserAccountId(9L, 41L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.removePlan(41L, 9L))
                .isInstanceOf(ApiException.class);
        verify(plans).findByIdAndUserAccountId(9L, 41L);
    }

    @Test
    void overviewCountsOnlyTheAuthenticatedUsersRows() {
        MiniappProgrammeFavoriteRepository favorites = mock(MiniappProgrammeFavoriteRepository.class);
        MiniappStudyPlanRepository plans = mock(MiniappStudyPlanRepository.class);
        ConsultationEnquiryRepository consultations = mock(ConsultationEnquiryRepository.class);
        MiniappUserDataService service = new MiniappUserDataService(favorites, plans, consultations,
                mock(ProgrammeRepository.class), mock(ApplicationRepository.class), mock(MiniappWalletRepository.class));
        when(favorites.countByUserAccountId(7L)).thenReturn(2L);
        when(plans.countByUserAccountId(7L)).thenReturn(3L);
        when(consultations.countByUserAccountId(7L)).thenReturn(4L);

        var overview = service.overview(7L);

        org.assertj.core.api.Assertions.assertThat(overview.favorites()).isEqualTo(2L);
        org.assertj.core.api.Assertions.assertThat(overview.plans()).isEqualTo(3L);
        org.assertj.core.api.Assertions.assertThat(overview.consultations()).isEqualTo(4L);
        org.assertj.core.api.Assertions.assertThat(overview.orders()).isZero();
    }

    @Test
    void exposesOwnedConsultationsAsApplicationOrders() {
        ConsultationEnquiryRepository consultations = mock(ConsultationEnquiryRepository.class);
        MiniappUserDataService service = new MiniappUserDataService(mock(MiniappProgrammeFavoriteRepository.class),
                mock(MiniappStudyPlanRepository.class), consultations, mock(ProgrammeRepository.class),
                mock(ApplicationRepository.class), mock(MiniappWalletRepository.class));
        UUID reference = UUID.randomUUID();
        OffsetDateTime submittedAt = OffsetDateTime.parse("2026-10-09T09:30:00+08:00");
        ConsultationEnquiry enquiry = mock(ConsultationEnquiry.class);
        when(enquiry.getReferenceCode()).thenReturn(reference);
        when(enquiry.getIntendedSchool()).thenReturn("世纪大学");
        when(enquiry.getIntendedCourse()).thenReturn("工商管理学士学位");
        when(enquiry.getQualification()).thenReturn("本科");
        when(enquiry.getStatus()).thenReturn(ConsultationStatus.NEW);
        when(enquiry.getCreatedAt()).thenReturn(submittedAt);
        when(enquiry.getStatusUpdatedAt()).thenReturn(submittedAt);
        when(consultations.findAllByUserAccountIdOrderByCreatedAtDescIdDesc(7L)).thenReturn(List.of(enquiry));

        var orders = service.orders(7L);

        org.assertj.core.api.Assertions.assertThat(orders).singleElement().satisfies(order -> {
            org.assertj.core.api.Assertions.assertThat(order.referenceCode()).isEqualTo(reference);
            org.assertj.core.api.Assertions.assertThat(order.status()).isEqualTo("IN_PROGRESS");
            org.assertj.core.api.Assertions.assertThat(order.statusLabel()).isEqualTo("进行中");
        });
    }

    @Test
    void orderDetailUsesAnOwnershipScopedLookup() {
        ConsultationEnquiryRepository consultations = mock(ConsultationEnquiryRepository.class);
        MiniappUserDataService service = new MiniappUserDataService(mock(MiniappProgrammeFavoriteRepository.class),
                mock(MiniappStudyPlanRepository.class), consultations, mock(ProgrammeRepository.class),
                mock(ApplicationRepository.class), mock(MiniappWalletRepository.class));
        UUID reference = UUID.randomUUID();
        when(consultations.findByReferenceCodeAndUserAccountId(reference, 41L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.order(41L, reference)).isInstanceOf(ApiException.class);
        verify(consultations).findByReferenceCodeAndUserAccountId(reference, 41L);
    }
}
