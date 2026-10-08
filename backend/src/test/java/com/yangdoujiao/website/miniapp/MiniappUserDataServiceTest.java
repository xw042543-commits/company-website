package com.yangdoujiao.website.miniapp;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.consultation.ConsultationEnquiryRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;

class MiniappUserDataServiceTest {
    @Test
    void neverDeletesAnotherUsersPlan() {
        MiniappProgrammeFavoriteRepository favorites = mock(MiniappProgrammeFavoriteRepository.class);
        MiniappStudyPlanRepository plans = mock(MiniappStudyPlanRepository.class);
        ConsultationEnquiryRepository consultations = mock(ConsultationEnquiryRepository.class);
        ProgrammeRepository programmes = mock(ProgrammeRepository.class);
        MiniappUserDataService service = new MiniappUserDataService(favorites, plans, consultations, programmes);
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
                mock(ProgrammeRepository.class));
        when(favorites.countByUserAccountId(7L)).thenReturn(2L);
        when(plans.countByUserAccountId(7L)).thenReturn(3L);
        when(consultations.countByUserAccountId(7L)).thenReturn(4L);

        var overview = service.overview(7L);

        org.assertj.core.api.Assertions.assertThat(overview.favorites()).isEqualTo(2L);
        org.assertj.core.api.Assertions.assertThat(overview.plans()).isEqualTo(3L);
        org.assertj.core.api.Assertions.assertThat(overview.consultations()).isEqualTo(4L);
    }
}
