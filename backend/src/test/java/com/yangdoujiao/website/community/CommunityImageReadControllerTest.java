package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;

class CommunityImageReadControllerTest {
    @Test void administratorReceivesReviewerVisibilityWhenListingImages() {
        var images=mock(CommunityImageAttachments.class);
        var expected=Map.<String,List<CommunityImageAttachments.Image>>of();
        when(images.forPosts(List.of(17L),42L,true)).thenReturn(expected);

        var response=new CommunityImageReadController(images).list(List.of("17"),principal(UserAccountRole.ADMIN));

        assertThat(response.getBody()).isSameAs(expected);
        verify(images).forPosts(List.of(17L),42L,true);
    }

    @Test void regularUserDoesNotReceiveReviewerVisibility() {
        var images=mock(CommunityImageAttachments.class);
        when(images.forPosts(List.of(17L),42L,false)).thenReturn(Map.of());

        new CommunityImageReadController(images).list(List.of("17"),principal(UserAccountRole.USER));

        verify(images).forPosts(List.of(17L),42L,false);
    }

    private static UserPrincipal principal(UserAccountRole role) {
        var account=UserAccount.external("Reviewer","reviewer","reviewer");
        ReflectionTestUtils.setField(account,"id",42L);
        ReflectionTestUtils.setField(account,"role",role);
        return UserPrincipal.from(account);
    }
}
