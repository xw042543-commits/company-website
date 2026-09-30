# 微信登录框架实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不依赖真实微信资质的前提下，建立默认关闭、可安全启用、并复用现有本地账号与 PostgreSQL Session 的微信网站扫码登录框架。

**Architecture:** 后端通过类型安全配置和 `WechatAuthorizationProvider` 隔离微信开放平台，OAuth `state` 及待绑定身份仅保存在服务端 Session。已绑定身份直接建立现有 Spring Security 会话；未绑定身份要求用户先完成现有邮箱或手机号账号流程，再用本地凭证绑定。前端仅在后端报告可用时显示微信入口。

**Tech Stack:** Java 21、Spring Boot 4.1.1、Spring Security、Spring MVC `RestClient`、Spring Data JPA、Spring Session JDBC、PostgreSQL、Flyway、Next.js 16.3.5、React、TypeScript、Node.js 24 LTS。

**Spec:** `docs/superpowers/specs/2026-09-29-wechat-login-framework-design.md`

## Global Constraints

- 生产默认 `APP_AUTH_WECHAT_ENABLED=false`，配置不完整时关闭优先。
- 没有正式资质时不显示微信入口，不生成假二维码，不提供模拟登录。
- AppSecret、Access Token、Refresh Token、授权 `code`、完整 `state`、Cookie 和 Session ID 不得写入日志或 Git。
- 微信首次授权必须绑定并验证邮箱或手机号；不直接依据微信身份创建可用账号。
- PostgreSQL 继续作为账号和绑定关系的唯一真实来源；Redis 不保存账号真实状态。
- 不修改已执行的 V1–V8 迁移，新增 V9。
- 新增行为必须测试先行；每个任务都使用独立的定向测试命令。
- 前端修改前先阅读 `frontend/node_modules/next/dist/docs/` 中对应的 Next.js 16 文档。
- 不读取、修改或提交未跟踪的 `backend/company-website/`。

---

### Task 1: 建立外部身份数据模型

**Files:**
- Create: `backend/src/main/resources/db/migration/V9__create_user_external_identities.sql`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/external/ExternalIdentityProvider.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/external/UserExternalIdentity.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/external/UserExternalIdentityRepository.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/external/ExternalIdentitySchemaIntegrationTest.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/auth/AuthSchemaIntegrationTest.java`

**Interfaces:**
- Produces: `ExternalIdentityProvider.WECHAT`.
- Produces: `UserExternalIdentity.bind(UserAccount account, ExternalIdentityProvider provider, String providerClientId, String providerSubject, OffsetDateTime now)`.
- Produces: `void UserExternalIdentity.markLogin(OffsetDateTime now)`.
- Produces: `Optional<UserExternalIdentity> findDetailed(ExternalIdentityProvider provider, String clientId, String subject)` and `boolean existsByProviderAndUserAccountId(...)`.

- [ ] **Step 1: Write the failing migration and repository tests**

Add tests that assert V9 creates `user_external_identities`, rejects duplicate provider subjects and duplicate `(provider, user_account_id)`, preserves V8 account rows, and loads the linked account in one repository query.

```java
assertThat(columns("user_external_identities"))
        .contains("user_account_id", "provider", "provider_client_id", "provider_subject", "created_at", "last_login_at");
assertThatThrownBy(() -> jdbc.update("""
        INSERT INTO user_external_identities
        (user_account_id, provider, provider_client_id, provider_subject, created_at, last_login_at)
        VALUES (?, 'WECHAT', 'app-a', 'subject-a', now(), now())
        """, secondAccountId)).hasRootCauseInstanceOf(PSQLException.class);
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `cd backend && ./mvnw -Dtest=ExternalIdentitySchemaIntegrationTest,AuthSchemaIntegrationTest test`

Expected: FAIL because V9 and the external identity classes do not exist.

- [ ] **Step 3: Implement the migration, entity, enum, and repository**

Use database constraints named `uk_user_external_identity_subject` and `uk_user_external_identity_account_provider`, a foreign key to `user_accounts(id)`, provider check `provider IN ('WECHAT')`, nonblank checks for client ID and subject, and `ON DELETE RESTRICT`.

