package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.config.AuthProperties;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class MiniappLoginService {
    private static final ExternalIdentityProvider PROVIDER = ExternalIdentityProvider.WECHAT_MINI_PROGRAM;

    private final MiniappAuthProperties properties;
    private final ObjectProvider<MiniappIdentityProvider> provider;
    private final UserExternalIdentityRepository identities;
    private final UserAccountRepository accounts;
    private final AuthProperties authProperties;
    private final MiniappTokenService tokens;
    private final TransactionTemplate transaction;

    public MiniappLoginService(MiniappAuthProperties properties,
            ObjectProvider<MiniappIdentityProvider> provider,
            UserExternalIdentityRepository identities, UserAccountRepository accounts,
            AuthProperties authProperties, MiniappTokenService tokens,
            PlatformTransactionManager transactionManager) {
        this.properties = properties;
        this.provider = provider;
        this.identities = identities;
        this.accounts = accounts;
        this.authProperties = authProperties;
        this.tokens = tokens;
        this.transaction = new TransactionTemplate(transactionManager);
    }

    public MiniappSessionResponse login(String code) {
        MiniappProviderIdentity providerIdentity = client().exchange(code);
        UserAccount account = findOrCreateAccount(providerIdentity);
        MiniappTokenSet issued = tokens.issue(account);
        return MiniappSessionResponse.from(issued, identity(account));
    }

    public MiniappSessionResponse refresh(String refreshToken) {
        if (!properties.enabled()) throw unavailable();
        MiniappTokenSet rotated = tokens.rotate(refreshToken);
        return MiniappSessionResponse.from(rotated, identity(rotated.account()));
    }

    private UserAccount findOrCreateAccount(MiniappProviderIdentity providerIdentity) {
        try {
            return transaction.execute(status -> identities.findDetailed(PROVIDER,
                    providerIdentity.clientId(), providerIdentity.subject())
                    .map(identity -> {
                        UserAccount account = active(identity.getUserAccount());
                        identity.markLogin(OffsetDateTime.now());
                        identities.saveAndFlush(identity);
                        return account;
                    }).orElseGet(() -> {
                        UserAccount account = accounts.saveAndFlush(UserAccount.external("微信用户",
                                authProperties.agreementVersion(), authProperties.privacyVersion()));
                        identities.saveAndFlush(UserExternalIdentity.bind(account, PROVIDER,
                                providerIdentity.clientId(), providerIdentity.subject(), OffsetDateTime.now()));
                        return account;
                    }));
        } catch (DataIntegrityViolationException exception) {
            UserAccount winner = transaction.execute(status -> identities.findDetailed(PROVIDER,
                    providerIdentity.clientId(), providerIdentity.subject())
                    .map(identity -> active(identity.getUserAccount())).orElse(null));
            if (winner != null) return winner;
            throw unavailable();
        }
    }

    private UserExternalIdentity identity(UserAccount account) {
        return identities.findByProviderAndUserAccountId(PROVIDER, account.getId()).orElse(null);
    }

    private UserAccount active(UserAccount account) {
        if (account.getStatus() != UserAccountStatus.ACTIVE || account.getDeletedAt() != null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "MINIAPP_ACCOUNT_UNAVAILABLE",
                    "Account cannot sign in");
        }
        return account;
    }

    private MiniappIdentityProvider client() {
        if (!properties.enabled()) throw unavailable();
        MiniappIdentityProvider value = provider.getIfAvailable();
        if (value == null) throw unavailable();
        return value;
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MINIAPP_AUTH_UNAVAILABLE",
                "Mini program sign-in is unavailable");
    }
}
