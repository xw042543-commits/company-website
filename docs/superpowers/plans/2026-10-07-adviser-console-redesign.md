# Adviser Consultation Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive adviser consultation console that exposes submitted enquiry details and accurately reports whether public consultation collection is enabled.

**Architecture:** Extend the existing adviser list response with a read-only `submissionEnabled` flag sourced from Spring configuration, then preserve the strict frontend boundary parser. Reshape the current client panel into an accessible master-detail workspace and make the adviser route use a focused shell without changing authentication, filtering, pagination, or optimistic-concurrency behavior.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA, JUnit 5/Mockito, TypeScript, React 19, Next.js 16 App Router, Node test runner, CSS

**Spec:** `docs/superpowers/specs/2026-10-07-adviser-console-redesign.md`

## Global Constraints

- Reuse the existing UDAJO green design tokens and do not add a UI dependency.
- Keep `/api/v1/adviser/**` restricted to `ADVISER` users.
- Do not add delete, export, bulk-edit, public sharing, or production configuration mutation.
- Preserve search, status filtering, one-based pagination, request cancellation, conflict recovery, and versioned status updates.
- Keep API parsing strict: malformed, missing, or extra fields fail closed.
- All touch controls must be at least 44 px high on narrow screens.
- Production submission remains controlled by `APP_CONSULTATION_SUBMISSION_ENABLED` and `APP_CONSULTATION_PRIVACY_NOTICE_VERSION`; this change only reports state.

---

### Task 1: Expose the consultation collection state through the adviser list contract

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationPage.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationService.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationServiceTest.java`
- Modify: `frontend/src/lib/adviser-consultation-api.ts`
- Modify: `frontend/src/lib/adviser-consultation-api.test.ts`

**Interfaces:**
- Consumes: Spring property `app.consultation.submission-enabled`.
- Produces: `AdviserConsultationPage.submissionEnabled: boolean` in Java and TypeScript.

- [ ] **Step 1: Write failing backend tests for both configuration states**

Update the test fixture to construct the service with a boolean and add:

```java
@Test
void listReportsWhetherPublicSubmissionIsEnabled() {
    AdviserConsultationService enabled = new AdviserConsultationService(
            repository, new ConsultationAuditLogger(), true);
    AdviserConsultationService paused = new AdviserConsultationService(
            repository, new ConsultationAuditLogger(), false);

    assertThat(enabled.list(0, 20, null, null).submissionEnabled()).isTrue();
    assertThat(paused.list(0, 20, null, null).submissionEnabled()).isFalse();
}
```

Change every existing constructor call in this test to pass `false` as the third argument.

- [ ] **Step 2: Run the focused backend test and verify failure**

Run: `(cd backend && ./mvnw -q -Dtest=AdviserConsultationServiceTest test)`

Expected: compilation fails because the constructor has no boolean parameter and `submissionEnabled()` does not exist.

- [ ] **Step 3: Add the backend response field and property injection**

Change the page record to:

```java
public record AdviserConsultationPage(
        List<AdviserConsultationSummary> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        ConsultationStatusCounts counts,
        boolean submissionEnabled
) {}
```

Add the field and constructor parameter:

```java
private final boolean submissionEnabled;

public AdviserConsultationService(
        ConsultationEnquiryRepository repository,
        ConsultationAuditLogger audit,
        @Value("${app.consultation.submission-enabled:false}") boolean submissionEnabled) {
    this.repository = repository;
    this.audit = audit;
    this.submissionEnabled = submissionEnabled;
}
```

Return it from `list`:

```java
return new AdviserConsultationPage(
        result.getContent().stream().map(AdviserConsultationSummary::from).toList(),
        result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(),
        counts, submissionEnabled);
```

- [ ] **Step 4: Run the backend test and verify it passes**

Run: `(cd backend && ./mvnw -q -Dtest=AdviserConsultationServiceTest test)`

Expected: PASS.

- [ ] **Step 5: Write failing frontend contract tests**

Change the valid fixture to include `submissionEnabled: true`, then add malformed cases:

```ts
const page = {
  items: [summary], page: 0, size: 20, totalElements: 1, totalPages: 1,
  counts: { newCount: 1, inProgressCount: 0, completedCount: 0 },
  submissionEnabled: true,
};

