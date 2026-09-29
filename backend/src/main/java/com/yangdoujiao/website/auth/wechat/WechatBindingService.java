package com.yangdoujiao.website.auth.wechat;

import java.time.Instant;
import java.time.OffsetDateTime;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.api.AuthSessionResponse;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.session.AuthenticationService;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Service
public class WechatBindingService {
    private final AuthenticationService authentication;
    private final UserAccountRepository accounts;
    private final UserExternalIdentityRepository identities;
    private final WechatAuthAuditLogger audit;
    private final TransactionTemplate transaction;

    public WechatBindingService(AuthenticationService authentication, UserAccountRepository accounts,
            UserExternalIdentityRepository identities, WechatAuthAuditLogger audit,
            PlatformTransactionManager manager) {
        this.authentication = authentication;
        this.accounts = accounts;
        this.identities = identities;
        this.audit = audit;
        this.transaction = new TransactionTemplate(manager);
    }

    public AuthSessionResponse bind(BindWechatAccountRequest body, String clientAddress,
            HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            PendingWechatIdentity pending = pending(session);
            UserPrincipal verified = authentication.verifyCredentials(
                    body == null ? null : body.identifier(), body == null ? null : body.password(), clientAddress);
            UserAccount account = transaction.execute(status -> bindInsideTransaction(verified.userId(), pending));
            if (account == null) throw unavailable();

            session.removeAttribute(WechatOAuthStateStore.PENDING_ATTRIBUTE);
            UserPrincipal principal = authentication.establishSession(accountPrincipal(account),
                    body != null && body.shouldRemember(), request, response);
            audit.record("binding", "succeeded", pending.subject(), clientAddress, request);
            return AuthSessionResponse.authenticated(principal);
        } catch (DataIntegrityViolationException exception) {
            audit.record("binding", "conflict", null, clientAddress, request);
            throw conflict();
        } catch (ApiException exception) {
            audit.record("binding", exception.getCode(), null, clientAddress, request);
            throw exception;
        }
    }

    private UserPrincipal accountPrincipal(UserAccount account) {
        return UserPrincipal.from(account);
    }

    private UserAccount bindInsideTransaction(long userId, PendingWechatIdentity pending) {
        UserAccount account = accounts.findLockedById(userId).orElseThrow(this::invalidAccount);
        if (account.getStatus() != UserAccountStatus.ACTIVE || account.getDeletedAt() != null) throw invalidAccount();
        if (identities.existsByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT, userId)
                || identities.findDetailed(ExternalIdentityProvider.WECHAT, pending.clientId(), pending.subject()).isPresent()) {
            throw conflict();
        }
        identities.saveAndFlush(UserExternalIdentity.bind(account, ExternalIdentityProvider.WECHAT,
                pending.clientId(), pending.subject(), OffsetDateTime.now()));
        return account;
    }

    private PendingWechatIdentity pending(HttpSession session) {
        if (session == null) throw expired();
        Object value = session.getAttribute(WechatOAuthStateStore.PENDING_ATTRIBUTE);
        if (!(value instanceof PendingWechatIdentity pending) || !Instant.now().isBefore(pending.expiresAt())) {
            session.removeAttribute(WechatOAuthStateStore.PENDING_ATTRIBUTE);
            throw expired();
        }
        return pending;
    }

    private ApiException expired() {
        return new ApiException(HttpStatus.BAD_REQUEST, "WECHAT_BINDING_EXPIRED", "WeChat binding has expired");
    }

    private ApiException invalidAccount() {
        return new ApiException(HttpStatus.FORBIDDEN, "WECHAT_ACCOUNT_UNAVAILABLE", "Account cannot be linked");
    }

    private ApiException conflict() {
        return new ApiException(HttpStatus.CONFLICT, "WECHAT_IDENTITY_CONFLICT", "WeChat identity cannot be linked");
    }

    private ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AUTH_SERVICE_UNAVAILABLE",
                "Authentication service is temporarily unavailable");
    }
}