```java
@Query("""
       select identity from UserExternalIdentity identity
       join fetch identity.userAccount
       where identity.provider = :provider
         and identity.providerClientId = :clientId
         and identity.providerSubject = :subject
       """)
Optional<UserExternalIdentity> findDetailed(
        ExternalIdentityProvider provider, String clientId, String subject);
```

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `cd backend && ./mvnw -Dtest=ExternalIdentitySchemaIntegrationTest,AuthSchemaIntegrationTest test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V9__create_user_external_identities.sql backend/src/main/java/com/yangdoujiao/website/auth/external backend/src/test/java/com/yangdoujiao/website/auth/external backend/src/test/java/com/yangdoujiao/website/auth/AuthSchemaIntegrationTest.java
git commit -m "feat: 新增微信外部身份数据模型"
```

### Task 2: 建立默认关闭的微信配置和可用性接口

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatAuthProperties.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/AuthProviderAvailabilityResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/AuthProviderController.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatAuthPropertiesTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/AuthProviderControllerTest.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/test/resources/application-test.yml`

**Interfaces:**
- Produces: `WechatAuthProperties(boolean enabled, String appId, String appSecret, URI callbackUrl, Duration stateTtl, Duration bindingTtl)`.
- Produces: `GET /api/v1/auth/providers` with exact JSON `{"wechat":false}` or `{"wechat":true}`.

- [ ] **Step 1: Write failing configuration and HTTP tests**

Cover default disabled, disabled-with-blank-values accepted, enabled-with-any-blank-value rejected, non-HTTPS production callback rejected, state TTL outside 1–15 minutes rejected, binding TTL outside 5–30 minutes rejected, and exact provider response.

```java
assertThat(client.get().uri("/api/v1/auth/providers").exchange().getResponseBody())
        .isEqualTo("{\"wechat\":false}");
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `cd backend && ./mvnw -Dtest=WechatAuthPropertiesTest,AuthProviderControllerTest test`

Expected: FAIL because the properties and endpoint do not exist.

- [ ] **Step 3: Implement minimal properties and controller**

Bind `app.auth.wechat` and expose only the boolean availability. Use `@PostConstruct` validation and do not expose configuration values in the DTO.

```yaml
app:
  auth:
    wechat:
      enabled: ${APP_AUTH_WECHAT_ENABLED:false}
      app-id: ${APP_AUTH_WECHAT_APP_ID:}
      app-secret: ${APP_AUTH_WECHAT_APP_SECRET:}
      callback-url: ${APP_AUTH_WECHAT_CALLBACK_URL:}
      state-ttl: ${APP_AUTH_WECHAT_STATE_TTL:5m}
      binding-ttl: ${APP_AUTH_WECHAT_BINDING_TTL:15m}
```

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `cd backend && ./mvnw -Dtest=WechatAuthPropertiesTest,AuthProviderControllerTest test`

Expected: PASS and the disabled response contains no secrets.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/wechat backend/src/main/resources/application.yml backend/src/test/resources/application-test.yml backend/src/test/java/com/yangdoujiao/website/auth/wechat
git commit -m "feat: 新增微信登录配置开关"
```

### Task 3: 实现一次性 OAuth state 和安全回跳

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOAuthState.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOAuthStateStore.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatReturnTarget.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatOAuthStateStoreTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatReturnTargetTest.java`

**Interfaces:**
- Produces: `String WechatOAuthStateStore.issue(HttpSession session, String locale, String returnTo, Instant now)`.
- Produces: `WechatOAuthState WechatOAuthStateStore.consume(HttpSession session, String suppliedState, Instant now)`.
- Produces: `WechatReturnTarget.normalize(String locale, String returnTo)` returning a localized site path.

- [ ] **Step 1: Write failing state and redirect tests**

Assert state is random and URL-safe, bound to one Session, consumed once, rejected after TTL, compared without a plain early-exit equality check, and does not place provider subject or token data in the browser. Reject `https://evil.example`、`//evil.example`、backslashes、control characters and wrong locales; accept `/zh/account` and `/en/universities?q=law`.

