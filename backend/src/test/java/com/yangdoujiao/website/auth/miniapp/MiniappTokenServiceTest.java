package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.common.exception.ApiException;

class MiniappTokenServiceTest {
    private static final Instant NOW = Instant.parse("2026-10-08T02:00:00Z");

    private MiniappAuthTokenRepository tokens;
    private MiniappTokenService service;
    private UserAccount account;

    @BeforeEach
    void setUp() {
        tokens = mock(MiniappAuthTokenRepository.class);
        service = new MiniappTokenService(tokens, properties(), Clock.fixed(NOW, ZoneOffset.UTC));
        account = UserAccount.external("微信用户", "agreement-v1", "privacy-v1");
    }

    @Test
    void issuesUrlSafeRandomTokensAndPersistsOnlyHashesWithConfiguredExpiries() {
        MiniappTokenSet issued = service.issue(account);

        assertThat(Base64.getUrlDecoder().decode(issued.accessToken())).hasSize(32);
        assertThat(Base64.getUrlDecoder().decode(issued.refreshToken())).hasSize(32);
        assertThat(issued.accessToken()).doesNotContain("=");
        assertThat(issued.refreshToken()).doesNotContain("=").isNotEqualTo(issued.accessToken());
        assertThat(issued.accessExpiresAt()).isEqualTo(OffsetDateTime.ofInstant(NOW.plus(Duration.ofMinutes(15)), ZoneOffset.UTC));
        assertThat(issued.refreshExpiresAt()).isEqualTo(OffsetDateTime.ofInstant(NOW.plus(Duration.ofDays(30)), ZoneOffset.UTC));

        ArgumentCaptor<Iterable<MiniappAuthToken>> saved = iterableCaptor();
        verify(tokens).saveAll(saved.capture());
        List<MiniappAuthToken> rows = copy(saved.getValue());
        assertThat(rows).hasSize(2);
        assertThat(rows).extracting(MiniappAuthToken::getTokenHash)
                .containsExactlyInAnyOrder(AuthHash.sha256(issued.accessToken()), AuthHash.sha256(issued.refreshToken()))
                .noneMatch(hash -> hash.equals(issued.accessToken()) || hash.equals(issued.refreshToken()));
        assertThat(rows).extracting(MiniappAuthToken::getTokenKind)
                .containsExactlyInAnyOrder(MiniappAuthTokenKind.ACCESS, MiniappAuthTokenKind.REFRESH);
        assertThat(rows).extracting(MiniappAuthToken::getFamilyId).doesNotContainNull().hasSize(2);
        assertThat(rows.get(0).getFamilyId()).isEqualTo(rows.get(1).getFamilyId());
    }

    @Test
    void authenticatesOnlyActiveAccessTokens() {
        MiniappAuthToken active = MiniappAuthToken.issue(account, "hash", MiniappAuthTokenKind.ACCESS,
                UUID.randomUUID(), now().plusMinutes(15), now());
        when(tokens.findActiveByHash(AuthHash.sha256("access"), MiniappAuthTokenKind.ACCESS, now()))
                .thenReturn(Optional.of(active));

        assertThat(service.authenticate("access")).isSameAs(account);
        assertThatThrownBy(() -> service.authenticate("missing"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_TOKEN_INVALID");
    }

    @Test
    void rotatesRefreshTokenAndLinksReplacementHash() {
        UUID familyId = UUID.randomUUID();
        MiniappAuthToken current = MiniappAuthToken.issue(account, AuthHash.sha256("refresh"),
                MiniappAuthTokenKind.REFRESH, familyId, now().plusDays(30), now());
        when(tokens.findForUpdateByHash(AuthHash.sha256("refresh"), MiniappAuthTokenKind.REFRESH))
                .thenReturn(Optional.of(current));

        MiniappTokenSet rotated = service.rotate("refresh");

        assertThat(current.getRevokedAt()).isEqualTo(now());
        assertThat(current.getReplacedByHash()).isEqualTo(AuthHash.sha256(rotated.refreshToken()));
        verify(tokens).save(current);
        assertThat(rotated.accessToken()).isNotBlank();
        assertThat(rotated.refreshToken()).isNotBlank();
    }

    @Test
    void reuseOfRotatedRefreshRevokesWholeFamily() {
        UUID familyId = UUID.randomUUID();
        MiniappAuthToken reused = MiniappAuthToken.issue(account, AuthHash.sha256("old-refresh"),
                MiniappAuthTokenKind.REFRESH, familyId, now().plusDays(30), now().minusMinutes(1));
        reused.rotate(AuthHash.sha256("replacement"), now());
        when(tokens.findForUpdateByHash(AuthHash.sha256("old-refresh"), MiniappAuthTokenKind.REFRESH))
                .thenReturn(Optional.of(reused));

        assertThatThrownBy(() -> service.rotate("old-refresh"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_TOKEN_REUSED");
        verify(tokens).revokeFamily(familyId, now());
    }

    @Test
    void rejectsBlankTokensWithoutRepositoryLookup() {
        assertThatThrownBy(() -> service.authenticate(" "))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_TOKEN_INVALID");
        assertThatThrownBy(() -> service.rotate(null))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_TOKEN_INVALID");
    }

    @Test
    void rejectsBearerAuthenticationWhenMiniappAuthIsDisabled() {
        MiniappTokenService disabled = new MiniappTokenService(tokens,
                new MiniappAuthProperties(false, "", "", Duration.ofMinutes(15), Duration.ofDays(30),
                        false, "", ""), Clock.fixed(NOW, ZoneOffset.UTC));

        assertThatThrownBy(() -> disabled.authenticate("previously-issued-token"))
                .isInstanceOf(ApiException.class)
                .extracting("code").isEqualTo("MINIAPP_TOKEN_INVALID");
    }

    private OffsetDateTime now() {
        return OffsetDateTime.ofInstant(NOW, ZoneOffset.UTC);
    }

    private MiniappAuthProperties properties() {
        return new MiniappAuthProperties(true, "mini-app", "secret",
                Duration.ofMinutes(15), Duration.ofDays(30), false, "", "");
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private ArgumentCaptor<Iterable<MiniappAuthToken>> iterableCaptor() {
        return (ArgumentCaptor) ArgumentCaptor.forClass(Iterable.class);
    }

    private List<MiniappAuthToken> copy(Iterable<MiniappAuthToken> source) {
        List<MiniappAuthToken> result = new ArrayList<>();
        source.forEach(result::add);
        return result;
    }
}
