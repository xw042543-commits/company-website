# Adviser Consultation Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected adviser back office where the shared `udajoedu@gmail.com` account can review submitted consultation forms and move them between pending, in-progress, and completed states.

**Architecture:** Extend the existing user session with an allow-listed adviser role, protect new Spring Boot adviser endpoints with `ROLE_ADVISER`, and expose a localised Next.js administration route backed by server-paginated consultation APIs. Keep public consultation submission unchanged, keep submitted fields immutable, and use optimistic versioning for status updates.

**Tech Stack:** Java 21, Spring Boot, Spring Security, Spring Data JPA, Flyway, PostgreSQL, Next.js 16, React 19, TypeScript, Node test runner, CSS.

**Spec:** `docs/superpowers/specs/2026-10-06-adviser-consultation-admin-design.md`

## Global Constraints

- The only first-release administrator capability is consultation review and status changes.
- Existing and newly registered accounts default to `USER`; registration cannot request `ADVISER`.
- Adviser accounts receive both `ROLE_USER` and `ROLE_ADVISER`.
- Consultation source fields are immutable; only status and status metadata may change.
- Valid statuses are exactly `NEW`, `IN_PROGRESS`, and `COMPLETED`.
- Adviser API responses are `Cache-Control: no-store` and require backend authority checks.
- State changes require the existing CSRF protection and an expected record version.
- Logs must not contain names, contact details, intended study information, or notes.
- Do not add deletion, export, assignment, adviser notes, analytics, or unrelated content-management features.
- Do not hardcode adviser passwords or create the adviser account in a migration.

---

## File Structure

### Backend model and migrations

- Create `backend/src/main/resources/db/migration/V11__add_adviser_consultation_management.sql`: roles, status values, status metadata, optimistic version, and indexes.
- Create `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccountRole.java`: persisted role allow-list.
- Modify `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccount.java`: default role and role accessor mapping.
- Create `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationStatus.java`: persisted status allow-list.
- Modify `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationEnquiry.java`: enum status, update metadata, and optimistic version.

### Backend authorisation and adviser API

- Modify `backend/src/main/java/com/yangdoujiao/website/auth/session/UserPrincipal.java`: role-aware authorities and `isAdviser()`.
- Modify `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthSessionResponse.java`: expose authenticated adviser capability.
- Modify `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`: protect `/api/v1/adviser/**`.
- Modify `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationEnquiryRepository.java`: specifications, reference lookup, status counts, and guarded status update.
- Create `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationController.java`: protected list, detail, and update routes.
- Create `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationService.java`: bounded search, DTO mapping, status counts, and transactional updates.
- Create focused records in `backend/src/main/java/com/yangdoujiao/website/consultation/`: `AdviserConsultationSummary`, `AdviserConsultationDetail`, `AdviserConsultationPage`, `ConsultationStatusCounts`, `ConsultationStatusUpdateRequest`, and `ConsultationStatusUpdateResponse`.
- Create `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationAuditLogger.java`: privacy-safe status audit events.

### Frontend access and interface

- Modify `frontend/src/lib/auth-session-core.ts`: return authenticated and adviser capabilities.
- Modify `frontend/src/lib/access-policy.ts`, `frontend/src/lib/proxy-policy.ts`, and `frontend/src/proxy.ts`: protect adviser routes and distinguish unauthenticated from forbidden users.
- Create `frontend/src/lib/adviser-consultation-api.ts`: strict list, detail, and status-update client.
- Create `frontend/src/app/[locale]/adviser/consultations/page.tsx`: no-index adviser page shell.
- Create `frontend/src/components/adviser-consultations-panel.tsx`: filters, table, detail view, and status controls.
- Modify `frontend/src/app/globals.css`: responsive adviser interface styling.
- Create or extend focused tests next to each frontend unit.

### Operations

- Create `docs/runbooks/adviser-consultation-admin.md`: registration, promotion, rollback, smoke checks, and privacy-safe diagnostics.
- Leave `scripts/launch-smoke.mjs` credential-free; document the authenticated adviser verification as a manual production step in the runbook.

---

### Task 1: Persist roles and consultation workflow metadata