for (const payload of [
  { ...page, submissionEnabled: undefined },
  { ...page, submissionEnabled: "true" },
]) {
  assert.deepEqual(
    await loadAdviserConsultations(base, {}, queue([Response.json(payload)]).request),
    { status: "error" },
  );
}
```

- [ ] **Step 6: Run the frontend contract test and verify failure**

Run: `(cd frontend && npm run test:adviser)`

Expected: the strict parser rejects the newly valid fixture because its exact key list is unchanged.

- [ ] **Step 7: Update the strict TypeScript page parser**

Add the field to the type and exact parser:

```ts
export type AdviserConsultationPage = {
  items: AdviserConsultationSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  counts: ConsultationStatusCounts;
  submissionEnabled: boolean;
};
```

In `parsePage`, require the key and type:

```ts
exact(value, ["items", "page", "size", "totalElements", "totalPages", "counts", "submissionEnabled"])
  && typeof value.submissionEnabled === "boolean"
```

- [ ] **Step 8: Run focused backend and frontend tests**

Run: `(cd backend && ./mvnw -q -Dtest=AdviserConsultationServiceTest test)`

Run: `(cd frontend && npm run test:adviser)`

Expected: both PASS.

- [ ] **Step 9: Commit the contract change**

```bash
git add backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationPage.java \
  backend/src/main/java/com/yangdoujiao/website/consultation/AdviserConsultationService.java \
  backend/src/test/java/com/yangdoujiao/website/consultation/AdviserConsultationServiceTest.java \
  frontend/src/lib/adviser-consultation-api.ts frontend/src/lib/adviser-consultation-api.test.ts
