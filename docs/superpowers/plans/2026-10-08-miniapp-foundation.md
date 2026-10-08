# UDAJO Mini Program Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver A's native WeChat Mini Program foundation with four production-shaped tabs, secure mini-program authentication, a shared request layer, and one real university-search path.

**Architecture:** Add a native TypeScript mini program under `miniapp/` and extend the existing Spring Boot modular monolith with a separate mini-program identity exchange and opaque bearer-token boundary. PostgreSQL remains the source of truth; public university APIs are reused. U圈 is a real core tab but this plan only creates its authenticated shell and service boundary—the 2,000+ student community feed, moderation, and interaction model require a separate specification.

**Tech Stack:** WeChat Mini Program WXML/WXSS/TypeScript, Node test runner through `tsx`, ESLint, Spring Boot 4 / Java 21, Spring Security, JPA, Flyway, PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-10-08-miniapp-foundation-design.md`

## Global Constraints

- Bottom tabs are exactly `首页`, `院校`, `U圈`, `我的`; planning is reached from the home feature entry.
- Brand tokens remain `#3f8875`, `#286858`, `#153f36`, `#fdfcf8`, `#eef5f1`, `#18302b`, `#536a63`, `#c8d9d2`, and `#9f2f2f`.
- Use native WXML/WXSS/TypeScript; do not add Taro, uni-app, or a large component library.
- Touch targets are at least `88rpx × 88rpx`; body copy is at least `28rpx`; auxiliary copy is at least `24rpx`.
- No sample university, order, points, account, or community content may be hard-coded as if it were real.
- Production API origin is `https://yangdoujiao.com`; the client accepts only configured HTTPS origins outside local development.
- Access tokens default to 15 minutes; refresh tokens default to 30 days and rotate on every successful refresh.
- AppSecret, `session_key`, raw provider errors, opaque tokens, and real test identities never enter Git or logs.
- The local identity provider is non-production only, explicitly enabled, fixed to configured test subjects, and production fails closed if it is enabled.
- Every implementation task follows red-green-refactor and ends with an independently reviewable commit.

---

### Task 1: Native Mini Program Shell and Design System

**Files:**
- Modify: `.gitignore`
- Create: `miniapp/package.json`
- Create: `miniapp/tsconfig.json`
- Create: `miniapp/eslint.config.mjs`
- Create: `miniapp/project.config.json`
- Create: `miniapp/miniprogram/app.ts`
- Create: `miniapp/miniprogram/app.json`
- Create: `miniapp/miniprogram/app.wxss`
- Create: `miniapp/miniprogram/sitemap.json`
- Create: `miniapp/miniprogram/styles/tokens.wxss`
- Create: `miniapp/miniprogram/styles/utilities.wxss`
- Create: `miniapp/miniprogram/pages/home/index.{ts,json,wxml,wxss}`
- Create: `miniapp/miniprogram/pages/universities/index.{ts,json,wxml,wxss}`
- Create: `miniapp/miniprogram/pages/circle/index.{ts,json,wxml,wxss}`
- Create: `miniapp/miniprogram/pages/account/index.{ts,json,wxml,wxss}`
- Create: `miniapp/tests/app-config.test.ts`

**Interfaces:**
- Produces: four tab routes `pages/home/index`, `pages/universities/index`, `pages/circle/index`, and `pages/account/index`.
- Produces: CSS custom properties `--color-brand`, `--color-action`, `--color-deep`, `--color-paper`, `--color-wash`, `--color-ink`, `--color-muted`, `--color-line`, `--color-danger`.
- Produces: `AppOptions.globalData.sessionStatus` with union type `'unknown' | 'anonymous' | 'authenticated'`.

- [ ] **Step 1: Write the failing application configuration test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('registers the approved four tabs in order', () => {
  const app = JSON.parse(readFileSync('miniprogram/app.json', 'utf8'));
  assert.deepEqual(app.tabBar.list.map((item: { pagePath: string; text: string }) =>
    [item.pagePath, item.text]), [
      ['pages/home/index', '首页'],
      ['pages/universities/index', '院校'],
      ['pages/circle/index', 'U圈'],
      ['pages/account/index', '我的'],
    ]);
});