**Files:**
- Create: `backend/src/main/resources/db/migration/V11__add_adviser_consultation_management.sql`
- Create: `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccountRole.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationStatus.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/account/UserAccount.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationEnquiry.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/programme/V3MigrationCompatibilityTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationSchemaIntegrationTest.java`

**Interfaces:**
- Produces: `UserAccountRole { USER, ADVISER }` and `ConsultationStatus { NEW, IN_PROGRESS, COMPLETED }`.
- Produces: `ConsultationEnquiry#getVersion()`, `getStatusUpdatedAt()`, and `getStatusUpdatedByUserId()` for later API tasks.
- Consumes: existing `user_accounts` and `consultation_enquiries` tables created by V8 and V7.

- [ ] **Step 1: Write the failing migration integration tests**

Add tests that query PostgreSQL metadata and insert representative rows:

```java
@Test
void existingAccountsDefaultToUserAndAdviserIsAllowed() {
    Long id = jdbc.queryForObject("""
        INSERT INTO user_accounts (
            full_name, normalized_email, password_hash, status,
            agreement_version, privacy_version, created_at, updated_at
        ) VALUES ('Adviser schema', 'adviser-schema@example.test', 'hash', 'ACTIVE',
                  'terms-v1', 'privacy-v1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
        """, Long.class);
    assertThat(jdbc.queryForObject("SELECT role FROM user_accounts WHERE id = ?", String.class, id))
        .isEqualTo("USER");
    assertThat(jdbc.update("UPDATE user_accounts SET role = 'ADVISER' WHERE id = ?", id)).isEqualTo(1);
}

@Test
void consultationWorkflowColumnsAcceptOnlySupportedStates() {
    jdbc.update("UPDATE consultation_enquiries SET status = 'IN_PROGRESS' WHERE id = ?", enquiryId);
    assertThatThrownBy(() ->
        jdbc.update("UPDATE consultation_enquiries SET status = 'DELETED' WHERE id = ?", enquiryId))
        .isInstanceOf(DataIntegrityViolationException.class);
}
```

Also update the migration compatibility expectation from version `10` to `11`.

- [ ] **Step 2: Run the migration tests and verify RED**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationSchemaIntegrationTest,V3MigrationCompatibilityTest test
```

Expected: FAIL because V11, `role`, `status_updated_at`, `status_updated_by_user_id`, and `version` do not exist.

- [ ] **Step 3: Add the enums and Flyway migration**

Create exact allow-list enums:

```java
public enum UserAccountRole { USER, ADVISER }
public enum ConsultationStatus { NEW, IN_PROGRESS, COMPLETED }
```

The migration must perform these operations in order:

```sql
ALTER TABLE user_accounts
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD CONSTRAINT ck_user_accounts_role CHECK (role IN ('USER', 'ADVISER'));

ALTER TABLE consultation_enquiries DROP CONSTRAINT ck_consultation_enquiries_status;
ALTER TABLE consultation_enquiries
    ADD CONSTRAINT ck_consultation_enquiries_status
        CHECK (status IN ('NEW', 'IN_PROGRESS', 'COMPLETED')),
    ADD COLUMN status_updated_at TIMESTAMPTZ,
    ADD COLUMN status_updated_by_user_id BIGINT,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

UPDATE consultation_enquiries
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

ALTER TABLE consultation_enquiries
    ALTER COLUMN status_updated_at SET NOT NULL,
    ADD CONSTRAINT fk_consultation_status_updated_by
        FOREIGN KEY (status_updated_by_user_id) REFERENCES user_accounts(id) ON DELETE RESTRICT;

CREATE INDEX idx_consultation_enquiries_status_created
    ON consultation_enquiries (status, created_at DESC, id DESC);
```

- [ ] **Step 4: Map the new columns in the entities**

Use `@Enumerated(EnumType.STRING)` for role and status, initialise new accounts with `USER`, initialise new enquiries with `NEW`, set `statusUpdatedAt` to `createdAt`, and map the optimistic value with `@Version`:

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private UserAccountRole role = UserAccountRole.USER;

@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private ConsultationStatus status;

@Version
@Column(nullable = false)
private long version;
```

Do not add a public role setter to `UserAccount`.

