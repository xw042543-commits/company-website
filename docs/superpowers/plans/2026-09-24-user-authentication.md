# User Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有登录、注册和忘记密码预览页面升级为可在本地完整验证、上线时默认关闭注册的真实用户账号系统。

**Architecture:** Spring Security 负责认证和授权，Spring Session JDBC 将服务端 Session 保存在 PostgreSQL，浏览器仅保存 HttpOnly Session Cookie。账号、验证凭证、密码重置凭证和认证限流窗口以 PostgreSQL 为真实数据源；邮件和短信使用可替换通知端口，本地环境提供受限的测试实现。

**Tech Stack:** Java 21, Spring Boot 4.1.1, Spring Security, Spring Session JDBC, Spring Data JPA, Flyway, PostgreSQL 17.11, Next.js 16.3.5, React 19, TypeScript, Node.js 24.

**Spec:** `docs/superpowers/specs/2026-09-24-user-authentication-design.md`

## Global Constraints

- 保持模块化单体架构，不新增微服务、消息队列或第三方身份平台。
- PostgreSQL 保存账号和 Session；Redis 不作为 Session 存储。
- 普通登录有效期为 24 小时，“记住我”为 30 天。
- 注册时填写姓名、邮箱或 E.164 手机号、密码、协议同意；邮箱和手机号都可登录。
- 密码长度 12–128 个字符，数据库只保存自适应编码摘要。
- Session Cookie 使用 `HttpOnly` 和 `SameSite=Lax`，生产环境必须使用 `Secure` 和 HTTPS。
- 修改密码、重置密码或注销账号后撤销该用户全部 Session。
- 生产注册默认关闭；用户协议、隐私政策和正式通知服务未就绪时不得开启。
- 日志不记录密码、验证码、重置凭证、Cookie 或 Session ID。
- 页面结构和固定按钮保持中英双语，第一版只支持普通 `USER` 账号。
- 每个任务使用 TDD：先运行失败测试，再实现最小代码，通过针对性测试后单独提交。

---

## File Structure

### Backend

- `backend/src/main/java/com/yangdoujiao/website/common/web/ClientAddressResolver.java`：从咨询模块抽取的统一客户地址解析。
- `backend/src/main/java/com/yangdoujiao/website/common/web/ApiPayloadLimitFilter.java`：对咨询和认证写接口设定 JSON 请求体上限。
- `backend/src/main/java/com/yangdoujiao/website/auth/config/AuthProperties.java`：注册开关、协议版本、Session 有效期、凭证有效期和限流阈值。
- `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`：Spring Security、CSRF、Session、Cookie、公开路径和错误响应。
- `backend/src/main/java/com/yangdoujiao/website/auth/account/*`：账号实体、状态、标识规范化和 Repository。
- `backend/src/main/java/com/yangdoujiao/website/auth/verification/*`：联系方式验证实体、通知端口、本地通知存储和验证服务。
- `backend/src/main/java/com/yangdoujiao/website/auth/session/*`：登录、退出、当前 Session 查询和全 Session 撤销。
- `backend/src/main/java/com/yangdoujiao/website/auth/password/*`：密码重置凭证、忘记密码、重置与修改密码。
- `backend/src/main/java/com/yangdoujiao/website/auth/api/*`：认证和账号 REST Controller 与请求/响应 DTO。
- `backend/src/main/java/com/yangdoujiao/website/auth/ratelimit/*`：基于 PostgreSQL 原子 UPSERT 的认证尝试限制。
- `backend/src/main/resources/db/migration/V8__create_user_authentication.sql`：用户、凭证、限流和 Spring Session JDBC 表。

### Frontend

- `frontend/src/lib/auth-api.ts`：响应校验、CSRF 获取、Cookie 请求和认证 API。
- `frontend/src/lib/auth-api.test.ts`：不可信 JSON 校验、CSRF、错误状态和 Cookie 选项测试。
- `frontend/src/lib/auth-form-state.ts` 及测试：纯函数表单状态和中英错误文案映射。
- `frontend/src/components/login-form.tsx`、`register-form.tsx`、`forgot-password-form.tsx`：替换预览行为为真实提交。
- `frontend/src/components/phone-verification-form.tsx`、`reset-password-form.tsx`、`account-panel.tsx`：验证、重置和账号操作。
- `frontend/src/app/[locale]/verify-email/page.tsx`、`verify-phone/page.tsx`、`reset-password/page.tsx`、`account/page.tsx`：新页面路由。

---