test('does not register planning as a bottom tab', () => {
  const app = JSON.parse(readFileSync('miniprogram/app.json', 'utf8'));
  assert.equal(app.tabBar.list.some((item: { text: string }) => item.text === '规划'), false);
});
```

- [ ] **Step 2: Run the test and verify the missing app configuration fails**

Run: `cd miniapp && npm test -- --test-name-pattern='approved four tabs|planning'`

Expected: FAIL because `miniprogram/app.json` does not exist.

- [ ] **Step 3: Add the package, compiler, lint, ignore, and project configuration**

Use scripts:

```json
{
  "type": "module",
  "scripts": {
    "test": "tsx --test tests/**/*.test.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "check": "npm run test && npm run typecheck && npm run lint"
  }
}
```

Use only these development dependencies: `@types/node`, `eslint`, `miniprogram-api-typings`, `tsx`, `typescript`, and `typescript-eslint`. Add `miniapp/node_modules/`, `miniapp/.test-dist/`, and `miniapp/project.private.config.json` to `.gitignore`. Set `miniprogramRoot` to `miniprogram/` in `project.config.json`; do not place a real AppID in the committed file.

- [ ] **Step 4: Implement app registration, brand tokens, and four responsive shells**

`app.json` must register the four pages in the tested order, use a white tab background, `#536a63` inactive text, `#286858` selected text, and no custom tab implementation. Each shell must use a safe-area bottom padding and an `88rpx` minimum action height. U圈 copy must read `U圈正在建设` and `社区内容上线前将完成内容审核、举报和隐私保护能力。`, with no sample posts.

- [ ] **Step 5: Run shell checks**

Run: `cd miniapp && npm install && npm run check`

Expected: all tests pass, TypeScript exits 0, ESLint exits 0.

- [ ] **Step 6: Commit the shell**

```bash
git add .gitignore miniapp
git commit -m "feat: add native miniapp shell"
```

---

### Task 2: Typed Runtime Configuration and Request Layer

**Files:**
- Create: `miniapp/miniprogram/config/runtime.ts`
- Create: `miniapp/miniprogram/utils/result.ts`
- Create: `miniapp/miniprogram/services/http.ts`
- Create: `miniapp/tests/runtime.test.ts`
- Create: `miniapp/tests/http.test.ts`

**Interfaces:**
- Produces: `type AppErrorKind = 'validation' | 'unauthorized' | 'forbidden' | 'rate-limited' | 'unavailable' | 'unexpected'`.
- Produces: `type Result<T> = { ok: true; value: T } | { ok: false; error: AppError }`.
- Produces: `resolveRuntimeConfig(env: 'local' | 'preview' | 'production'): RuntimeConfig`.
- Produces: `request<T>(options: RequestOptions): Promise<Result<T>>` and `setAccessTokenReader(reader: () => string | null): void`.

- [ ] **Step 1: Write failing runtime tests**

Cover these exact cases: production returns `https://yangdoujiao.com`; `http://` production origin throws `Unsafe API origin`; path traversal in `RequestOptions.path` throws; 401 maps to `unauthorized`; 429 maps to `rate-limited`; 500 maps to `unavailable`; network failure maps to `unavailable`; a successful response returns `{ ok: true, value }`.

- [ ] **Step 2: Run the runtime tests and verify failure**

Run: `cd miniapp && npm test -- --test-name-pattern='runtime|request'`

Expected: FAIL because `runtime.ts`, `result.ts`, and `http.ts` do not exist.

- [ ] **Step 3: Implement strict configuration and error mapping**

Use this public shape:

```ts
export interface RuntimeConfig {
  readonly apiOrigin: string;
  readonly requestTimeoutMs: 8000;
  readonly environment: 'local' | 'preview' | 'production';
}

export interface RequestOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly path: `/api/${string}`;
  readonly data?: unknown;
  readonly idempotencyKey?: string;
  readonly authenticated?: boolean;
}
```

`request` must call `wx.request`, set JSON headers, add `Authorization: Bearer` only for authenticated requests, add `Idempotency-Key` only when supplied, and never return a raw backend exception message to a page.