git commit -m "feat: expose consultation collection state"
```

### Task 2: Add focused adviser route chrome and contact helpers

**Files:**
- Modify: `frontend/src/components/site-chrome.tsx`
- Modify: `frontend/src/lib/adviser-consultations-ui.ts`
- Modify: `frontend/src/lib/adviser-consultations-ui.test.ts`

**Interfaces:**
- Consumes: current locale-prefixed pathname and raw consultation contact string.
- Produces: `contactAction(contact: string): { kind: "email" | "phone"; href: string } | null` and focused chrome for `/{locale}/adviser/**`.

- [ ] **Step 1: Write failing helper tests for safe contact actions**

Add:

```ts
test("contact actions only link validated email addresses and phone numbers", async () => {
  const { contactAction } = await import("./adviser-consultations-ui.ts");
  assert.deepEqual(contactAction(" student@example.com "),
    { kind: "email", href: "mailto:student@example.com" });
  assert.deepEqual(contactAction("+60 12-345 6789"),
    { kind: "phone", href: "tel:+60123456789" });
  for (const unsafe of ["wechat:student", "hello world", "javascript:alert(1)", "a@b"]) {
    assert.equal(contactAction(unsafe), null);
  }
});
```

- [ ] **Step 2: Run the helper test and verify failure**

Run: `(cd frontend && npm run test:adviser)`

Expected: FAIL because `contactAction` is not exported.

- [ ] **Step 3: Implement the contact helper**

Add:

```ts
export function contactAction(contact: string): { kind: "email" | "phone"; href: string } | null {
  const value = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { kind: "email", href: `mailto:${value}` };
  if (/^\+?[0-9][0-9 ()-]{6,20}$/.test(value)) {
    const number = `${value.startsWith("+") ? "+" : ""}${value.replace(/\D/g, "")}`;
    return { kind: "phone", href: `tel:${number}` };
  }
  return null;
}
```

- [ ] **Step 4: Extend the route chrome test before implementation**

In the existing route test, load `site-chrome.tsx` and assert it recognises adviser routes:

```ts
const chrome = source("../components/site-chrome.tsx");
assert.match(chrome, /startsWith\(`\/\$\{locale\}\/adviser\/`\)/);
```

- [ ] **Step 5: Run UI tests and verify the chrome assertion fails**

Run: `(cd frontend && npm run test:adviser)`

Expected: contact helper passes and adviser route assertion fails.

- [ ] **Step 6: Make adviser routes use focused chrome**

Replace the auth-only condition with:

```tsx
const isFocusedPortal = [
  `/${locale}/login`, `/${locale}/register`, `/${locale}/forgot-password`,
].includes(pathname) || pathname.startsWith(`/${locale}/adviser/`);

if (isFocusedPortal) return <div lang={language} className={pathname.startsWith(`/${locale}/adviser/`) ? "adviser-portal" : undefined}>
  <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
  {children}
</div>;
```

- [ ] **Step 7: Run the focused UI tests**

Run: `(cd frontend && npm run test:adviser)`

Expected: PASS.

- [ ] **Step 8: Commit the focused shell and helper**

```bash
git add frontend/src/components/site-chrome.tsx frontend/src/lib/adviser-consultations-ui.ts \
  frontend/src/lib/adviser-consultations-ui.test.ts
git commit -m "feat: add focused adviser workspace shell"
```

### Task 3: Build the accessible master-detail consultation workspace

**Files:**
- Modify: `frontend/src/app/[locale]/adviser/consultations/page.tsx`
- Modify: `frontend/src/components/adviser-consultations-panel.tsx`
- Modify: `frontend/src/lib/adviser-consultations-ui.test.ts`

**Interfaces:**
- Consumes: `AdviserConsultationPage.submissionEnabled`, `contactAction`, existing API functions, filter helpers, and conflict helpers.
- Produces: compact record list, status filter cards, collection-state banner, master-detail panel, and collapsed system metadata.

- [ ] **Step 1: Replace brittle content assertions with behavior-oriented structural acceptance checks**

Update the dashboard test to assert the user-visible contract:

```ts
test("adviser workspace exposes collection state, master-detail controls and protected actions", () => {
  const panel = source("../components/adviser-consultations-panel.tsx");
  for (const phrase of [
    "咨询收集已启用", "咨询收集已暂停", "Consultation collection is active",
    "Consultation collection is paused", "系统信息", "System information",
    "联系邮箱", "拨打电话", "Email contact", "Call contact",
  ]) assert.ok(panel.includes(phrase), `missing ${phrase}`);
  assert.match(panel, /data-selected=/);
  assert.match(panel, /aria-controls="consultation-detail"/);
  assert.match(panel, /<details className="adviser-system-info">/);
  assert.match(panel, /contactAction\(detail\.contact\)/);
  assert.doesNotMatch(panel, /deleteAccount|\bexport(?:Csv|CSV|Data)\b|>\s*(?:Delete|Export|删除|导出)\s*</);
});
```

Keep the existing filter, request-cancellation, conflict, authorization, locale, and no-delete/export assertions.

- [ ] **Step 2: Run the UI test and verify failure**

Run: `(cd frontend && npm run test:adviser)`

Expected: FAIL because the current panel has no collection-state banner, contact action, or system disclosure.

- [ ] **Step 3: Simplify the server page into a workspace header**

Render a compact brand mark, bilingual workspace label, title, help text, and account link. Keep `metadata.robots`, locale validation, `main#main`, `Suspense`, and the existing panel mount. Use this structure:

```tsx
<main id="main" className="adviser-console">
  <div className="adviser-console-shell">
    <header className="adviser-console-header">
      <Link className="adviser-console-brand" href={`/${locale}`} aria-label={words(locale, "返回洋豆角首页", "Return to UDAJO home")}>
        <Image src="/brand/udajo-logo-transparent.png" width={1254} height={1254} sizes="44px" alt="" />
        <span><strong>UDAJO</strong><small>{words(locale, "顾问后台", "Adviser console")}</small></span>
      </Link>
      <div className="adviser-console-heading">
        <p className="eyebrow">{words(locale, "顾问工作台", "Adviser workspace")}</p>
        <h1>{words(locale, "咨询管理", "Consultations")}</h1>
        <p>{words(locale, "查看客户提交的留学需求并持续跟进。", "Review submitted study-abroad needs and keep every enquiry moving.")}</p>
      </div>
      <Link className="button secondary" href={`/${locale}/account`}>{words(locale, "我的账户", "My account")}</Link>
    </header>
    <Suspense fallback={<p role="status">{words(locale, "正在载入咨询…", "Loading consultations…")}</p>}>
      <AdviserConsultationsPanel locale={locale} />
    </Suspense>
  </div>
</main>
```

- [ ] **Step 4: Reshape the panel without changing request state logic**

Keep all existing hooks, effects, access handling, stale-response protection, status saving, and filter URL behavior. Replace only the rendered information architecture:

```tsx
<div className="adviser-panel">
  <section className={`adviser-collection-state ${data?.submissionEnabled ? "is-active" : "is-paused"}`} role="status">
    <div>
      <strong>{data?.submissionEnabled
        ? words(locale, "咨询收集已启用", "Consultation collection is active")
        : words(locale, "咨询收集已暂停", "Consultation collection is paused")}</strong>
      <span>{data?.submissionEnabled
        ? words(locale, "网站访客可以提交新的咨询资料。", "Website visitors can submit new enquiries.")
        : words(locale, "当前不会收到新咨询；已有记录仍可查看和跟进。", "New submissions are paused; existing records remain available.")}</span>
    </div>
    <p>{words(locale, "当前账户", "Signed-in account")}: {identity ?? words(locale, "正在载入…", "Loading…")}</p>
  </section>
  <div className="adviser-counts" role="group" aria-label={words(locale, "按状态筛选", "Filter by status")}>
    {/* all, NEW, IN_PROGRESS, COMPLETED buttons; use consultationQuery and reset page */}
  </div>
  <div className="adviser-filters">{/* existing search and select controls */}</div>
  <div className="adviser-master-detail">
    <section className="adviser-list" aria-label={words(locale, "咨询列表", "Consultation list")}>
      {/* existing loading/error/empty states */}
      <ol className="adviser-records">
        {/* each button shows name/contact, school/course summary, qualification, time, and labelled status */}
      </ol>
      {/* existing pagination */}
    </section>
    <aside id="consultation-detail" className="adviser-detail" aria-labelledby="consultation-detail-title">
      {/* selected detail, or a calm empty-selection prompt */}
    </aside>
  </div>