### Task 1: 抽取共享请求保护组件

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/common/web/ClientAddressResolver.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/common/web/ApiPayloadLimitFilter.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/common/web/ClientAddressResolverTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/common/web/ApiPayloadLimitFilterTest.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationRateLimitInterceptor.java`
- Delete: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationClientAddressResolver.java`
- Delete: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationPayloadLimitFilter.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/consultation/ConsultationClientAddressResolverTest.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/consultation/ConsultationPayloadLimitFilterTest.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/consultation/ConsultationRateLimitInterceptorTest.java`

**Interfaces:**
- Produces: `String ClientAddressResolver.resolve(HttpServletRequest request)`.
- Produces: `ApiPayloadLimitFilter` protecting `POST /api/v1/consultations` at 16 KB and auth write routes at 8 KB.

- [ ] **Step 1: Write failing shared resolver and filter tests**

```java
@Test
void ignoresForwardedAddressesFromUntrustedPeers() {
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
    request.setRemoteAddr("198.51.100.7");
    request.addHeader("X-Forwarded-For", "203.0.113.9");
    assertThat(new ClientAddressResolver(new String[0]).resolve(request))
            .isEqualTo("198.51.100.7");
}

@Test
void rejectsAuthenticationPayloadAboveEightKilobytes() throws Exception {
    ApiPayloadLimitFilter filter = new ApiPayloadLimitFilter(
            new ObjectMapper(), DataSize.ofKilobytes(16), DataSize.ofKilobytes(8));
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/register");
    request.setContentType(MediaType.APPLICATION_JSON_VALUE);
    request.setContent(("\"" + "x".repeat(8_192) + "\"").getBytes(StandardCharsets.UTF_8));
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> fail("must stop"));
    assertThat(response.getStatus()).isEqualTo(413);
}
```

- [ ] **Step 2: Run tests and verify the shared classes are missing**

Run: `cd backend && ./mvnw -Dtest=ClientAddressResolverTest,ApiPayloadLimitFilterTest test`
Expected: FAIL during test compilation because the shared classes do not exist.

- [ ] **Step 3: Move the existing strict IP parsing into `ClientAddressResolver` and generalize the body filter**

```java
public String resolve(HttpServletRequest request);

private Limit limitFor(HttpServletRequest request) {
    if (isPost(request, "/api/v1/consultations")) return new Limit(consultationBytes, "CONSULTATION_PAYLOAD_TOO_LARGE");
    if (request.getMethod().equals("POST") && request.getRequestURI().startsWith("/api/v1/auth/"))
        return new Limit(authBytes, "AUTH_PAYLOAD_TOO_LARGE");
    if ((request.getMethod().equals("PUT") || request.getMethod().equals("DELETE"))
            && request.getRequestURI().startsWith("/api/v1/account"))
        return new Limit(authBytes, "AUTH_PAYLOAD_TOO_LARGE");
    return null;
}
```

Preserve the existing 2,048-character forwarded-header cap, literal IPv4/IPv6 parsing, right-to-left trusted-proxy walk, matrix-parameter handling, cached request body, CORS headers, and trace ID response.

- [ ] **Step 4: Run shared and consultation regression tests**

Run: `cd backend && ./mvnw -Dtest=ClientAddressResolverTest,ApiPayloadLimitFilterTest,ConsultationClientAddressResolverTest,ConsultationPayloadLimitFilterTest,ConsultationHttpIntegrationTest test`
Expected: PASS; consultation behavior remains unchanged and auth paths return `AUTH_PAYLOAD_TOO_LARGE`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test
git commit -m "refactor: 统一接口请求保护组件"
```

### Task 2: 新增认证依赖与 V8 数据库结构

**Files:**
- Modify: `backend/pom.xml`
- Create: `backend/src/main/resources/db/migration/V8__create_user_authentication.sql`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/AuthSchemaIntegrationTest.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/programme/V3MigrationCompatibilityTest.java`

**Interfaces:**
- Produces tables: `user_accounts`, `user_verification_tokens`, `password_reset_tokens`, `auth_rate_limit_buckets`, `spring_session`, `spring_session_attributes`.
- Produces dependencies: `spring-boot-starter-security`, `spring-session-jdbc`, `spring-security-test`.

- [ ] **Step 1: Write schema tests before the migration**

```java
@Test
void rejectsAccountsWithoutContactAndDuplicateNormalizedEmail() {
    assertThatThrownBy(() -> jdbc.update("""
        INSERT INTO user_accounts (full_name, password_hash, status, agreement_version, privacy_version)
        VALUES ('Test User', 'hash', 'PENDING_VERIFICATION', 'terms-v1', 'privacy-v1')
        """)).isInstanceOf(DataIntegrityViolationException.class);

    insertAccount("first@example.com", null);
    assertThatThrownBy(() -> insertAccount("first@example.com", null))
            .isInstanceOf(DataIntegrityViolationException.class);
}