- [ ] **Step 4: Run request-layer checks**

Run: `cd miniapp && npm run check`

Expected: PASS.

- [ ] **Step 5: Commit the request layer**

```bash
git add miniapp/miniprogram/config miniapp/miniprogram/utils miniapp/miniprogram/services miniapp/tests
git commit -m "feat: add typed miniapp request layer"
```

---

### Task 3: Mini Program Identity and Token Schema

**Files:**
- Create: `backend/src/main/resources/db/migration/V13__add_miniapp_authentication.sql`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/external/ExternalIdentityProvider.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthToken.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthTokenKind.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthTokenRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthProperties.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthSchemaIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthPropertiesTest.java`

**Interfaces:**
- Produces: provider enum value `WECHAT_MINI_PROGRAM` without changing website provider `WECHAT`.
- Produces: `MiniappAuthTokenRepository.findActiveByHash(String tokenHash, MiniappAuthTokenKind kind, OffsetDateTime now)`.
- Produces: configuration prefix `app.miniapp.auth` with `enabled`, `wechatAppId`, `wechatAppSecret`, `accessTokenTtl`, `refreshTokenTtl`, `localProviderEnabled`, and `localTestSubject`.

- [ ] **Step 1: Write failing schema and configuration tests**

The schema test must assert the `miniapp_auth_tokens` columns `user_account_id`, `token_hash`, `token_kind`, `family_id`, `expires_at`, `revoked_at`, `replaced_by_hash`, `created_at`; unique `token_hash`; foreign key to `user_accounts`; token kind check for `ACCESS` and `REFRESH`; and the external identity provider check accepts both `WECHAT` and `WECHAT_MINI_PROGRAM`.

The properties test must assert that access TTL outside 5–60 minutes fails, refresh TTL outside 1–90 days fails, an enabled official provider requires AppID and AppSecret, and `localProviderEnabled=true` with production profile is rejected by the production guard added in Task 4.

- [ ] **Step 2: Run the focused backend tests and verify failure**

Run: `cd backend && ./mvnw -q -Dtest=MiniappAuthSchemaIntegrationTest,MiniappAuthPropertiesTest test`

Expected: FAIL because the migration and types do not exist.

- [ ] **Step 3: Implement migration and persistence types**

The migration must drop and recreate `ck_user_external_identities_provider` with `provider IN ('WECHAT', 'WECHAT_MINI_PROGRAM')`; it must not rename existing website identities. Store only SHA-256 hashes in `token_hash` and `replaced_by_hash`. Index `(token_hash, token_kind)` and `(user_account_id, family_id)`.

- [ ] **Step 4: Implement validated properties**

Use defaults through `application.yml`: disabled auth, 15-minute access TTL, 30-day refresh TTL, disabled local provider. Validation must fail before serving traffic when enabled credentials are incomplete.

- [ ] **Step 5: Run the focused and compatibility tests**

Run: `cd backend && ./mvnw -q -Dtest=MiniappAuthSchemaIntegrationTest,MiniappAuthPropertiesTest,ExternalIdentitySchemaIntegrationTest,V3MigrationCompatibilityTest test`

Expected: PASS.

- [ ] **Step 6: Commit the schema**

```bash
git add backend/src/main/resources backend/src/main/java/com/yangdoujiao/website/auth backend/src/test/java/com/yangdoujiao/website/auth
git commit -m "feat: add miniapp authentication schema"
```

---

### Task 4: WeChat Code Exchange and Fail-Closed Local Provider

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappIdentityProvider.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappProviderIdentity.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/WechatMiniappClient.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/LocalMiniappIdentityProvider.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappProviderConfig.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/ProductionMiniappGuard.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/WechatMiniappClientTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/LocalMiniappIdentityProviderTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/ProductionMiniappGuardTest.java`

**Interfaces:**
- Produces: `MiniappProviderIdentity exchange(String code)` returning only `clientId`, `subject`, and optional `unionId`.
- Consumes: `MiniappAuthProperties` from Task 3.

- [ ] **Step 1: Write failing provider tests**

