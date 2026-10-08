package com.yangdoujiao.website.auth.miniapp;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class MiniappTokenService {
    private static final int TOKEN_BYTES = 32;

    private final MiniappAuthTokenRepository tokens;
    private final MiniappAuthProperties properties;
    private final Clock clock;
    private final SecureRandom random;

    @Autowired
    public MiniappTokenService(MiniappAuthTokenRepository tokens, MiniappAuthProperties properties,
            Clock clock) {
        this(tokens, properties, clock, new SecureRandom());
    }

    MiniappTokenService(MiniappAuthTokenRepository tokens, MiniappAuthProperties properties,
            Clock clock, SecureRandom random) {
        this.tokens = tokens;
        this.properties = properties;
        this.clock = clock;
        this.random = random;
    }

    @Transactional
    public MiniappTokenSet issue(UserAccount account) {
        return issue(account, UUID.randomUUID());
    }

    @Transactional(readOnly = true)
    public UserAccount authenticate(String rawAccessToken) {
        if (!properties.enabled() || blank(rawAccessToken)) throw invalid();
        UserAccount account = tokens.findActiveByHash(
                AuthHash.sha256(rawAccessToken), MiniappAuthTokenKind.ACCESS, now())
                .map(MiniappAuthToken::getUserAccount)
                .orElseThrow(this::invalid);
        if (account.getStatus() != UserAccountStatus.ACTIVE || account.getDeletedAt() != null) throw invalid();
        return account;
    }

    @Transactional(noRollbackFor = ApiException.class)
    public MiniappTokenSet rotate(String rawRefreshToken) {
        if (blank(rawRefreshToken)) throw invalid();
        OffsetDateTime now = now();
        MiniappAuthToken current = tokens.findForUpdateByHash(
                AuthHash.sha256(rawRefreshToken), MiniappAuthTokenKind.REFRESH)
                .orElseThrow(this::invalid);
        if (current.getRevokedAt() != null && current.getReplacedByHash() != null) {
            tokens.revokeFamily(current.getFamilyId(), now);
            throw reused();
        }
        if (!current.isActive(now)) throw invalid();

        MiniappTokenSet replacement = issue(current.getUserAccount(), current.getFamilyId());
        current.rotate(AuthHash.sha256(replacement.refreshToken()), now);
        tokens.save(current);
        return replacement;
    }

    @Transactional
    public void revokeFamily(String rawRefreshToken) {
        if (blank(rawRefreshToken)) return;
        tokens.findForUpdateByHash(AuthHash.sha256(rawRefreshToken), MiniappAuthTokenKind.REFRESH)
                .ifPresent(token -> tokens.revokeFamily(token.getFamilyId(), now()));
    }

    private MiniappTokenSet issue(UserAccount account, UUID familyId) {
        OffsetDateTime now = now();
        String access = randomToken();
        String refresh = randomToken();
        OffsetDateTime accessExpiry = now.plus(properties.accessTokenTtl());
        OffsetDateTime refreshExpiry = now.plus(properties.refreshTokenTtl());
        tokens.saveAll(List.of(
                MiniappAuthToken.issue(account, AuthHash.sha256(access), MiniappAuthTokenKind.ACCESS,
                        familyId, accessExpiry, now),
                MiniappAuthToken.issue(account, AuthHash.sha256(refresh), MiniappAuthTokenKind.REFRESH,
                        familyId, refreshExpiry, now)));
        return new MiniappTokenSet(access, accessExpiry, refresh, refreshExpiry, account);
    }

    private String randomToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(clock);
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private ApiException invalid() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "MINIAPP_TOKEN_INVALID",
                "Mini program token is missing, expired, or invalid");
    }

    private ApiException reused() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "MINIAPP_TOKEN_REUSED",
                "Mini program refresh token reuse was detected");
    }
}
