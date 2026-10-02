package com.yangdoujiao.website.auth.wechat;

import java.net.URI;
import java.time.Instant;
import java.time.OffsetDateTime;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountStatus;
import com.yangdoujiao.website.auth.config.AuthRateLimitProperties;
import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.auth.ratelimit.AuthRateLimiter;
import com.yangdoujiao.website.auth.session.AuthenticationService;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Service
public class WechatLoginService {
    private final WechatAuthProperties properties;
    private final ObjectProvider<WechatAuthorizationProvider> provider;
    private final WechatOAuthStateStore states;
    private final UserExternalIdentityRepository identities;
    private final AuthenticationService authentication;
    private final AuthRateLimiter limiter;
    private final AuthRateLimitProperties limits;
    private final WechatAuthAuditLogger audit;
    private final TransactionTemplate transaction;

    public WechatLoginService(WechatAuthProperties properties,
            ObjectProvider<WechatAuthorizationProvider> provider, WechatOAuthStateStore states,
            UserExternalIdentityRepository identities, AuthenticationService authentication,
            AuthRateLimiter limiter, AuthRateLimitProperties limits, WechatAuthAuditLogger audit,
            PlatformTransactionManager manager) {
        this.properties = properties;
        this.provider = provider;
        this.states = states;
        this.identities = identities;
        this.authentication = authentication;
        this.limiter = limiter;
        this.limits = limits;
        this.audit = audit;
        this.transaction = new TransactionTemplate(manager);
    }

    public URI start(String locale, String returnTo, String clientAddress, HttpServletRequest request) {
        try {
            WechatAuthorizationProvider client = client();
            String state = issueState(locale, returnTo, clientAddress, request);
            audit.record("start", "redirected", null, clientAddress, request);
            return client.authorizationUri(state);
        } catch (ApiException exception) {
            audit.record("start", exception.getCode(), null, clientAddress, request);
            throw exception;
        }
    }

    public WechatQrConfigResponse qrConfiguration(String locale, String returnTo,
            String clientAddress, HttpServletRequest request) {
        try {
            client();
            String state = issueState(locale, returnTo, clientAddress, request);
            audit.record("qr_config", "issued", null, clientAddress, request);
            return new WechatQrConfigResponse(properties.appId(), "snsapi_login",
                    properties.callbackUrl().toString(), state);
        } catch (ApiException exception) {
            audit.record("qr_config", exception.getCode(), null, clientAddress, request);
            throw exception;
        }
    }

    public URI callback(String code, String state, String providerError, String clientAddress,
            HttpServletRequest request, HttpServletResponse response) {
        WechatOAuthState issued = null;
        String subject = null;
        try {
            WechatAuthorizationProvider client = client();
            limiter.consume("wechat-callback-ip", AuthHash.sha256(clientAddress),
                    limits.wechatCallbackPerIp(), limits.window());
            HttpSession session = request.getSession(false);
            if (session == null) throw invalidState();
            issued = states.consume(session, state, Instant.now());
            if (providerError != null || code == null || code.isBlank()) {
                audit.record("callback", "cancelled", null, clientAddress, request);
                return loginRedirect(issued, "cancelled");
            }

            WechatProviderIdentity providerIdentity = client.exchange(code);
            subject = providerIdentity.subject();
            UserAccount linked = findLinkedAccount(providerIdentity);
            if (linked != null) {
                authentication.establishExternalSession(linked, request, response);
                audit.record("callback", "signed_in", subject, clientAddress, request);
                return URI.create(issued.returnTo());
            }

            session.setAttribute(WechatOAuthStateStore.PENDING_ATTRIBUTE,
                    new PendingWechatIdentity(providerIdentity.clientId(), subject,
                            Instant.now().plus(properties.bindingTtl()), issued.locale(), issued.returnTo()));
            audit.record("callback", "binding_required", subject, clientAddress, request);
            return UriComponentsBuilder.fromPath("/" + issued.locale() + "/login")
                    .queryParam("mode", "wechat-bind")
                    .queryParam("returnTo", issued.returnTo())
                    .build().encode().toUri();
        } catch (ApiException exception) {
            audit.record("callback", exception.getCode(), subject, clientAddress, request);
            return issued == null ? defaultFailureRedirect() : loginRedirect(issued, "failed");
        }
    }

    private UserAccount findLinkedAccount(WechatProviderIdentity providerIdentity) {
        return transaction.execute(status -> identities.findDetailed(
                ExternalIdentityProvider.WECHAT, providerIdentity.clientId(), providerIdentity.subject())
                .map(identity -> {
                    UserAccount account = identity.getUserAccount();
                    if (account.getStatus() != UserAccountStatus.ACTIVE || account.getDeletedAt() != null) {
                        throw new ApiException(HttpStatus.FORBIDDEN, "WECHAT_ACCOUNT_UNAVAILABLE",
                                "Account cannot sign in");
                    }
                    identity.markLogin(OffsetDateTime.now());
                    identities.saveAndFlush(identity);
                    return account;
                }).orElse(null));
    }

    private WechatAuthorizationProvider client() {
        if (!properties.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "WECHAT_AUTH_UNAVAILABLE", "WeChat sign-in is unavailable");
        WechatAuthorizationProvider value = provider.getIfAvailable();
        if (value == null) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "WECHAT_AUTH_UNAVAILABLE", "WeChat sign-in is unavailable");
        return value;
    }

    private String issueState(String locale, String returnTo, String clientAddress,
            HttpServletRequest request) {
        limiter.consume("wechat-start-ip", AuthHash.sha256(clientAddress),
                limits.wechatStartPerIp(), limits.window());
        HttpSession session = request.getSession(true);
        return states.issue(session, locale, returnTo, Instant.now());
    }

    private URI loginRedirect(WechatOAuthState issued, String error) {
        return UriComponentsBuilder.fromPath("/" + issued.locale() + "/login")
                .queryParam("wechatError", error)
                .queryParam("returnTo", issued.returnTo())
                .build().encode().toUri();
    }

    private URI defaultFailureRedirect() {
        return URI.create("/zh/login?wechatError=failed");
    }

    private ApiException invalidState() {
        return new ApiException(HttpStatus.BAD_REQUEST, "WECHAT_STATE_INVALID", "WeChat authorization expired");
    }
}
