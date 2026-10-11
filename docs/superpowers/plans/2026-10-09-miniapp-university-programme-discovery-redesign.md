# Mini-Program University and Programme Discovery Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mini-program university directory, university detail, and programme detail to match the approved photographic discovery flow while preserving real API data and existing functionality.

**Architecture:** Keep the existing service boundaries and introduce pure discovery-view helpers for filter menus, programme grouping, section ordering, and temporary lock policy. Use a directory-specific university result component so the home page remains unchanged, then compose each page from validated service models and native WeChat state.

**Tech Stack:** WeChat Mini Program WXML/WXSS, TypeScript 5.9, Node test runner through `tsx`, ESLint, existing REST services

**Spec:** `docs/superpowers/specs/2026-10-09-miniapp-university-programme-discovery-redesign.md`

## Global Constraints

- Existing university and programme APIs remain the only source of business data.
- Do not fabricate rankings, credits, campuses, tuition, entry requirements, or curriculum.
- Do not implement payment, points, subscriptions, purchases, or entitlement checks.
- Preserve existing business sentences and audited fallbacks.
- Preserve favourites, pagination, caching, loading, empty, offline, failure, retry, and native back behaviour.
- Warm yellow is the principal accent for navigation, active filters, tabs, section rules, and locked panels.
- All custom headers must account for the top safe area and WeChat menu capsule.
- Use native mini-program syntax and existing dependencies only.

## Review Focus

- A rapid search followed by a filter change must not let the superseded response replace the latest result; Task 2 keeps the existing request-generation test and adds the page-state assertion.
- A catalogue failure must leave an unfiltered directory usable; Task 2 adds a source contract for fallback options and disabled loading state.
- Long bilingual university and programme names must wrap without covering controls; Tasks 2–4 include source contracts and visual checks at a narrow phone width.
- Missing campus or logo media must show the branded fallback without failing the page; Tasks 2–4 add component/page failure-state assertions.
- Duplicate section aliases and repeated introductions must render once in the intended order; Tasks 1 and 4 add pure-function tests.

---

### Task 1: Discovery View Model and Lock Policy

**Files:**
- Create: `miniapp/miniprogram/utils/discovery-view.ts`
- Create: `miniapp/tests/discovery-view.test.ts`

**Interfaces:**
- Consumes: `FilterOption`, `UniversityProgramme`, `ProgrammeDetail`, and `ProgrammeDetailSection` from existing services.
- Produces: `deriveProgrammeCategories(programmes, labels)`, `filterProgrammes(programmes, categoryCode)`, `buildProgrammeDocument(programme)`, `isTemporarilyLockedSection(type)`, and the `ProgrammeDocumentSection` type.

- [ ] **Step 1: Write failing category and filter tests**

Assert that `deriveProgrammeCategories` starts with `{ code: 'ALL', label: '全部学院' }`, de-duplicates category codes in first-seen order, uses catalogue Chinese labels when available, and falls back to the code. Assert that `filterProgrammes` returns all programmes for `ALL` and only exact category matches otherwise.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- --test-name-pattern="programme categories|programme filtering"`

Expected: FAIL because `utils/discovery-view.ts` does not exist.

- [ ] **Step 3: Implement category derivation and filtering**

Add exact signatures:

```ts
export interface ProgrammeCategory { readonly code: string; readonly label: string }
export function deriveProgrammeCategories(programmes: readonly UniversityProgramme[], labels: ReadonlyMap<string, string>): ProgrammeCategory[]
export function filterProgrammes(programmes: readonly UniversityProgramme[], categoryCode: string): UniversityProgramme[]
```

- [ ] **Step 4: Run the focused tests and verify pass**

Run: `npm test -- --test-name-pattern="programme categories|programme filtering"`

Expected: PASS.

- [ ] **Step 5: Write failing section-order and lock-policy tests**

Assert that `buildProgrammeDocument` renders one introduction first, a synthetic `BASIC_INFORMATION` section second, then remaining API sections by `sortOrder`; it must not duplicate `INTRODUCTION`. Assert that only `ADMISSION_REQUIREMENTS`, `ADMISSIONS`, `COURSE_STRUCTURE`, and `CURRICULUM` return `true` from `isTemporarilyLockedSection`.

- [ ] **Step 6: Run the new focused tests and verify failure**

Run: `npm test -- --test-name-pattern="programme document|temporary lock"`

Expected: FAIL because the document helpers are absent.

- [ ] **Step 7: Implement document ordering and central lock policy**

Add exact signatures:

```ts
export interface ProgrammeDocumentSection { readonly key: string; readonly type: string; readonly title: string; readonly body: string; readonly locked: boolean }
export function buildProgrammeDocument(programme: ProgrammeDetail): ProgrammeDocumentSection[]
export function isTemporarilyLockedSection(type: string): boolean
```

Use a `ReadonlySet<string>` for the four temporary lock aliases. Do not include hidden section body text in any generated accessibility label.

- [ ] **Step 8: Run Task 1 tests and commit**

Run: `npm test -- --test-name-pattern="programme categories|programme filtering|programme document|temporary lock"`

Expected: PASS.

Commit: `feat(miniapp): add discovery view models`

---

### Task 2: Photographic University Directory and Combined Filters

**Files:**
- Create: `miniapp/miniprogram/components/university-result-card/index.ts`
- Create: `miniapp/miniprogram/components/university-result-card/index.wxml`
- Create: `miniapp/miniprogram/components/university-result-card/index.wxss`
- Create: `miniapp/miniprogram/components/university-result-card/index.json`
- Modify: `miniapp/miniprogram/pages/universities/index.ts`
- Modify: `miniapp/miniprogram/pages/universities/index.wxml`
- Modify: `miniapp/miniprogram/pages/universities/index.wxss`
- Modify: `miniapp/miniprogram/pages/universities/index.json`
- Modify: `miniapp/tests/component-contracts.test.ts`
- Modify: `miniapp/tests/universities.test.ts`

**Interfaces:**
- Consumes: `searchUniversities`, catalogue `FilterOption[]`, `UniversitySummary`, and existing favourites store.
- Produces: `openFilter(event)`, `selectFilter(event)`, `closeFilters()`, directory-specific `select` and `favorite` component events, and combined search requests using existing input names.

- [ ] **Step 1: Write failing service and source-contract tests**

Extend `universities.test.ts` to pin combined `q`, `country`, `level`, and `category` query parameters and omission of `ALL`. Extend `component-contracts.test.ts` to require the new component’s labelled favourite action, image error fallback, `lazy-load`, `fade-show`, and card selection event.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- tests/universities.test.ts tests/component-contracts.test.ts`