- [ ] **Step 5: Run migration and existing consultation/auth schema tests**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationSchemaIntegrationTest,V3MigrationCompatibilityTest,ConsultationSchemaIntegrationTest,AuthSchemaIntegrationTest test
```

Expected: PASS with V11 as the latest migration and existing rows preserved.

- [ ] **Step 6: Commit Task 1**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: add adviser role and consultation workflow schema"
```

---

### Task 2: Load adviser authority into authenticated sessions

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/session/UserPrincipal.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/api/AuthSessionResponse.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/auth/session/AuthenticationServiceExternalSessionTest.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/auth/api/AuthSecurityHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/auth/api/AdviserAuthorizationHttpIntegrationTest.java`

**Interfaces:**
- Consumes: `UserAccount#getRole()` from Task 1.
- Produces: `UserPrincipal#isAdviser(): boolean`.
- Produces: `AuthSessionResponse(boolean authenticated, Long userId, String fullName, boolean adviser)`.
- Protects: every `/api/v1/adviser/**` request with `ROLE_ADVISER`.

- [ ] **Step 1: Write failing authority and session tests**

Cover both stored roles:

```java
assertThat(UserPrincipal.from(userAccount).getAuthorities())
    .extracting(GrantedAuthority::getAuthority)
    .containsExactly("ROLE_USER");

assertThat(UserPrincipal.from(adviserAccount).getAuthorities())
    .extracting(GrantedAuthority::getAuthority)
    .containsExactly("ROLE_USER", "ROLE_ADVISER");
```

For HTTP security, verify anonymous access returns 401, `roles("USER")` returns 403, and `roles("USER", "ADVISER")` reaches a test adviser endpoint instead of failing at the filter chain. Verify `/api/v1/auth/session` returns `"adviser": true` only for an adviser principal.

- [ ] **Step 2: Run focused auth tests and verify RED**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AuthenticationServiceExternalSessionTest,AuthSecurityHttpIntegrationTest,AdviserAuthorizationHttpIntegrationTest test
```

Expected: FAIL because principals always return only `ROLE_USER`, the session DTO lacks `adviser`, and adviser paths are not protected.

- [ ] **Step 3: Implement role-aware principal and session DTO**

Store the role in `UserPrincipal`, return deterministic authorities, and expose a boolean capability:

```java
public boolean isAdviser() {
    return role == UserAccountRole.ADVISER;
}

@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    if (isAdviser()) {
        return List.of(
            new SimpleGrantedAuthority("ROLE_USER"),
            new SimpleGrantedAuthority("ROLE_ADVISER")
        );
    }
    return List.of(new SimpleGrantedAuthority("ROLE_USER"));
}
```

Anonymous session responses must set `adviser` to `false`.

- [ ] **Step 4: Protect the adviser API prefix before permissive matchers**

Add this matcher before `.anyRequest().permitAll()`:

```java
.requestMatchers("/api/v1/adviser/**").hasRole("ADVISER")
```

Do not weaken the existing public consultation POST rule.

- [ ] **Step 5: Run focused and full auth tests**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest='com.yangdoujiao.website.auth.**' test
```

Expected: PASS; anonymous, user, and adviser behaviours remain distinct.

- [ ] **Step 6: Commit Task 2**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: enforce adviser session authority"
```

---

### Task 3: Add paginated adviser consultation read APIs

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationEnquiryRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationSummary.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationDetail.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationPage.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationStatusCounts.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationReadHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationServiceTest.java`

**Interfaces:**
- Produces: `GET /api/v1/adviser/consultations?page=0&size=20&status=NEW&query=Lim`.
- Produces: `GET /api/v1/adviser/consultations/{referenceCode}`.
- Produces strict DTO fields used by `frontend/src/lib/adviser-consultation-api.ts` in Task 5.
- Consumes: role protection from Task 2 and workflow fields from Task 1.

- [ ] **Step 1: Write failing service tests for bounds and filter semantics**

Test these exact rules:

- page is zero-based and cannot be negative;
- size defaults to 20 and must be between 1 and 100;
- query is trimmed, empty becomes absent, and length above 100 is rejected;
- status is an optional enum, not an arbitrary string;
- query matches case-insensitive name or contact text and an exact UUID reference;
- status and query combine with AND;
- page content and `totalElements` come from the same `Specification`;
- results sort by `createdAt DESC, id DESC`.

Use independent records so a record matching only the status and another matching only the query do not appear when both filters are active.

- [ ] **Step 2: Write failing protected HTTP tests**

Create three consultations through fixtures, then assert:

```java
mockMvc.perform(get("/api/v1/adviser/consultations")
        .with(user(adviserPrincipal)))
    .andExpect(status().isOk())
    .andExpect(header().string("Cache-Control", containsString("no-store")))
    .andExpect(jsonPath("$.items[0].referenceCode").value(newestReference.toString()))
    .andExpect(jsonPath("$.page").value(0))
    .andExpect(jsonPath("$.size").value(20));
```

Also assert anonymous 401, ordinary user 403, missing reference 404, and complete detail fields for an adviser.

- [ ] **Step 3: Run read API tests and verify RED**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationServiceTest,AdviserConsultationReadHttpIntegrationTest test
```

Expected: FAIL because the adviser controller, service, DTOs, and specification support do not exist.

- [ ] **Step 4: Implement repository specifications and DTOs**

Extend the repository with `JpaSpecificationExecutor<ConsultationEnquiry>` and `findByReferenceCode(UUID)`. Keep filter construction in `AdviserConsultationService`; do not expose JPA entities from the controller.

Define the page contract with stable names:

```java
public record AdviserConsultationPage(
    List<AdviserConsultationSummary> items,
    int page,
    int size,
    long totalElements,
    int totalPages,
    ConsultationStatusCounts counts
) {}
```

`AdviserConsultationSummary` includes reference code, name, contact, intended school, intended course, qualification, status, created time, status-updated time, and version. `AdviserConsultationDetail` adds notes, locale, privacy notice version, and status updater account ID.

- [ ] **Step 5: Implement bounded service and controller reads**

Apply one composed `Specification` to `repository.findAll(specification, pageable)`. Calculate the three global status counts with repository count queries so the overview does not change when a search filter is active. Add `Cache-Control: no-store, private` on successful read responses.

- [ ] **Step 6: Run focused read tests**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationServiceTest,AdviserConsultationReadHttpIntegrationTest test
```

Expected: PASS with stable pagination, AND filter semantics, and protected details.

- [ ] **Step 7: Commit Task 3**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: expose adviser consultation read APIs"
```

---

### Task 4: Add guarded status updates and privacy-safe audit logging

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationEnquiryRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationService.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationStatusUpdateRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationStatusUpdateResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/consultation/ConsultationAuditLogger.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationStatusHttpIntegrationTest.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/consultation/ConsultationAuditLoggerTest.java`

**Interfaces:**
- Produces: `PATCH /api/v1/adviser/consultations/{referenceCode}/status` with body `{ "status": "IN_PROGRESS", "version": 0 }`.
- Produces: response containing reference code, new status, status-updated time, updater account ID, and incremented version.
- Consumes: authenticated `UserPrincipal#userId()` and Task 1 version column.

- [ ] **Step 1: Write failing status endpoint tests**

Verify:

- adviser plus valid CSRF changes `NEW` to `IN_PROGRESS`;
- database source fields are byte-for-byte unchanged;
- missing CSRF returns 403;
- ordinary user returns 403;
- unsupported or missing status returns 400;
- missing record returns 404;
- stale version returns 409 and does not change the newer state;
- updater ID and UTC timestamp are stored;
- retrying the same status with the current version succeeds and increments version once.

- [ ] **Step 2: Write the failing audit logger test**

Capture logger output and assert it includes event name, outcome, actor ID, a hashed reference identifier, prior status, new status, and trace ID. Assert it does not contain fixture name, contact, school, course, or notes.