@Test
void springSessionTablesUseDatabaseForeignKeys() {
    Integer count = jdbc.queryForObject("""
        SELECT COUNT(*) FROM information_schema.table_constraints
        WHERE table_name = 'spring_session_attributes' AND constraint_type = 'FOREIGN KEY'
        """, Integer.class);
    assertThat(count).isEqualTo(1);
}
```

- [ ] **Step 2: Run the schema test and verify V8 tables are absent**

Run: `cd backend && ./mvnw -Dtest=AuthSchemaIntegrationTest test`
Expected: ERROR with `relation "user_accounts" does not exist`.

- [ ] **Step 3: Add dependencies and the complete V8 migration**

The migration must enforce these exact invariants:

```sql
CREATE TABLE user_accounts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    normalized_email VARCHAR(254),
    normalized_phone VARCHAR(16),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    agreement_version VARCHAR(50) NOT NULL,
    privacy_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uk_user_accounts_email UNIQUE (normalized_email),
    CONSTRAINT uk_user_accounts_phone UNIQUE (normalized_phone),
    CONSTRAINT ck_user_accounts_contact CHECK (normalized_email IS NOT NULL OR normalized_phone IS NOT NULL),
    CONSTRAINT ck_user_accounts_status CHECK (status IN ('PENDING_VERIFICATION','ACTIVE','DISABLED','DELETED')),
    CONSTRAINT ck_user_accounts_deleted CHECK ((status = 'DELETED') = (deleted_at IS NOT NULL))
);
```

`user_verification_tokens` and `password_reset_tokens` store only a 64-character SHA-256 token hash, expiry, used timestamp, attempt count, and user foreign key with cascade delete. `auth_rate_limit_buckets` uses `(scope, subject_hash)` as its primary key and stores `attempts` plus `expires_at`. Add the Spring Session JDBC tables with these exact keys and indexes:

```sql
CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INTEGER NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100)
);
CREATE UNIQUE INDEX spring_session_ix1 ON spring_session (session_id);
CREATE INDEX spring_session_ix2 ON spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session (principal_name);

CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_fk
        FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);
```

Keep `spring.jpa.hibernate.ddl-auto=validate`; Flyway alone creates these tables.

- [ ] **Step 4: Run migration, schema, and compatibility tests**

Run: `cd backend && ./mvnw -Dtest=AuthSchemaIntegrationTest,V3MigrationCompatibilityTest test`
Expected: PASS; migrations V1–V8 work from both empty and legacy V2 state.

- [ ] **Step 5: Commit**

```bash
git add backend/pom.xml backend/src/main/resources/db/migration/V8__create_user_authentication.sql backend/src/test
git commit -m "feat: 新增用户认证数据结构"
```

### Task 3: 建立账号领域模型与配置校验

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/config/AuthProperties.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccount.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccountStatus.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccountRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/AccountIdentifierNormalizer.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/NormalizedIdentifier.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/AccountIdentifierType.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/AuthValidationException.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/account/AccountIdentifierNormalizerTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/account/UserAccountRepositoryIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/config/AuthPropertiesTest.java`
- Modify: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/resources/application-prod.yml`
- Modify: `backend/src/test/resources/application-test.yml`
- Modify: `.env.example`

**Interfaces:**
- Produces: `NormalizedIdentifier normalizeLogin(String raw)` returning `EMAIL` or `PHONE` and canonical value.
- Produces: `Optional<UserAccount> findLoginAccount(String normalizedIdentifier)` excluding `DELETED`.
- Produces: validated `AuthProperties` under `app.auth`.

- [ ] **Step 1: Write normalization, repository, and configuration tests**

```java
@Test
void normalizesEmailAndRequiresE164Phone() {
    assertThat(normalizer.normalizeLogin(" Student@Example.COM ").value())
            .isEqualTo("student@example.com");
    assertThat(normalizer.normalizeLogin("+60123456789").type()).isEqualTo(PHONE);
    assertThatThrownBy(() -> normalizer.normalizeLogin("012-3456789"))
            .isInstanceOf(AuthValidationException.class);
}

@Test
void registrationCannotBeEnabledWithoutPolicyVersions() {
    assertThatThrownBy(() -> properties.validate())
            .hasMessageContaining("agreement-version")
            .hasMessageContaining("privacy-version");
}
```

- [ ] **Step 2: Run tests and verify missing types**

Run: `cd backend && ./mvnw -Dtest=AccountIdentifierNormalizerTest,UserAccountRepositoryIntegrationTest,AuthPropertiesTest test`
Expected: FAIL during test compilation.

- [ ] **Step 3: Implement focused account classes and exact configuration**

```java
@ConfigurationProperties("app.auth")
public record AuthProperties(
        boolean registrationEnabled,
        String agreementVersion,
        String privacyVersion,
        Duration sessionTimeout,
        Duration rememberedSessionTimeout,
        Duration emailVerificationTtl,
        Duration phoneVerificationTtl,
        Duration passwordResetTtl,
        DataSize maximumBodySize,
        String[] trustedProxies
) { }

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByNormalizedEmailAndStatusNot(String email, UserAccountStatus excluded);
    Optional<UserAccount> findByNormalizedPhoneAndStatusNot(String phone, UserAccountStatus excluded);
}
```

Set base defaults to registration disabled, 24-hour Session, 30-day remembered Session, 30-minute email verification, 10-minute SMS verification, 30-minute password reset, and 8 KB auth request bodies. `application-test.yml` enables registration with `test-terms-v1` and `test-privacy-v1`; `.env.example` contains only safe blank/example values. `application-prod.yml` keeps registration disabled unless all required environment values are present, enables Secure Cookie, and never activates a local notification bean.

- [ ] **Step 4: Run focused tests**

Run: `cd backend && ./mvnw -Dtest=AccountIdentifierNormalizerTest,UserAccountRepositoryIntegrationTest,AuthPropertiesTest test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .env.example backend/src/main backend/src/test backend/src/test/resources/application-test.yml
git commit -m "feat: 建立用户账号领域模型"
```

### Task 4: 配置 Spring Security 与 PostgreSQL Session

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthSecurityErrorWriter.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/CsrfController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/CsrfResponse.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/AuthSecurityHttpIntegrationTest.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/test/resources/application-test.yml`