Tests must prove: blank code is validation failure; official response requires nonblank `openid`; `errcode` is mapped to stable `MINIAPP_AUTH_REJECTED` or `MINIAPP_AUTH_UNAVAILABLE`; `session_key` is discarded; local provider accepts only the configured fixed code and subject; production guard rejects any enabled local provider.

- [ ] **Step 2: Run provider tests and verify failure**

Run: `cd backend && ./mvnw -q -Dtest=WechatMiniappClientTest,LocalMiniappIdentityProviderTest,ProductionMiniappGuardTest test`

Expected: FAIL because provider classes do not exist.

- [ ] **Step 3: Implement official exchange**

Call `https://api.weixin.qq.com/sns/jscode2session` with `appid`, `secret`, `js_code`, and `grant_type=authorization_code`. Parse only typed fields, cap response size through the existing HTTP client conventions, never log request query parameters or response payload, and return the configured AppID as `clientId`.

- [ ] **Step 4: Implement local provider and production guard**

The local provider bean exists only for a non-prod profile and explicit enablement. It compares the supplied code in constant time with the configured development code and returns only the configured test subject. The production guard throws `IllegalStateException("Local miniapp identity provider must be disabled in production")` when misconfigured.

- [ ] **Step 5: Run provider tests**

Run: `cd backend && ./mvnw -q -Dtest=WechatMiniappClientTest,LocalMiniappIdentityProviderTest,ProductionMiniappGuardTest test`

Expected: PASS.

- [ ] **Step 6: Commit provider integration**

```bash
git add backend/src/main/java/com/yangdoujiao/website/auth/miniapp backend/src/test/java/com/yangdoujiao/website/auth/miniapp
git commit -m "feat: exchange miniapp login codes safely"
```

---

### Task 5: Rotating Bearer Sessions and Mini Program Auth API

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappTokenService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappLoginService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappBearerFilter.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAccountController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappLoginRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappRefreshRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappLogoutRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappSessionResponse.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/resources/application-prod.yml`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/MiniappTokenServiceTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthHttpIntegrationTest.java`

**Interfaces:**
- Produces: `POST /api/v1/miniapp/auth/login`, `POST /api/v1/miniapp/auth/refresh`, `POST /api/v1/miniapp/auth/logout`, `GET /api/v1/miniapp/account`.
- Produces response: `{ accessToken, accessExpiresAt, refreshToken, refreshExpiresAt, account: { id, displayName, avatarUrl, bindingStatus } }`.
- Produces: authenticated `UserPrincipal` for `/api/v1/miniapp/account` and future protected miniapp routes.

- [ ] **Step 1: Write failing token unit tests**

Tests must assert 32-byte URL-safe random raw tokens, SHA-256-only persistence, 15-minute/30-day expiries from an injected `Clock`, access lookup rejection after expiry or revocation, refresh rotation setting `revoked_at` and `replaced_by_hash`, and repeated use of a rotated refresh token revoking the whole family.

- [ ] **Step 2: Write failing HTTP integration tests**

Test first login creates one active external-only account and one `WECHAT_MINI_PROGRAM` identity; repeated login reuses them; account endpoint rejects missing/invalid/expired bearer tokens; refresh returns new access and refresh values; old refresh is rejected; logout revokes the family; disabled miniapp auth returns `MINIAPP_AUTH_UNAVAILABLE`; no response or captured log contains `session_key`, AppSecret, or provider subject.

- [ ] **Step 3: Run auth tests and verify failure**

Run: `cd backend && ./mvnw -q -Dtest=MiniappTokenServiceTest,MiniappAuthHttpIntegrationTest test`

Expected: FAIL because auth services and routes do not exist.

- [ ] **Step 4: Implement token and login services**

Use `SecureRandom`, Base64 URL encoding without padding, `AuthHash.sha256`, injected `Clock`, and a transaction for account/identity/token creation. Reuse `UserAccount.external(...)`, `AuthProperties.agreementVersion()`, and `AuthProperties.privacyVersion()`. Catch the identity uniqueness race, then reload the winning identity exactly as the existing website WeChat login does.

- [ ] **Step 5: Implement filter, controller, and Spring Security boundary**

