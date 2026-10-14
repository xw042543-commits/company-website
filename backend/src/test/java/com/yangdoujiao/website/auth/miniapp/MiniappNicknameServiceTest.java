package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.external.*;
import com.yangdoujiao.website.community.CommunityRiskPolicy;
import com.yangdoujiao.website.common.exception.ApiException;

class MiniappNicknameServiceTest {
    private final UserExternalIdentityRepository identities = mock(UserExternalIdentityRepository.class);
    private final CommunityRiskPolicy safety = mock(CommunityRiskPolicy.class);
    private final UserAccount account = UserAccount.external("原账号姓名", "v1", "v1");
    private final UserExternalIdentity identity = UserExternalIdentity.bind(account,
            ExternalIdentityProvider.WECHAT_MINI_PROGRAM, "app", "subject", "旧昵称", "https://example.com/avatar", OffsetDateTime.now());

    @Test void accountResponseUsesPublicNicknameWithoutChangingAccountName() {
        assertThat(MiniappAccountResponse.from(account, identity).displayName()).isEqualTo("旧昵称");
        assertThat(MiniappAccountResponse.from(account, null).displayName()).isEqualTo("原账号姓名");
    }

    @Test void savesTrimmedNicknameAndPreservesAvatarAndAccountName() {
        when(identities.findByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.of(identity));
        when(safety.classify(42L, "新昵称")).thenReturn(CommunityRiskPolicy.RiskDecision.PUBLISH);
        var response = new MiniappNicknameService(identities, safety).update(42L, " 新昵称 ");
        assertThat(response.displayName()).isEqualTo("新昵称");
        assertThat(identity.getDisplayName()).isEqualTo("新昵称");
        assertThat(response.avatarUrl()).isEqualTo("https://example.com/avatar");
        assertThat(account.getFullName()).isEqualTo("原账号姓名");
        verify(identities).save(identity);
    }

    @Test void invalidNamesNeverWrite() {
        var service = new MiniappNicknameService(identities, safety);
        for (String value : new String[]{null, " ", "a\nb", "名".repeat(33)})
            assertThatThrownBy(() -> service.update(42L, value)).isInstanceOf(ApiException.class);
        verifyNoInteractions(identities, safety);
    }

    @Test void failedSafetyCheckPreservesExistingNickname() {
        when(identities.findByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM, 42L)).thenReturn(Optional.of(identity));
        when(safety.classify(42L, "新昵称")).thenReturn(CommunityRiskPolicy.RiskDecision.REVIEW);
        assertThatThrownBy(() -> new MiniappNicknameService(identities, safety).update(42L, "新昵称")).isInstanceOf(ApiException.class);
        assertThat(identity.getDisplayName()).isEqualTo("旧昵称");
        verify(identities, never()).save(any());
    }
}