- [ ] **Step 3: Run status tests and verify RED**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationStatusHttpIntegrationTest,ConsultationAuditLoggerTest test
```

Expected: FAIL because no PATCH endpoint, guarded update, or audit logger exists.

- [ ] **Step 4: Implement a guarded repository update**

Use one atomic update constrained by reference and version:

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("""
    update ConsultationEnquiry enquiry
       set enquiry.status = :status,
           enquiry.statusUpdatedAt = :updatedAt,
           enquiry.statusUpdatedByUserId = :actorId,
           enquiry.version = enquiry.version + 1
     where enquiry.referenceCode = :referenceCode
       and enquiry.version = :expectedVersion
    """)
int updateStatus(UUID referenceCode, ConsultationStatus status, OffsetDateTime updatedAt,
                 long actorId, long expectedVersion);
```

The service first loads the record to distinguish 404 from conflict and to capture the prior status, then runs the guarded update in one transaction. A zero update count after a successful lookup maps to an API 409 conflict.

- [ ] **Step 5: Implement the PATCH route and audit outcomes**

Use bean validation on the request record, `@AuthenticationPrincipal UserPrincipal`, UTC timestamps, and the existing trace ID mechanism. Audit both successful and rejected status attempts without logging consultation fields.

- [ ] **Step 6: Run status, read, and public submission tests**

Run:

```bash
cd backend
./mvnw --batch-mode -Dtest=AdviserConsultationStatusHttpIntegrationTest,ConsultationAuditLoggerTest,AdviserConsultationReadHttpIntegrationTest,ConsultationHttpIntegrationTest test
```

Expected: PASS and public submission remains unaffected.

- [ ] **Step 7: Commit Task 4**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: track adviser consultation status"
```

---

### Task 5: Add frontend adviser access policy and strict API client

**Files:**
- Modify: `frontend/src/lib/auth-session-core.ts`
- Modify: `frontend/src/lib/access-policy.ts`
- Modify: `frontend/src/lib/proxy-policy.ts`
- Modify: `frontend/src/proxy.ts`
- Create: `frontend/src/lib/adviser-consultation-api.ts`
- Modify: `frontend/src/lib/auth-session-core.test.ts`
- Modify: `frontend/src/lib/access-policy.test.ts`
- Modify: `frontend/src/proxy.test.ts`
- Create: `frontend/src/lib/adviser-consultation-api.test.ts`

**Interfaces:**
- Produces: `SessionAccess { authenticated: boolean; adviser: boolean }`.
- Produces: `loadSessionAccess(apiBaseUrl, cookieHeader, request, clientAddress): Promise<SessionAccess>`.
- Produces: strict TypeScript types mirroring the Task 3 and Task 4 DTOs.
- Consumes: backend session field `adviser` and adviser API contracts.

- [ ] **Step 1: Write failing session and route-policy tests**

Add cases for anonymous, ordinary authenticated, adviser authenticated, malformed session JSON, and backend failure. Assert:

- `/zh/adviser/consultations` is protected;
- anonymous visitors redirect to `/zh/login?returnTo=%2Fzh%2Fadviser%2Fconsultations`;
- signed-in non-advisers redirect to `/zh/forbidden`;
- advisers continue to the requested page;
- demo-session cookies never grant adviser access.

- [ ] **Step 2: Write failing strict API-client tests**

Use stubbed fetch responses to assert exact URL construction, repeated filter safety, `cache: "no-store"`, credentials, CSRF retrieval before PATCH, and rejection of malformed page/detail/status payloads. Verify 401, 403, 404, 409, and network failures remain distinct client states.

- [ ] **Step 3: Run frontend unit tests and verify RED**

Run:

```bash
cd frontend
node --test src/lib/auth-session-core.test.ts src/lib/access-policy.test.ts src/proxy.test.ts src/lib/adviser-consultation-api.test.ts
```

Expected: FAIL because adviser session capabilities, policy rules, and the API client do not exist.

- [ ] **Step 4: Implement role-aware session loading and proxy policy**

Replace the boolean-only lookup internally with:

```ts
export type SessionAccess = { authenticated: boolean; adviser: boolean };