**Interfaces:**
- Produces: `GET /api/v1/auth/csrf -> { "headerName": "X-XSRF-TOKEN", "token": "..." }`.
- Produces: unauthenticated protected requests as existing `ApiErrorResponse` with `401` and `X-Trace-Id`.

- [ ] **Step 1: Write failing CSRF, CORS, cookie, and authorization tests**

```java
@Test
void issuesCsrfTokenAndRejectsWritesWithoutIt() throws Exception {
    mockMvc.perform(get("/api/v1/auth/csrf"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
            .andExpect(jsonPath("$.token").isNotEmpty());
    mockMvc.perform(post("/api/v1/auth/login").contentType(APPLICATION_JSON).content("{}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
}

@Test
void accountEndpointRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/account"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().exists("X-Trace-Id"));
}
```

- [ ] **Step 2: Run the test and verify security is not configured**

Run: `cd backend && ./mvnw -Dtest=AuthSecurityHttpIntegrationTest test`
Expected: FAIL because the endpoints and security chain do not exist.

- [ ] **Step 3: Implement the security chain**

```java
http
    .cors(Customizer.withDefaults())
    .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf", "/api/v1/auth/session").permitAll()
        .requestMatchers("/api/v1/auth/**").permitAll()
        .requestMatchers("/api/v1/account/**").hasRole("USER")
        .anyRequest().permitAll())
    .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()))
    .requestCache(cache -> cache.disable())
    .formLogin(form -> form.disable())
    .httpBasic(basic -> basic.disable());
```

Configure Spring Session JDBC table name, disable schema auto-initialization, set the default 24-hour timeout, set `JSESSIONID` to HttpOnly/SameSite=Lax, and map authentication/authorization/CSRF errors to `ApiErrorResponse`. Production obtains Secure Cookie from an explicit environment setting and startup validation.

- [ ] **Step 4: Run the security integration test**

Run: `cd backend && ./mvnw -Dtest=AuthSecurityHttpIntegrationTest test`
Expected: PASS; existing public article, search, university and consultation endpoints remain public.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test backend/src/main/resources/application.yml backend/src/test/resources/application-test.yml
git commit -m "feat: 配置安全会话基础"
```

### Task 5: 实现注册、通知端口与联系方式验证

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/UserVerificationToken.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/UserVerificationTokenRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/AuthNotificationSender.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/LocalAuthNotificationStore.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/LocalAuthNotificationController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/verification/VerificationService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/ratelimit/AuthRateLimiter.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/RegistrationService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/RegisterRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/RegistrationResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/VerifyEmailRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/VerifyPhoneRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/ResendVerificationRequest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/RegistrationHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/verification/VerificationConcurrencyIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/ratelimit/AuthRateLimiterIntegrationTest.java`

**Interfaces:**
- Consumes: `UserAccountRepository`, `AccountIdentifierNormalizer`, `ClientAddressResolver`, `AuthProperties`.
- Produces: register, verify-email, verify-phone, resend-verification endpoints from the spec.
- Produces: `void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale)` and `void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale)`.

- [ ] **Step 1: Write failing registration and verification tests**

```java
@Test
void registersEmailAccountWithoutExposingToken() throws Exception {
    mockMvc.perform(post("/api/v1/auth/register").with(csrf())
            .contentType(APPLICATION_JSON)
            .content("""
              {"fullName":"Wang Xin","email":"Student@Example.com","password":"correct-horse-42",
               "agreementAccepted":true,"privacyAccepted":true}
              """))
        .andExpect(status().isAccepted())
        .andExpect(jsonPath("$.verificationMethod").value("EMAIL"))
        .andExpect(jsonPath("$.token").doesNotExist());
}

@Test
void allowsOnlyOneConcurrentUseOfVerificationToken() throws Exception {
    CountDownLatch start = new CountDownLatch(1);
    List<Future<Boolean>> results = new ArrayList<>();
    try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
        for (int attempt = 0; attempt < 2; attempt++) {
            results.add(executor.submit(() -> {
                start.await();
                try {
                    verificationService.verifyEmail(rawToken);
                    return true;
                } catch (ApiException exception) {
                    assertThat(exception.getCode()).isEqualTo("INVALID_VERIFICATION_TOKEN");
                    return false;
                }
            }));
        }
        start.countDown();
        assertThat(results).extracting(Future::get).containsExactlyInAnyOrder(true, false);
    }
}
```