```java
String state = store.issue(session, "zh", "/zh/account", now);
assertThat(store.consume(session, state, now.plusSeconds(30)).returnTo()).isEqualTo("/zh/account");
assertThatThrownBy(() -> store.consume(session, state, now.plusSeconds(31)))
        .isInstanceOf(ApiException.class);
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `cd backend && ./mvnw -Dtest=WechatOAuthStateStoreTest,WechatReturnTargetTest test`

Expected: FAIL because the state store and return-target validator do not exist.

- [ ] **Step 3: Implement Session-only state storage**

Use `SecureRandom`, 32 random bytes, Base64 URL encoding without padding, `MessageDigest.isEqual`, one Session attribute containing a serializable record, and removal before returning a consumed value. Return `/zh/account` or `/en/account` when the requested target is invalid.

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `cd backend && ./mvnw -Dtest=WechatOAuthStateStoreTest,WechatReturnTargetTest test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOAuthState.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOAuthStateStore.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatReturnTarget.java backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatOAuthStateStoreTest.java backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatReturnTargetTest.java
git commit -m "feat: 保护微信授权状态与回跳地址"
```

### Task 4: 实现可替换的微信开放平台 Provider

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatAuthorizationProvider.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatProviderIdentity.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOpenPlatformClient.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatProviderConfig.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatOpenPlatformClientTest.java`

**Interfaces:**
- Produces: `URI authorizationUri(String state)`.
- Produces: `WechatProviderIdentity exchange(String authorizationCode)` where the record contains only `clientId` and `subject`.
- Produces: `String clientId()`.

- [ ] **Step 1: Write failing provider contract tests**

Verify the authorization URI uses the official `snsapi_login` scope and percent-encodes callback/state, token exchange uses the provider-required HTTPS GET without logging its credential-bearing query, successful response maps `openid` to `subject`, and `errcode`, blank `openid`, timeout, malformed JSON and non-2xx responses become a generic `WECHAT_AUTH_UNAVAILABLE` or `WECHAT_AUTH_REJECTED` error.

```java
URI uri = client.authorizationUri("state-value");
assertThat(uri.getHost()).isEqualTo("open.weixin.qq.com");
assertThat(uri.getRawQuery()).contains("scope=snsapi_login", "state=state-value");
```

- [ ] **Step 2: Run the provider test and verify RED**

Run: `cd backend && ./mvnw -Dtest=WechatOpenPlatformClientTest test`

Expected: FAIL because the provider contract and client do not exist.

- [ ] **Step 3: Implement the provider with injected `RestClient.Builder`**

Build URIs with Spring `UriComponentsBuilder`; deserialize only the fields needed for login; never include raw upstream response bodies in exceptions. Register the real client only when `app.auth.wechat.enabled=true`, and expose no fallback provider in normal dev or production profiles.

```java
public interface WechatAuthorizationProvider {
    URI authorizationUri(String state);
    WechatProviderIdentity exchange(String authorizationCode);
    String clientId();
}
```

- [ ] **Step 4: Run the provider test and verify GREEN**

Run: `cd backend && ./mvnw -Dtest=WechatOpenPlatformClientTest test`

Expected: PASS with no secret values in captured log output or exception messages.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatAuthorizationProvider.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatProviderIdentity.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOpenPlatformClient.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatProviderConfig.java backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatOpenPlatformClientTest.java
git commit -m "feat: 封装微信开放平台授权客户端"
```

### Task 5: 实现授权发起、回调和已绑定登录

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/PendingWechatIdentity.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatAuthAuditLogger.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatLoginHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatAuthAuditLoggerTest.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/session/AuthenticationService.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/config/AuthRateLimitProperties.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/test/resources/application-test.yml`
- Modify: `backend/src/test/java/com/yangdoujiao/website/auth/api/LoginHttpIntegrationTest.java`

