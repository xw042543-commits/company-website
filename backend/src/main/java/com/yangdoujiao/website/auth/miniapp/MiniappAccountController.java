package com.yangdoujiao.website.auth.miniapp;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;

@RestController
@RequestMapping("/api/v1/miniapp/account")
public class MiniappAccountController {
    private final UserAccountRepository accounts;
    private final UserExternalIdentityRepository identities;

    public MiniappAccountController(UserAccountRepository accounts, UserExternalIdentityRepository identities) {
        this.accounts = accounts;
        this.identities = identities;
    }

    @GetMapping
    public MiniappAccountResponse account(@AuthenticationPrincipal UserPrincipal principal) {
        UserAccount account = accounts.findById(principal.userId()).orElseThrow(this::unauthorized);
        UserExternalIdentity identity = identities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, account.getId()).orElse(null);
        return MiniappAccountResponse.from(account, identity);
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
    }
}