- [ ] **Step 2: Run tests and verify missing registration types**

Run: `cd backend && ./mvnw -Dtest=RegistrationHttpIntegrationTest,VerificationConcurrencyIntegrationTest,AuthRateLimiterIntegrationTest test`
Expected: FAIL during test compilation.

- [ ] **Step 3: Implement transactional registration and one-time verification**

```java
public interface AuthNotificationSender {
    void sendEmailVerification(String normalizedEmail, String rawToken, Locale locale);
    void sendPhoneVerification(String normalizedPhone, String rawCode, Locale locale);
    void sendPasswordReset(String normalizedIdentifier, String rawToken, Locale locale);
}

@Transactional
public RegistrationResponse register(RegisterRequest request, String clientAddress) {
    properties.requireRegistrationEnabled();
    rateLimiter.consume("register-ip", sha256(clientAddress), registerLimit, registerWindow);
    NormalizedIdentifier identifier = normalizer.normalizeRegistration(request.email(), request.phone());
    ensureIdentifierAvailable(identifier);
    UserAccount account = repository.save(UserAccount.pending(
            request.fullName().trim(), identifier, passwordEncoder.encode(request.password()),
            properties.agreementVersion(), properties.privacyVersion(), clock.instant()));
    return verificationService.issue(account, identifier, request.locale());
}
```

Use `SELECT ... FOR UPDATE` for token consumption; hash all raw tokens with SHA-256 before storage; compare hashes in constant time; invalidate earlier active tokens of the same purpose. PostgreSQL limiter executes this atomic statement and rejects the attempt when the returned count exceeds the configured maximum:

```sql
INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
VALUES (:scope, :subjectHash, 1, :newExpiry)
ON CONFLICT (scope, subject_hash) DO UPDATE SET
    attempts = CASE
        WHEN auth_rate_limit_buckets.expires_at <= :now THEN 1
        ELSE auth_rate_limit_buckets.attempts + 1
    END,
    expires_at = CASE
        WHEN auth_rate_limit_buckets.expires_at <= :now THEN :newExpiry
        ELSE auth_rate_limit_buckets.expires_at
    END
RETURNING attempts, expires_at;
```

The limiter fails closed with `503 AUTH_SERVICE_UNAVAILABLE` when its write fails. `LocalAuthNotificationController` is active only under `dev` and `test`, returns the latest notification only for an exact identifier, has its own localhost-only check, and removes the notification after retrieval; no production bean exposes raw tokens.

- [ ] **Step 4: Run registration, concurrency, limiter, schema and security tests**

Run: `cd backend && ./mvnw -Dtest=RegistrationHttpIntegrationTest,VerificationConcurrencyIntegrationTest,AuthRateLimiterIntegrationTest,AuthSchemaIntegrationTest,AuthSecurityHttpIntegrationTest test`
Expected: PASS, including disabled-registration `503`, duplicate generic response, expiry, retry limit and resend invalidation.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: 实现用户注册与联系方式验证"
```

### Task 6: 实现登录、退出与 Session 状态

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/session/UserAccountDetailsService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/session/UserPrincipal.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/session/AuthenticationService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/session/UserSessionService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/LoginRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthSessionResponse.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthController.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/LoginHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/session/UserSessionServiceIntegrationTest.java`