Expected: FAIL because the result component and new page contracts are absent.

- [ ] **Step 3: Implement the directory-specific result card**

Create a full-width campus-photo card using `coverImageUrl ?? imageUrl`, `aspectFill`, a bottom contrast gradient, Chinese and English names, location, and a separately tappable favourite control. Show no ranking when no trusted ranking field exists. Add a deterministic branded fallback on image error.

- [ ] **Step 4: Replace picker state with one expanded inline menu**

In `pages/universities/index.ts`, add `openFilterKey: '' | 'country' | 'level' | 'category'`. Implement `openFilter`, `selectFilter`, and `closeFilters` so only one menu opens, unchanged selections close without a request, changed selections reset pagination and reload, and catalogue failure leaves the client `ALL` choices usable.

- [ ] **Step 5: Rebuild directory WXML and WXSS**

Add the compact search row, three inline filter triggers, expanded option panel, check marks, dimmed non-interactive result layer, photographic list, result count, skeleton-compatible loading geometry, reset action, and existing empty/offline/failed states. Ensure bilingual names wrap and do not overlap the favourite button at 320 CSS pixels.

- [ ] **Step 6: Run focused tests and type checking**

Run: `npm test -- tests/universities.test.ts tests/component-contracts.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

Commit: `feat(miniapp): redesign university discovery directory`

---

### Task 3: University Identity, Introduction, and Programme Browsing

**Files:**
- Modify: `miniapp/miniprogram/pages/university-detail/index.ts`
- Modify: `miniapp/miniprogram/pages/university-detail/index.wxml`
- Modify: `miniapp/miniprogram/pages/university-detail/index.wxss`
- Modify: `miniapp/miniprogram/pages/university-detail/index.json`
- Modify: `miniapp/tests/component-contracts.test.ts`
- Modify: `miniapp/tests/discovery-view.test.ts`

**Interfaces:**
- Consumes: `deriveProgrammeCategories`, `filterProgrammes`, university detail/programme services, catalogue subject labels, favourites, and programme routes.
- Produces: `activeSection: 'introduction' | 'programmes'`, `activeCategory`, `programmeCategories`, `visibleProgrammes`, `selectSection(event)`, and `selectCategory(event)`.

- [ ] **Step 1: Write failing page and category-state tests**

Add source contracts for the safe-area custom yellow header, back control, campus hero fallback, logo fallback, both main tabs, category chips, programme actions, favourite control, and consultation control. Add pure assertions that unknown category codes remain selectable and switching back to `ALL` restores every programme.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- tests/discovery-view.test.ts tests/component-contracts.test.ts`

Expected: FAIL because the approved page structure is absent.

- [ ] **Step 3: Add university detail view state**

Load catalogue labels alongside university detail and programmes without making catalogue failure fatal. Derive categories after the programme response, default to `introduction` and `ALL`, and update `visibleProgrammes` locally when a category changes.

- [ ] **Step 4: Rebuild the university detail structure**

Implement the yellow navigation header, full-width campus hero, connected school identity region, real location, optional programme count, favourite control, `院校简介` and `专业查询` tabs, category chips, and programme rows. Do not render a ranking or decorative school fact unless validated data exists.

- [ ] **Step 5: Style responsive states and preserve actions**