</div>
```

Each record opener must include `data-selected={selected === item.referenceCode}` and retain `aria-expanded`, `aria-controls`, `opener.current`, `setSelected`, and `loadDetail`.

- [ ] **Step 5: Add safe contact actions and grouped detail fields**

Compute `const action = detail ? contactAction(detail.contact) : null;`. In the detail panel render:

```tsx
{action && <a className="button adviser-contact-action" href={action.href}>
  {action.kind === "email" ? words(locale, "联系邮箱", "Email contact") : words(locale, "拨打电话", "Call contact")}
</a>}
```

Place name, contact, school, course, qualification, notes, and current status in the visible detail body. Move the technical values into:

```tsx
<details className="adviser-system-info">
  <summary>{words(locale, "系统信息", "System information")}</summary>
  <dl>
    {/* referenceCode, locale, privacyNoticeVersion, createdAt, statusUpdatedAt,
        statusUpdatedByUserId, version */}
  </dl>
</details>
```

Keep the existing versioned status form, saved live message, conflict alert, reload action, close action, and focus restoration.

- [ ] **Step 6: Run focused frontend tests**

Run: `(cd frontend && npm run test:adviser)`

Expected: PASS.

- [ ] **Step 7: Commit the workspace markup**

```bash
git add frontend/src/app/'[locale]'/adviser/consultations/page.tsx \
  frontend/src/components/adviser-consultations-panel.tsx \
  frontend/src/lib/adviser-consultations-ui.test.ts
git commit -m "feat: redesign adviser consultation workspace"
```

### Task 4: Apply responsive visual hierarchy and accessibility polish

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/globals.test.ts`

**Interfaces:**
- Consumes: class names from Task 3.
- Produces: desktop master-detail grid, sticky detail panel, mobile stacked cards, and accessible focus/motion behavior.

- [ ] **Step 1: Add failing CSS contract checks**

Extend the existing visual polish test:

```ts
for (const selector of [
  ".adviser-console-shell", ".adviser-collection-state", ".adviser-master-detail",
  ".adviser-records", ".adviser-record", ".adviser-system-info",
]) assert.match(css, new RegExp(selector.replace(".", "\\.")));
assert.match(css, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(320px,\s*0\.72fr\)/);
assert.match(css, /\.adviser-detail[^}]*position:\s*sticky/s);
assert.match(css, /@media\s*\(max-width:\s*800px\)/);
assert.match(css, /min-height:\s*44px/);
```

- [ ] **Step 2: Run the visual test and verify failure**