**Interfaces:**
- Produces: `GET /api/v1/auth/wechat/start?locale=zh&returnTo=/zh/account`.
- Produces: `GET /api/v1/auth/wechat/callback?code=...&state=...`.
- Produces: `UserPrincipal AuthenticationService.establishExternalSession(UserAccount account, HttpServletRequest request, HttpServletResponse response)`.

- [ ] **Step 1: Write failing HTTP and session tests**

Cover disabled start as 503, enabled start as 302 to the provider, invalid/replayed/expired state, user cancellation, existing active identity login, `last_login_at` update, disabled/deleted account rejection, Session ID rotation, IP rate limits, rejected unexpected HTTP methods, and internal-only redirects. Add a log-capture test proving audit output contains an outcome, `traceId` and hashed subject/address only, never code, state, token, Cookie or Session ID. Use `@TestConfiguration` to inject a deterministic fake `WechatAuthorizationProvider`; do not create a fake provider in production source.

```java
mockMvc.perform(get("/api/v1/auth/wechat/callback")
        .session(session).param("code", "approved-code").param("state", issuedState))
        .andExpect(status().isFound())
        .andExpect(redirectedUrl("/zh/account"));
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `cd backend && ./mvnw -Dtest=WechatLoginHttpIntegrationTest,WechatAuthAuditLoggerTest,LoginHttpIntegrationTest test`

Expected: FAIL because the start/callback endpoints and external session method do not exist.

- [ ] **Step 3: Implement start, callback, and external session establishment**

Keep provider network work outside database transactions. On callback, consume state before exchange; load the identity and account and update `last_login_at` in a short transaction; when linked and active, create a `UserPrincipal`, save the existing SecurityContext, rotate Session ID, and use the normal session timeout. When unlinked, store a serializable `PendingWechatIdentity(clientId, subject, expiresAt, locale, returnTo)` using `bindingTtl` in the Session and redirect to `/{locale}/login?mode=wechat-bind`. Consume the existing Redis-backed rate limiter for start/callback IP buckets and emit only sanitized audit events.

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `cd backend && ./mvnw -Dtest=WechatLoginHttpIntegrationTest,WechatAuthAuditLoggerTest,LoginHttpIntegrationTest test`

Expected: PASS and existing password login assertions remain unchanged.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginController.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginService.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/PendingWechatIdentity.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatAuthAuditLogger.java backend/src/main/java/com/yangdoujiao/website/auth/session/AuthenticationService.java backend/src/main/java/com/yangdoujiao/website/auth/config/AuthRateLimitProperties.java backend/src/main/resources/application.yml backend/src/test/resources/application-test.yml backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatLoginHttpIntegrationTest.java backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatAuthAuditLoggerTest.java backend/src/test/java/com/yangdoujiao/website/auth/api/LoginHttpIntegrationTest.java
git commit -m "feat: 实现微信授权回调与会话"
```

