package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.common.exception.ApiException;

class MiniappAvatarServiceTest {
    private final MiniappAvatarRepository avatars = mock(MiniappAvatarRepository.class);
    private final UserExternalIdentityRepository identities = mock(UserExternalIdentityRepository.class);
    private final MiniappAvatarService service = new MiniappAvatarService(
            avatars, identities, "https://yangdoujiao.com/");

    @Test
    void savesAValidPngAndUpdatesTheMiniappProfileUrl() {
        UserAccount account = mock(UserAccount.class);
        when(account.getId()).thenReturn(42L);
        when(account.getFullName()).thenReturn("微信用户");
        UserExternalIdentity identity = UserExternalIdentity.bind(account,
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, "app", "subject", OffsetDateTime.now());
        when(identities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.of(identity));
        byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1};

        MiniappAccountResponse result = service.update(42L,
                new MiniappAvatarRequest("image/png", Base64.getEncoder().encodeToString(png)));

        verify(avatars).save(42L, "image/png", png);
        verify(identities).save(identity);
        assertThat(result.avatarUrl()).startsWith("https://yangdoujiao.com/api/v1/miniapp/avatars/42?v=");
    }

    @Test
    void rejectsUnknownContentAndFilesOverOneMegabyte() {
        assertThatThrownBy(() -> service.update(1L,
                new MiniappAvatarRequest(null, Base64.getEncoder().encodeToString(new byte[]{1, 2, 3}))))
                .isInstanceOf(ApiException.class);
        byte[] large = new byte[MiniappAvatarService.MAX_BYTES + 1];
        assertThatThrownBy(() -> service.update(1L,
                new MiniappAvatarRequest(null, Base64.getEncoder().encodeToString(large))))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void removesStoredAvatarAndClearsThePublicProfileUrl() {
        UserAccount account = mock(UserAccount.class);
        when(account.getId()).thenReturn(42L);
        when(account.getFullName()).thenReturn("微信用户");
        UserExternalIdentity identity = UserExternalIdentity.bind(account,
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, "app", "subject",
                "微信用户", "https://yangdoujiao.com/avatar.png", OffsetDateTime.now());
        when(identities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.of(identity));

        MiniappAccountResponse result = service.remove(42L);

        verify(avatars).delete(42L);
        verify(identities).save(identity);
        assertThat(result.avatarUrl()).isNull();
    }
}