export async function loadSessionAccess(
  apiBaseUrl: string | undefined,
  cookieHeader: string | null | undefined,
  request: typeof fetch = fetch,
  clientAddress?: string | null,
): Promise<SessionAccess> {
  if (!apiBaseUrl || !cookieHeader || typeof request !== "function") {
    return { authenticated: false, adviser: false };
  }
  try {
    const response = await requestInternalApi(request, `${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/session`, {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
      signal: AbortSignal.timeout(5_000),
    }, clientAddress);
    if (!response.ok) return { authenticated: false, adviser: false };
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return { authenticated: false, adviser: false };
    }
    const record = payload as Record<string, unknown>;
    return record.authenticated === true
      ? { authenticated: true, adviser: record.adviser === true }
      : { authenticated: false, adviser: false };
  } catch {
    return { authenticated: false, adviser: false };
  }
}
```

Keep `hasAuthenticatedSession` as a compatibility wrapper for its existing callers. Adviser routes must call `loadSessionAccess`; ordinary protected routes retain their current behaviour.

- [ ] **Step 5: Implement strict adviser API parsing**

Export:

```ts
loadAdviserConsultations(baseUrl, filters, request?): Promise<AdviserListResult>
loadAdviserConsultation(baseUrl, referenceCode, request?): Promise<AdviserDetailResult>
updateAdviserConsultationStatus(baseUrl, referenceCode, status, version, request?): Promise<AdviserUpdateResult>
```

Do not render backend error messages directly. Validate every enum, UUID, timestamp, page number, count, and optional field before returning a `ready` result.

- [ ] **Step 6: Run focused frontend tests**

Run:

```bash
cd frontend
node --test src/lib/auth-session-core.test.ts src/lib/access-policy.test.ts src/proxy.test.ts src/lib/adviser-consultation-api.test.ts
```

Expected: PASS for anonymous, user, adviser, stale update, and malformed-payload cases.

- [ ] **Step 7: Commit Task 5**

```bash
git add frontend/src/lib frontend/src/proxy.ts frontend/src/proxy.test.ts
git commit -m "feat: protect adviser frontend access"
```

---

### Task 6: Build the consultation administration interface

**Files:**
- Create: `frontend/src/app/[locale]/adviser/consultations/page.tsx`
- Create: `frontend/src/app/[locale]/forbidden/page.tsx`
- Create: `frontend/src/components/adviser-consultations-panel.tsx`
- Modify: `frontend/src/app/globals.css`
- Create: `frontend/src/lib/adviser-consultations-ui.test.ts`
- Modify: `frontend/src/app/globals.test.ts`

**Interfaces:**
- Consumes: Task 5 API-client functions and result unions.
- Produces: localised `/zh/adviser/consultations` and `/en/adviser/consultations` pages.
- Produces: query parameters `query`, `status`, and one-based `page` for browser-visible navigation while converting to zero-based backend pagination.

- [ ] **Step 1: Write failing page-structure and behaviour tests**

Assert the source includes:

- page metadata with `robots: { index: false, follow: false }`;
- bilingual title and status labels;
- search input and status select with visible labels;
- table columns for submission time, name, contact, university, course, qualification, and status;
- a details control with the full stored fields;
- pending, empty, error, forbidden, and stale-conflict messages;
- URL query updates and page reset when search or status changes;
- an `AbortController` or monotonically increasing request token preventing an older response from replacing newer filters;
- no delete or export control.

- [ ] **Step 2: Run the UI tests and verify RED**

Run:

```bash
cd frontend
node --test src/lib/adviser-consultations-ui.test.ts src/app/globals.test.ts
```

Expected: FAIL because the adviser pages, panel, and styles do not exist.

- [ ] **Step 3: Implement the no-index page shells**

The adviser page validates locale, renders the existing focused authenticated shell pattern, and mounts `AdviserConsultationsPanel`. The forbidden page gives a clear bilingual access-denied message with links back to the account page and public home.

- [ ] **Step 4: Implement list state and stable URL navigation**

Use controlled filters, debounce text search by 250–350 ms, and update the URL with `router.replace`. Reset `page=1` whenever query or status changes. Keep loading, error, and empty results separate. Cancel the previous fetch before starting a new one and ignore responses from aborted requests.

- [ ] **Step 5: Implement accessible detail and status controls**

Use a real dialog or an in-page details region with a clear heading and close control. Keep labels paired with values, preserve long notes, and provide a 44px minimum status action target. On 409, retain the current screen, show the bilingual stale-data warning, and reload the selected record before allowing another update.

- [ ] **Step 6: Add responsive styles without changing public layouts**

Scope all selectors below `.adviser-consultations`. Desktop uses a table; narrow viewports convert rows into labelled cards without horizontal page scrolling. Use existing colour tokens, focus styles, borders, and spacing. Contact details must wrap rather than overflow.

- [ ] **Step 7: Run UI tests, lint, and production build**

Run:

```bash
cd frontend
node --test src/lib/adviser-consultations-ui.test.ts src/app/globals.test.ts
npm run lint
npm run build
```

Expected: all commands exit 0; the build lists both localised dynamic adviser routes through `[locale]`.

- [ ] **Step 8: Commit Task 6**

```bash
git add frontend/src/app frontend/src/components frontend/src/lib frontend/src/app/globals.css
git commit -m "feat: add adviser consultation dashboard"
```

---

### Task 7: Add production setup runbook and perform complete verification

**Files:**
- Create: `docs/runbooks/adviser-consultation-admin.md`

**Interfaces:**
- Consumes: the completed role, API, UI, and migration implementation.
- Produces: exact promotion, rollback, deployment, and smoke commands for production operators.

- [ ] **Step 1: Write the production promotion transaction**

Document a command that runs against the production Postgres container and uses this exact transaction shape:

```sql
BEGIN;
DO $$
DECLARE changed_rows integer;
BEGIN
  UPDATE user_accounts
     SET role = 'ADVISER', updated_at = CURRENT_TIMESTAMP
   WHERE normalized_email = 'udajoedu@gmail.com'
     AND status = 'ACTIVE';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active adviser account, changed %', changed_rows;
  END IF;