### Task 6: 实现微信身份与本地账号绑定

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/BindWechatAccountRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatBindingService.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatBindingHttpIntegrationTest.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginController.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/session/AuthenticationService.java`

**Interfaces:**
- Produces: `POST /api/v1/auth/wechat/bind` with `{ "identifier": "...", "password": "...", "rememberMe": false }`.
- Produces: `UserPrincipal AuthenticationService.verifyCredentials(String identifier, String password, String clientAddress)` without creating a Session.
- Consumes: `PendingWechatIdentity` from Task 5 and `UserExternalIdentityRepository` from Task 1.

- [ ] **Step 1: Write failing binding tests**

Cover missing/expired pending identity, wrong password, pending or disabled account, active email account, active phone account, duplicate WeChat identity, account already bound, concurrent unique conflict, successful Session rotation, and removal of pending state after success. Also assert a newly registered account can bind only after its existing verification flow changes it to `ACTIVE`.

```java
mockMvc.perform(post("/api/v1/auth/wechat/bind")
        .session(session).with(csrf()).contentType(APPLICATION_JSON)
        .content("""{"identifier":"member@example.com","password":"correct password","rememberMe":false}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(true));
```

- [ ] **Step 2: Run the binding test and verify RED**

Run: `cd backend && ./mvnw -Dtest=WechatBindingHttpIntegrationTest test`

Expected: FAIL because the binding endpoint and service do not exist.

- [ ] **Step 3: Implement credential verification, atomic binding, and login**

Authenticate credentials without saving SecurityContext, then in a short transaction lock the account, recheck `ACTIVE` and uniqueness, insert the external identity, and map only the named V9 unique constraints to a generic `WECHAT_IDENTITY_CONFLICT`. Establish the Session only after the transaction commits. Reuse existing login rate-limit buckets and never reveal which account owns a conflicting identity.

- [ ] **Step 4: Run the binding and registration regression tests**

Run: `cd backend && ./mvnw -Dtest=WechatBindingHttpIntegrationTest,RegistrationHttpIntegrationTest,VerificationConcurrencyIntegrationTest test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/wechat/BindWechatAccountRequest.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatBindingService.java backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatLoginController.java backend/src/main/java/com/yangdoujiao/website/auth/session/AuthenticationService.java backend/src/test/java/com/yangdoujiao/website/auth/wechat/WechatBindingHttpIntegrationTest.java
git commit -m "feat: 支持微信身份绑定现有账号"
```

### Task 7: 接入前端微信入口和绑定流程

**Files:**
- Create: `frontend/src/components/wechat-login-entry.tsx`
- Create: `frontend/src/components/wechat-bind-form.tsx`
- Modify: `frontend/src/lib/auth-api.ts`
- Modify: `frontend/src/lib/auth-api.test.ts`
- Modify: `frontend/src/components/auth-account-panel.tsx`
- Modify: `frontend/src/components/login-form.tsx`
- Modify: `frontend/src/app/[locale]/login/page.tsx`
- Modify: `frontend/src/lib/login-auth-ui.test.ts`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Produces: `getAuthProviders(baseUrl, fetch)` returning `{ status: "ready", wechat: boolean } | FailureResult`.
- Produces: `bindWechatAccount(baseUrl, body, fetch)` returning the existing `LoginResult` shape.
- Consumes: `GET /api/v1/auth/providers`, `/api/v1/auth/wechat/start`, and `POST /api/v1/auth/wechat/bind`.

- [ ] **Step 1: Read the applicable Next.js 16 documentation and write failing frontend tests**

Read: `frontend/node_modules/next/dist/docs/01-app/01-getting-started/07-fetching-data.md` and the relevant navigation documentation found under `frontend/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/`.

Test strict provider-response parsing, credentials and no-store behavior, disabled entry hidden, enabled entry linked to the backend start route with safe locale/return target, `mode=wechat-bind` rendering, existing-account binding, guidance for new users to register/verify first, bilingual cancellation/error messages, and absence of demo QR/session code.

```ts
assert.deepEqual(await getAuthProviders("http://localhost:8080", fakeFetch), {
  status: "ready", wechat: true,
});
assert.doesNotMatch(source, /demo|fake qr|startDemoSession/i);
```

- [ ] **Step 2: Run frontend auth tests and verify RED**

Run: `npm --prefix frontend run test:auth`

Run: `cd frontend && node --test src/lib/login-auth-ui.test.ts`

Expected: FAIL because provider parsing, the entry component, and binding form do not exist.

- [ ] **Step 3: Implement the minimal frontend flow**

Keep provider discovery in the client because availability depends on deployment configuration. Render a normal navigation link instead of fetching authorization URLs into JavaScript. The binding form posts credentials through the existing CSRF-aware `authWrite`; after success push the safe `returnTo` and refresh. When unavailable or malformed, keep password/phone login fully usable and omit the WeChat control.

- [ ] **Step 4: Run frontend auth, lint, and build checks**

Run: `npm --prefix frontend run test:auth`

Run: `cd frontend && node --test src/lib/login-auth-ui.test.ts`

Run: `npm --prefix frontend run lint`

Run: `npm --prefix frontend run build`

Expected: all PASS; login page still builds as a dynamic localized route.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wechat-login-entry.tsx frontend/src/components/wechat-bind-form.tsx frontend/src/lib/auth-api.ts frontend/src/lib/auth-api.test.ts frontend/src/components/auth-account-panel.tsx frontend/src/components/login-form.tsx 'frontend/src/app/[locale]/login/page.tsx' frontend/src/lib/login-auth-ui.test.ts frontend/src/app/globals.css
git commit -m "feat: 接入微信登录与账号绑定界面"
```

### Task 8: 收紧生产配置、预检和中文文档

**Files:**
- Modify: `backend/src/main/resources/application-prod.yml`
- Modify: `deploy/.env.production.example`
- Modify: `scripts/deployment-preflight.mjs`
- Modify: `scripts/deployment-preflight.test.mjs`
- Modify: `docs/API.md`
- Modify: `docs/DEPLOYMENT.md`
- Modify: `docs/PUBLIC_LAUNCH_CHECKLIST.md`
- Create: `docs/WECHAT_LOGIN.md`
- Modify: `backend/src/test/java/com/yangdoujiao/website/config/ProductionConfigurationTest.java`

**Interfaces:**
- Consumes: the four required deployment variables plus `APP_AUTH_WECHAT_STATE_TTL` and `APP_AUTH_WECHAT_BINDING_TTL` from Tasks 2–4.
- Produces: deployment preflight that accepts disabled/blank WeChat configuration and rejects enabled/incomplete or unsafe configuration.

- [ ] **Step 1: Write failing production and preflight tests**

Add cases for disabled-with-empty credentials, enabled missing one credential, enabled placeholder secret, non-HTTPS callback, callback host outside the approved public origin, and complete safe configuration. Assert documentation never contains a real secret and keeps WeChat unchecked in the public launch checklist until official browser acceptance.

```js
assert.match(runPreflight({ APP_AUTH_WECHAT_ENABLED: "true" }).stderr,
  /APP_AUTH_WECHAT_APP_ID is required/);
```

- [ ] **Step 2: Run targeted configuration tests and verify RED**

Run: `node --test scripts/deployment-preflight.test.mjs`

Run: `cd backend && ./mvnw -Dtest=ProductionConfigurationTest test`

Expected: FAIL because WeChat production validation and documentation are absent.

- [ ] **Step 3: Implement configuration validation and documentation**

Document the official application type, company-owned credential handling, callback `https://yangdoujiao.com/api/v1/auth/wechat/callback`, enablement gate, local test behavior, account binding rules, rollback switch, troubleshooting without sensitive logs, and the fact that code completion is not real-provider acceptance.

- [ ] **Step 4: Run the complete verification commands**

Run: `node --test scripts/deployment-preflight.test.mjs`

Run: `cd backend && ./mvnw test`

Run: `npm --prefix frontend run test:auth`

Run: `npm --prefix frontend run lint`

Run: `npm --prefix frontend run build`

Run: `git diff --check`

Expected: all PASS. The provider availability endpoint returns `wechat=false` under default configuration, and no test requires external WeChat access.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/application-prod.yml deploy/.env.production.example scripts/deployment-preflight.mjs scripts/deployment-preflight.test.mjs docs/API.md docs/DEPLOYMENT.md docs/PUBLIC_LAUNCH_CHECKLIST.md docs/WECHAT_LOGIN.md backend/src/test/java/com/yangdoujiao/website/config/ProductionConfigurationTest.java
git commit -m "docs: 完善微信登录上线门槛"
```

## 最终审核

- [ ] 对照设计文档审查全部 8 个任务，确认没有恢复旧的假二维码或演示 Session。
- [ ] 搜索 `APP_AUTH_WECHAT_APP_SECRET`，确认只存在配置键和安全占位说明，不存在真实值。
- [ ] 审查日志和异常，确认不包含上游原始响应、授权 `code`、完整 `state` 或微信 Token。
- [ ] 在默认配置下启动前后端，确认邮箱/手机号登录正常且页面不显示微信入口。
- [ ] 获得正式资质后，另行执行 HTTPS 真实授权的人工验收，未验收前不勾选公开上线清单中的微信项。