Ignore CSRF only for `/api/v1/miniapp/**`, because these endpoints do not authenticate with cookies. Permit login and refresh; require `ROLE_USER` for logout and account. The bearer filter only accepts `Authorization: Bearer <opaque token>`, sets `UserPrincipal.from(account)`, and leaves browser-session authentication unchanged.

- [ ] **Step 6: Run auth, website-auth regression, and configuration tests**

Run: `cd backend && ./mvnw -q -Dtest=MiniappTokenServiceTest,MiniappAuthHttpIntegrationTest,WechatLoginHttpIntegrationTest,AccountHttpIntegrationTest,ProductionConfigurationTest test`

Expected: PASS.

- [ ] **Step 7: Commit auth API**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: add rotating miniapp bearer sessions"
```

---

### Task 6: Mini Program Session Store and Automatic Refresh

**Files:**
- Create: `miniapp/miniprogram/services/auth.ts`
- Create: `miniapp/miniprogram/stores/session.ts`
- Modify: `miniapp/miniprogram/services/http.ts`
- Modify: `miniapp/miniprogram/app.ts`
- Modify: `miniapp/miniprogram/pages/account/index.{ts,wxml,wxss}`
- Modify: `miniapp/miniprogram/pages/circle/index.{ts,wxml}`
- Create: `miniapp/tests/session.test.ts`

**Interfaces:**
- Produces: `login(): Promise<Result<AccountSummary>>`, `refresh(): Promise<Result<AccountSummary>>`, `logout(): Promise<void>`.
- Produces: `sessionStore.getSnapshot()`, `sessionStore.subscribe(listener)`, `sessionStore.ensureAuthenticated()`.
- Consumes: request layer from Task 2 and backend routes from Task 5.

- [ ] **Step 1: Write failing session tests**

Tests must cover `wx.login` code exchange, access token kept in memory, refresh token stored under `udajo.miniapp.refresh-token.v1`, one shared refresh for concurrent 401 responses, a single retry after successful refresh, token clearing after failed refresh, and logout clearing memory/storage even when the network call fails.

- [ ] **Step 2: Run the session tests and verify failure**

Run: `cd miniapp && npm test -- --test-name-pattern='session|refresh|logout'`

Expected: FAIL because session modules do not exist.

- [ ] **Step 3: Implement auth and session state**

Do not store access tokens or account profiles in persistent storage. Validate response shape before accepting tokens. On startup, use the refresh token when present; otherwise remain anonymous until a protected action calls `ensureAuthenticated()`.

- [ ] **Step 4: Bind account and U圈 shells to real session state**

Account shows the default brand avatar and `微信用户` until the API returns an approved profile. U圈 asks for login through `ensureAuthenticated()` and then displays only the construction notice; it must not render fake posts or user counts.

- [ ] **Step 5: Run client checks**

Run: `cd miniapp && npm run check`

Expected: PASS.

- [ ] **Step 6: Commit client auth**

```bash
git add miniapp/miniprogram miniapp/tests
git commit -m "feat: connect miniapp session lifecycle"
```

---

### Task 7: Real University Search Path and Honest UI States

**Files:**
- Create: `miniapp/miniprogram/services/universities.ts`
- Create: `miniapp/miniprogram/components/app-state/index.{ts,json,wxml,wxss}`
- Create: `miniapp/miniprogram/components/university-card/index.{ts,json,wxml,wxss}`
- Modify: `miniapp/miniprogram/pages/home/index.{ts,json,wxml,wxss}`
- Modify: `miniapp/miniprogram/pages/universities/index.{ts,json,wxml,wxss}`
- Create: `miniapp/tests/universities.test.ts`

**Interfaces:**
- Produces: `searchUniversities(query: UniversitySearchInput): Promise<Result<Page<UniversitySummary>>>`.
- Produces: `UniversitySearchInput` with `q`, `country`, `category`, `level`, `page`, and `size` matching the existing API names.
- Produces: distinct `loading`, `ready`, `empty`, `failed`, and `offline` view states.

- [ ] **Step 1: Write failing university mapping tests**

Use a fixture matching the real `/api/v1/universities/search` response shape. Assert valid items map their stable slug, Chinese/English names, location, programme count, subject tags, and HTTPS image URL. Assert malformed page metadata fails as `unexpected`; an error response never maps to an empty page; empty filters are omitted rather than sent as literal `ALL` or empty strings.

- [ ] **Step 2: Run mapping tests and verify failure**

Run: `cd miniapp && npm test -- --test-name-pattern='universit'`

Expected: FAIL because the university service does not exist.

- [ ] **Step 3: Implement the service and reusable states**

Build query parameters through `URLSearchParams`; default to `page=1`, `size=12`, `sort=relevance`. Validate required response fields at the boundary. `app-state` receives `kind`, `title`, `description`, and an optional retry event; it must not infer failure from an empty array.

- [ ] **Step 4: Build the sample-aligned home and university views**

Match the supplied hierarchy—airy pale background, green accents, white cards, fixed image ratios, concise metadata, and safe-area spacing—without copying screenshot pixels. Home may show returned popular/search results only; when no endpoint data exists it shows the honest state component. The planning feature entry routes to a non-tab planning shell; AI planning and visa lookup display `功能建设中` without sending a request.

- [ ] **Step 5: Run miniapp checks**

Run: `cd miniapp && npm run check`

Expected: PASS.

- [ ] **Step 6: Commit the real data path**

```bash
git add miniapp/miniprogram miniapp/tests
git commit -m "feat: connect miniapp university search"
```

---

### Task 8: Documentation and Full Verification

**Files:**
- Create: `miniapp/README.md`
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `compose.production.yaml`
- Test: all existing frontend, backend, and miniapp checks.

**Interfaces:**
- Produces: exact setup instructions for WeChat DevTools import, local provider, official AppID, legal request domain, privacy review, tests, and experience-build upload.
- Produces: documented environment variables matching the spec and application configuration.

- [ ] **Step 1: Write the operational documentation**

Document these variables exactly: `APP_MINIAPP_AUTH_ENABLED`, `APP_MINIAPP_WECHAT_APP_ID`, `APP_MINIAPP_WECHAT_APP_SECRET`, `APP_MINIAPP_PUBLIC_ORIGIN`, `APP_MINIAPP_ACCESS_TOKEN_TTL`, `APP_MINIAPP_REFRESH_TOKEN_TTL`, `APP_MINIAPP_LOCAL_PROVIDER_ENABLED`, `APP_MINIAPP_LOCAL_TEST_CODE`, and `APP_MINIAPP_LOCAL_TEST_SUBJECT`. State that the final two are non-production-only and that `project.private.config.json` is generated locally and never committed.

- [ ] **Step 2: Run secret and placeholder scans**

Run:

```bash
rg -n "session_key|APP_MINIAPP_WECHAT_APP_SECRET=.+|wx[a-z0-9]{16}|TO[D]O|TB[D]" miniapp backend/src/main backend/src/test .env.example compose.production.yaml
```

Expected: only approved type/property names and test assertions; no secret values, real AppID, or unfinished implementation markers.

- [ ] **Step 3: Run the full relevant test suite**

Run:

```bash
cd miniapp && npm ci && npm run check
cd ../backend && ./mvnw test
cd ../frontend && npm ci && npm test && npm run lint && npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Perform manual WeChat DevTools verification**

Import `miniapp/`, run local-provider login, verify cold-start refresh, logout, all four tabs, planning navigation from Home, offline and failed university states, safe areas, and large system font. Record the tested DevTools version and device presets in the PR description; do not claim a real official WeChat login until an approved AppID and legal domain are available.

- [ ] **Step 5: Commit documentation and deployment wiring**

```bash
git add README.md .env.example compose.production.yaml miniapp/README.md
git commit -m "docs: document miniapp development and release"
```

- [ ] **Step 6: Push A's branch and open the integration PR**

```bash
git push origin feat/miniapp-foundation
```

Open a PR from `feat/miniapp-foundation` to `feat/miniapp-v1`. Include test output, manual verification status, environment variables added, and the explicit note that the U圈 community backend is a separate follow-up specification.