END $$;
COMMIT;
```

Precede it with read-only checks for exact email count, status, verification timestamp, and current role. Include a rollback transaction that changes exactly this active account back to `USER` and asserts one changed row. Do not include a password.

- [ ] **Step 2: Document deployment and privacy-safe smoke verification**

The runbook must require:

1. merge only after CI passes;
2. deploy through the existing production workflow;
3. verify Flyway reaches V11 and all containers are healthy;
4. register and verify `udajoedu@gmail.com` before promotion;
5. promote the account and sign in again;
6. confirm anonymous receives 401 from the adviser API;
7. confirm an ordinary user receives 403;
8. confirm the adviser can list, read, and update a dedicated test consultation;
9. remove the dedicated test consultation only with a reviewed SQL command after verification;
10. inspect logs by trace ID without printing consultation contents.

- [ ] **Step 3: Run the complete backend suite**

Run:

```bash
cd backend
./mvnw --batch-mode test
```

Expected: all backend tests pass with zero failures and zero errors.

- [ ] **Step 4: Run the complete frontend suite**

Run:

```bash
cd frontend
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 5: Run repository and deployment checks**

Run from the repository root:

```bash
git diff --check
docker compose --env-file .env.example -f compose.yaml config >/dev/null
node --test scripts/deployment-compose.test.mjs scripts/deployment-preflight.test.mjs scripts/deployment-cd.test.mjs
```

Expected: all commands exit 0 without printing production secrets.

- [ ] **Step 6: Review the final diff against the spec**

Confirm the diff contains no delete/export controls, no role self-service, no hardcoded password, no consultation PII in logs, and no weakening of public or account security rules. Confirm every requirement in `docs/superpowers/specs/2026-10-06-adviser-consultation-admin-design.md` maps to a test or runbook check.

- [ ] **Step 7: Commit Task 7**

```bash
git add docs/runbooks/adviser-consultation-admin.md
git commit -m "docs: add adviser dashboard production runbook"
```

---

## Final Pull Request Checklist

- [ ] Rebase the feature branch on the latest `origin/main` without discarding unrelated user work.
- [ ] Run `git status --short` and confirm only intended files are tracked.
- [ ] Run the complete backend and frontend verification commands from Task 7 after the final rebase.
- [ ] Create a PR summarising schema changes, security boundaries, user-visible workflow, test evidence, and the manual production promotion step.
- [ ] Do not claim production verification until the merged build is deployed and the adviser smoke test is completed with `udajoedu@gmail.com`.