Match the approved yellow/white/charcoal system, use readable description paragraphs, keep programme row metadata optional, and preserve fixed consultation/favourite actions without hiding the final row. Verify long names and missing media fallbacks at a narrow width.

- [ ] **Step 6: Run focused tests and type checking**

Run: `npm test -- tests/discovery-view.test.ts tests/component-contracts.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

Commit: `feat(miniapp): rebuild university detail discovery flow`

---

### Task 4: Programme Document, Facts Table, and Locked Previews

**Files:**
- Modify: `miniapp/miniprogram/services/miniapp-data.ts`
- Modify: `miniapp/miniprogram/pages/programme-detail/index.ts`
- Modify: `miniapp/miniprogram/pages/programme-detail/index.wxml`
- Modify: `miniapp/miniprogram/pages/programme-detail/index.wxss`
- Modify: `miniapp/miniprogram/pages/programme-detail/index.json`
- Modify: `miniapp/tests/miniapp-data.test.ts`
- Modify: `miniapp/tests/component-contracts.test.ts`
- Modify: `miniapp/tests/discovery-view.test.ts`

**Interfaces:**
- Consumes: `buildProgrammeDocument`, `universityLogoUrl`, existing programme detail model, favourites, and session store.
- Produces: `documentSections`, `basicFacts`, `universityLogoUrl`, image fallback state, and the existing consultation/favourite actions.

- [ ] **Step 1: Write failing mapping and source-contract tests**

Assert that programme detail mapping still rejects malformed sections and preserves their sort order. Add contracts requiring a safe-area yellow header, back action, university identity row, `专业描述`, `基本信息`, semantic fact rows, locked-panel text without points or price, and existing favourite action.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- tests/miniapp-data.test.ts tests/discovery-view.test.ts tests/component-contracts.test.ts`

Expected: FAIL because the document view and locked-preview contract are absent.

- [ ] **Step 3: Build the programme page view model**

Replace tab state with `documentSections` from Task 1 and a `basicFacts` array containing non-empty values for 学历, 学制, 模式／方式, 授课语言, 开学日期, 学习地点, and 学费. Resolve the university logo through `universityLogoUrl(programme.universitySlug)` and fall back to a letter mark.

- [ ] **Step 4: Rebuild programme detail WXML**

Render the compact identity row, one description block, the two-column basic-information table, public API sections in order, and locked previews for temporary premium candidates. The lock panel must say the section is not yet available and must not expose hidden content through accessibility labels.

- [ ] **Step 5: Implement the reference-inspired programme styling**

Use the yellow header and section rules, white document surface, alternating fact rows, restrained paragraph width and spacing, blur treatment behind locked overlays, and bottom action clearance. Ensure long bilingual programme names wrap without covering the logo or controls.

- [ ] **Step 6: Run focused tests and type checking**

Run: `npm test -- tests/miniapp-data.test.ts tests/discovery-view.test.ts tests/component-contracts.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit Task 4**

Commit: `feat(miniapp): redesign programme detail document`

---

### Task 5: Cross-Page Regression, Visual Verification, and Cleanup

**Files:**
- Modify only files from Tasks 1–4 when verification exposes a defect.
- Update: `docs/superpowers/plans/2026-10-09-miniapp-university-programme-discovery-redesign.md` checkbox state during execution.

**Interfaces:**
- Consumes: all page, component, and helper contracts from Tasks 1–4.
- Produces: a verified end-to-end university discovery flow with no new public interface.

- [ ] **Step 1: Run the complete mini-program check**

Run: `npm run check`

Expected: all tests pass, TypeScript reports no errors, and ESLint reports zero warnings.

- [ ] **Step 2: Verify all navigation and persistence paths**

In the preview fixture or WeChat DevTools, check directory → university → programme → back, favourite changes across pages, combined country/level/subject filters, reset, pagination, and scroll restoration.

- [ ] **Step 3: Verify failure and edge states**

Check catalogue failure, superseded search, empty results, offline retry, API failure retry, missing campus image, missing logo, no programmes, unknown category code, long bilingual names, and missing optional programme facts.

- [ ] **Step 4: Verify visual reference coverage**

Compare against all eight supplied screenshots at a narrow phone viewport: photographic list, open country menu, open qualification menu, university hero and identity, introduction, programme categories and rows, programme description, facts table, admissions lock, and curriculum lock.

- [ ] **Step 5: Remove obsolete page-only code**

Delete unused tab handlers, picker handlers, styles, and imports made obsolete by the new flow. Do not alter the shared home university card unless a failing contract requires it.

- [ ] **Step 6: Re-run the complete check**

Run: `npm run check`

Expected: PASS with zero warnings.

- [ ] **Step 7: Commit verified cleanup**

Commit: `test(miniapp): verify university discovery redesign`

- [ ] **Step 8: Request whole-branch code review**

Review against the specification, this plan, the eight references, and the complete test output before updating the pull request.