Run: `(cd frontend && npm test)`

Expected: FAIL because the new dashboard selectors do not exist.

- [ ] **Step 3: Replace the old adviser CSS block with scoped console styles**

Define:

```css
.adviser-portal {
  min-height: 100vh;
  color: var(--ink);
  background: linear-gradient(135deg, #f4f8f5 0%, #edf4f1 55%, #f7f4eb 100%);
}
.adviser-console { min-height: 100vh; padding: clamp(20px, 3vw, 44px); }
.adviser-console-shell { width: min(1480px, 100%); margin: 0 auto; }
.adviser-master-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.72fr);
  gap: 20px;
  align-items: start;
}
.adviser-detail { position: sticky; top: 20px; }
.adviser-record { min-height: 88px; width: 100%; text-align: left; }
.adviser-record:focus-visible,
.adviser-count-card:focus-visible,
.adviser-system-info summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
```

Use existing variables for colour, borders, radii, shadows, and typography. Give the collection banner active/paused variants, keep status labels textual, and ensure long contact/course text wraps with `overflow-wrap: anywhere`.

- [ ] **Step 4: Add narrow-screen and reduced-motion rules**

Add:

```css
@media (max-width: 800px) {
  .adviser-console { padding: 14px; }
  .adviser-console-header { grid-template-columns: 1fr; }
  .adviser-master-detail { grid-template-columns: 1fr; }
  .adviser-detail { position: static; }
  .adviser-counts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .adviser-record, .adviser-count-card, .adviser-contact-action,
  .adviser-pagination button, .adviser-detail button { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .adviser-record, .adviser-count-card { transition: none; }
}
```

- [ ] **Step 5: Run visual and UI tests**

Run: `(cd frontend && npm test)`

Expected: PASS.

- [ ] **Step 6: Commit the responsive styling**

```bash
git add frontend/src/app/globals.css frontend/src/app/globals.test.ts
git commit -m "style: polish adviser consultation console"
```

### Task 5: Verify the complete adviser workflow and document deployment behavior

**Files:**
- Modify: `docs/runbooks/adviser-consultation-admin.md`

**Interfaces:**
- Consumes: completed backend contract and frontend workspace.
- Produces: operator guidance that separates dashboard use from production feature enablement.

- [ ] **Step 1: Update the runbook with the exact collection-state behavior**

Add:

```markdown
## Collection-state banner

The adviser console reports the backend value of `app.consultation.submission-enabled`.
It is informational and cannot change production configuration.

To accept new public submissions, production must have both:

```dotenv
APP_CONSULTATION_SUBMISSION_ENABLED=true
APP_CONSULTATION_PRIVACY_NOTICE_VERSION=2026-09-30
```

Recreate the backend after changing the environment, then verify the banner says
“咨询收集已启用” and submit a consented test enquiry through the public form.
```

- [ ] **Step 2: Run the full backend suite**

Run: `(cd backend && ./mvnw test)`

Expected: PASS with no failed tests.

- [ ] **Step 3: Run the full frontend test suite**

Run: `npm test`

Expected: PASS with no failed tests.

- [ ] **Step 4: Run static and production checks**

Run: `npm run lint`

Run: `npm run build`

Run: `git diff --check`

Expected: all exit 0.

- [ ] **Step 5: Perform manual workflow verification with independent test data**

Use an adviser account and at least two test enquiries. Verify:

```text
1. The paused/active banner matches backend configuration.
2. Search and status cards reset to page 1 and return matching records.
3. Selecting two different records shows the matching submitted details.
4. Email and telephone contacts receive only the correct safe action.
5. Unknown contact formats remain plain text.
6. Status changes persist after refresh.
7. A concurrent status change shows the existing conflict recovery message.
8. Mobile width stacks the list and detail without horizontal scrolling.
9. An ordinary account cannot access the adviser API or page.
```

- [ ] **Step 6: Commit documentation and any verification-only corrections**

```bash
git add docs/runbooks/adviser-consultation-admin.md
git commit -m "docs: clarify consultation collection state"
```

- [ ] **Step 7: Record production limitations in the handoff**

State explicitly that production currently has zero consultation rows and submission was observed disabled. Do not claim live end-to-end submission verification until production is enabled with a non-blank privacy notice version and a real consented test submission is completed.
