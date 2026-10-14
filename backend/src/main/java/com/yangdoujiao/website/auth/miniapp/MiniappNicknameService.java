package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.community.CommunityRiskPolicy;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class MiniappNicknameService {
    private final UserExternalIdentityRepository identities;
    private final CommunityRiskPolicy safety;

    public MiniappNicknameService(UserExternalIdentityRepository identities, CommunityRiskPolicy safety) {
        this.identities = identities;
        this.safety = safety;
    }

    @Transactional
    public MiniappAccountResponse update(long accountId, String value) {
        String name = value == null ? "" : value.strip();
        if (name.isBlank() || name.codePointCount(0, name.length()) > 32
                || name.codePoints().anyMatch(Character::isISOControl))
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_NICKNAME", "Nickname must contain 1 to 32 characters");
        var identity = identities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, accountId).orElseThrow(() ->
                new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required"));
        if (safety.classify(accountId, name) != CommunityRiskPolicy.RiskDecision.PUBLISH)
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "NICKNAME_NOT_APPROVED", "Nickname could not be approved");
        identity.updateProfile(name, null, OffsetDateTime.now());
        identities.save(identity);
        return MiniappAccountResponse.from(identity.getUserAccount(), identity);
    }
}