**Interfaces:**
- Produces: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/session`.
- Produces: `void UserSessionService.revokeAll(long userId)` for password and account tasks.

- [ ] **Step 1: Write failing email/phone login and Session tests**

```java
@Test
void loginRotatesSessionAndUsesRequestedLifetime() throws Exception {
    MvcResult result = mockMvc.perform(post("/api/v1/auth/login").with(csrf())
            .session(existingAnonymousSession)
            .contentType(APPLICATION_JSON)
            .content("""{"identifier":"student@example.com","password":"correct-horse-42","rememberMe":true}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(true))
        .andReturn();
    assertThat(result.getRequest().getSession(false).getId()).isNotEqualTo(existingAnonymousSession.getId());
    assertThat(result.getRequest().getSession(false).getMaxInactiveInterval()).isEqualTo(2_592_000);
}
```

- [ ] **Step 2: Run tests and verify login endpoints are absent**

Run: `cd backend && ./mvnw -Dtest=LoginHttpIntegrationTest,UserSessionServiceIntegrationTest test`
Expected: FAIL with 404 or missing classes.

- [ ] **Step 3: Authenticate through Spring Security and persist the context**

```java
Authentication authentication = authenticationManager.authenticate(
        UsernamePasswordAuthenticationToken.unauthenticated(identifier, password));
SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
securityContextRepository.saveContext(context, request, response);
request.changeSessionId();
request.getSession(false).setMaxInactiveInterval(Math.toIntExact(
        (rememberMe ? Duration.ofDays(30) : Duration.ofHours(24)).toSeconds()));
```

`UserAccountDetailsService` only loads `ACTIVE` non-deleted accounts and exposes principal name `user:<id>` for the Spring Session principal index. On failure, consume both IP and identifier rate-limit buckets and always return `401 INVALID_CREDENTIALS`; on success clear the identifier failure bucket. Configure Spring Security logout to invalidate the current Session, clear the Session cookie, and return JSON `204` without redirect.

- [ ] **Step 4: Run login and security tests**

Run: `cd backend && ./mvnw -Dtest=LoginHttpIntegrationTest,UserSessionServiceIntegrationTest,AuthSecurityHttpIntegrationTest test`
Expected: PASS for email, phone, wrong password, pending/disabled/deleted account, 24-hour/30-day timeout, Session rotation, logout and anonymous session response.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: 实现用户登录与会话管理"
```

### Task 7: 实现忘记密码、重置与修改密码

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/password/PasswordResetToken.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/password/PasswordResetTokenRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/password/PasswordService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/ForgotPasswordRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/ResetPasswordRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/ChangePasswordRequest.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AccountController.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/PasswordHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/password/PasswordResetConcurrencyIntegrationTest.java`

**Interfaces:**
- Produces: forgot-password, reset-password and `PUT /api/v1/account/password`.
- Consumes: `AuthNotificationSender`, `AuthRateLimiter`, `UserSessionService.revokeAll`.

- [ ] **Step 1: Write failing generic-response, expiry, reuse and Session-revocation tests**

```java
@Test
void forgotPasswordDoesNotRevealWhetherAccountExists() throws Exception {
    String existing = forgot("student@example.com");
    String missing = forgot("missing@example.com");
    assertThat(existing).isEqualTo(missing);
}

@Test
void resetPasswordRevokesAllExistingSessions() throws Exception {
    String token = issueResetToken(activeAccount);
    reset(token, "new-correct-horse-84");
    assertThat(sessionService.findByUser(activeAccount.getId())).isEmpty();
}
```

- [ ] **Step 2: Run tests and verify password services are missing**

Run: `cd backend && ./mvnw -Dtest=PasswordHttpIntegrationTest,PasswordResetConcurrencyIntegrationTest test`
Expected: FAIL during test compilation.

- [ ] **Step 3: Implement one-time reset and authenticated password change**

```java
@Transactional
public void resetPassword(String rawToken, String newPassword) {
    PasswordResetToken token = repository.lockActiveByHash(sha256(rawToken), clock.instant())
            .orElseThrow(invalidResetToken());
    token.use(clock.instant());
    token.user().changePassword(passwordEncoder.encode(policy.validate(newPassword)), clock.instant());
    repository.invalidateOtherTokens(token.user().getId(), token.getId(), clock.instant());
    sessionService.revokeAll(token.user().getId());
}
```

The authenticated change endpoint requires the current password and rejects reuse of the same password. Forgot-password returns the same `202` body and comparable work for existing and missing identifiers; it never returns raw tokens. Concurrent reset attempts lock the token row so exactly one succeeds.

- [ ] **Step 4: Run password, login, and Session tests**

Run: `cd backend && ./mvnw -Dtest=PasswordHttpIntegrationTest,PasswordResetConcurrencyIntegrationTest,LoginHttpIntegrationTest,UserSessionServiceIntegrationTest test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: 实现密码恢复与修改"
```

### Task 8: 实现账号资料与注销

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AccountService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/AccountResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/api/DeleteAccountRequest.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/api/AccountController.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/AccountHttpIntegrationTest.java`

**Interfaces:**
- Produces: `GET /api/v1/account` and `DELETE /api/v1/account`.
- Consumes: authenticated `UserPrincipal`, `PasswordEncoder`, `UserSessionService`.

- [ ] **Step 1: Write failing profile and soft-delete tests**

```java
@Test
void deletionRequiresPasswordAndRevokesEverySession() throws Exception {
    mockMvc.perform(delete("/api/v1/account").with(csrf()).session(authenticatedSession)
            .contentType(APPLICATION_JSON)
            .content("""{"currentPassword":"correct-horse-42","confirmation":"DELETE"}"""))
        .andExpect(status().isNoContent());
    assertThat(accountRepository.findById(accountId).orElseThrow().getStatus()).isEqualTo(DELETED);
    assertThat(sessionService.findByUser(accountId)).isEmpty();
}
```

- [ ] **Step 2: Run the account test and verify endpoints are incomplete**

Run: `cd backend && ./mvnw -Dtest=AccountHttpIntegrationTest test`
Expected: FAIL with 404 or missing classes.

- [ ] **Step 3: Implement minimal profile output and transactional soft deletion**

`AccountResponse` returns `id`, `fullName`, masked email/phone, verification flags and `createdAt`; it never returns password hash, raw contact verification token, policy internals or Session identifiers. `DELETE` requires the current password and exact confirmation string `DELETE`, changes status to `DELETED`, sets `deletedAt`, invalidates unused verification/reset tokens, and revokes all Sessions.

- [ ] **Step 4: Run account, password and login regression tests**

Run: `cd backend && ./mvnw -Dtest=AccountHttpIntegrationTest,PasswordHttpIntegrationTest,LoginHttpIntegrationTest test`
Expected: PASS, including wrong password, missing confirmation and already-deleted account.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: 实现用户账号管理"
```

### Task 9: 建立前端认证 API 客户端

**Files:**
- Create: `frontend/src/lib/auth-api.ts`
- Create: `frontend/src/lib/auth-api.test.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `getCsrfToken`, `registerAccount`, `verifyEmail`, `verifyPhone`, `login`, `logout`, `getSession`, `requestPasswordReset`, `resetPassword`, `getAccount`, `changePassword`, `deleteAccount`.
- Produces discriminated result union: `ready | accepted | validation-error | unauthorized | rate-limited | unavailable | error`.

- [ ] **Step 1: Write failing parser, Cookie and CSRF tests**

```ts
test("loads csrf and sends credentials on login", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const csrfResponse = { headerName: "X-XSRF-TOKEN", token: "csrf-token" };
  const loginResponse = { authenticated: true, user: { id: 7, fullName: "Wang Xin" } };
  const queued = [csrfResponse, loginResponse];
  const request = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(queued.shift()), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  const result = await login("http://localhost:8080", {
    identifier: "student@example.com", password: "correct-horse-42", rememberMe: false,
  }, request);
  assert.equal(calls[0].url, "http://localhost:8080/api/v1/auth/csrf");
  assert.equal(calls[1].init?.credentials, "include");
  assert.equal(new Headers(calls[1].init?.headers).get("X-XSRF-TOKEN"), "csrf-token");
  assert.deepEqual(result, { status: "ready", session: loginResponse });
});
```

- [ ] **Step 2: Run the frontend API test and verify imports fail**

Run: `npm --prefix frontend run test:auth`
Expected: FAIL because `auth-api.ts` does not exist or exports are undefined.

- [ ] **Step 3: Implement strict response validation and one request helper**

```ts
async function authWrite<T>(baseUrl: string, path: string, body: unknown, parse: Parser<T>, request = fetch) {
  const csrf = await getCsrfToken(baseUrl, request);
  if (csrf.status !== "ready") return { status: "unavailable" } as const;
  const response = await request(new URL(path, baseUrl), {
    method: "POST", credentials: "include", cache: "no-store",
    headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
    body: JSON.stringify(body), signal: AbortSignal.timeout(5_000),
  });
  return parseAuthResponse(response, parse);
}
```

Every public function validates the base URL, request identity and untrusted JSON shape. Never persist password, token or Session data in browser storage. Add `test:auth` to the main `npm test` script.

- [ ] **Step 4: Run all frontend API tests**

Run: `npm --prefix frontend run test:auth && npm --prefix frontend run test:api`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/src/lib/auth-api.ts frontend/src/lib/auth-api.test.ts
git commit -m "feat: 新增前端认证接口客户端"
```

### Task 10: 接入登录、注册、验证、密码和账号页面

**Files:**
- Create: `frontend/src/lib/auth-form-state.ts`
- Create: `frontend/src/lib/auth-form-state.test.ts`
- Modify: `frontend/src/components/login-form.tsx`
- Modify: `frontend/src/components/register-form.tsx`
- Modify: `frontend/src/components/forgot-password-form.tsx`
- Create: `frontend/src/components/phone-verification-form.tsx`
- Create: `frontend/src/components/reset-password-form.tsx`
- Create: `frontend/src/components/account-panel.tsx`
- Modify: `frontend/src/components/site-header.tsx`
- Modify: existing login/register/forgot-password pages.
- Create: `frontend/src/app/[locale]/verify-email/page.tsx`
- Create: `frontend/src/app/[locale]/verify-phone/page.tsx`
- Create: `frontend/src/app/[locale]/reset-password/page.tsx`
- Create: `frontend/src/app/[locale]/account/page.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes all functions from `auth-api.ts`.
- Produces complete bilingual account flow without browser credential storage.

- [ ] **Step 1: Write failing pure-state tests**

```ts
test("maps backend states without exposing backend messages", () => {
  assert.deepEqual(authMessage("zh", { status: "rate-limited" }), {
    tone: "error", text: "尝试次数过多，请稍后再试。",
  });
  assert.deepEqual(authMessage("en", { status: "unavailable" }), {
    tone: "error", text: "Account service is temporarily unavailable. Please try again later.",
  });
});
```

- [ ] **Step 2: Run the state test and verify exports are missing**

Run: `npm --prefix frontend run test:auth-ui`
Expected: FAIL because `auth-form-state.ts` does not exist.

- [ ] **Step 3: Implement real accessible forms and routes**

Use controlled inputs, `autocomplete="email" | "tel" | "current-password" | "new-password"`, disabled submit buttons while pending, `role="alert"` for errors and `aria-live="polite"` for success. Registration lets the user choose email or phone, requires both agreement checkboxes, confirms the password locally, then routes to email/phone verification. Email verification reads the token from the URL and submits it only after the user confirms; phone verification accepts the one-time code. Reset-password accepts token plus new password. Account page loads the current account and supports password change, logout and a typed `DELETE` confirmation.

Update the header to show “登录 / Sign in” for an anonymous Session and “我的账号 / My account” for an authenticated Session. Remove all preview warnings and claims about future employee/admin access because this release only supports `USER` accounts.

- [ ] **Step 4: Run frontend tests, lint and production build**

Run: `npm --prefix frontend test && npm --prefix frontend run lint && npm --prefix frontend run build`
Expected: PASS; no hydration warning, TypeScript error, untranslated fixed button or preview-only copy remains.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: 接入用户注册与登录流程"
```

### Task 11: 完善中文文档并执行全量审核

**Files:**
- Modify: `docs/API.md`
- Modify: `docs/DATABASE.md`
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `.github/workflows/ci.yml`
- Modify: `backend/src/test/java/com/yangdoujiao/website/BackendApplicationTests.java`

**Interfaces:**
- Documents exact auth endpoints, cookies, CSRF sequence, environment values, local verification workflow, production launch gate and account-data tables.
- CI verifies backend tests plus frontend tests, lint and build.

- [ ] **Step 1: Add one full-context smoke test**

```java
@Test
void authenticationInfrastructureLoadsWithIsolatedServices() {
    assertThat(dataSource).isNotNull();
    assertThat(sessionRepository).isNotNull();
    assertThat(passwordEncoder).isNotNull();
}
```

- [ ] **Step 2: Update Chinese documentation with executable examples**

Document this local sequence without real secrets:

```bash
curl -c /tmp/udajo-cookie.txt http://localhost:8080/api/v1/auth/csrf
curl -b /tmp/udajo-cookie.txt -c /tmp/udajo-cookie.txt \
  -H 'Content-Type: application/json' -H 'X-XSRF-TOKEN: <value-from-csrf-response>' \
  -d '{"identifier":"student@example.com","password":"local-test-password","rememberMe":false}' \
  http://localhost:8080/api/v1/auth/login
```

State clearly that production registration remains disabled until policy versions, HTTPS, email and SMS services are approved. Explain that `.env` contains local values only and must never be committed.

- [ ] **Step 3: Run the complete backend verification**

Run: `cd backend && ./mvnw clean test`
Expected: BUILD SUCCESS; all legacy and authentication tests pass with zero failure/error.

- [ ] **Step 4: Run the complete frontend verification**

Run: `npm --prefix frontend ci && npm --prefix frontend test && npm --prefix frontend run lint && npm --prefix frontend run build`
Expected: all commands exit 0.

- [ ] **Step 5: Inspect the final diff for secrets, unsafe logs and accidental scope**

Run:

```bash
git diff --check
git status --short
git diff --name-only origin/main...HEAD
git grep -n -E '(password|verification|reset).*(log\.|println|console\.)' -- backend/src frontend/src
git ls-files | grep -E '(^|/)\.env($|\.local$)'
```

Expected: no whitespace errors; only planned auth/shared-protection/docs/CI files; no secret logging; the final command prints no tracked secret file.

- [ ] **Step 6: Perform a focused security review**

Review against the spec and record findings for: account enumeration, Session fixation, CSRF, CORS with credentials, Cookie flags, token hashing, token concurrency, password encoding, Session revocation, trusted proxy handling, rate-limit failure behavior, production-disabled registration and local provider profile isolation. Resolve every Critical or Important finding and rerun the affected test plus both full suites.

- [ ] **Step 7: Commit**

```bash
git add README.md .env.example .github/workflows/ci.yml docs backend/src/test/java/com/yangdoujiao/website/BackendApplicationTests.java
git commit -m "docs: 完善用户认证使用说明"
```

## Final Acceptance Checklist

- [ ] 邮箱和手机注册、验证、登录、退出均可在本地完成。
- [ ] 普通登录为 24 小时，“记住我”为 30 天，登录时 Session ID 发生更换。
- [ ] 退出、修改/重置密码和注销账号按设计撤销 Session。
- [ ] 账号枚举、暴力猜测、重复验证凭证、CSRF、CORS 和代理伪造测试通过。
- [ ] 生产注册默认关闭，本地通知实现无法在生产配置启动。
- [ ] 前端不保存密码、凭证或 Session ID，所有固定文案中英双语。
- [ ] 后端全量测试、前端测试、Lint 和构建全部通过。
