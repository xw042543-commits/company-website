# University Catalogue and Logos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a searchable bilingual university directory using the supplied individual logos and verified identity data, including explicit pending states for institutions without programme records.

**Architecture:** A pure catalogue module owns reviewed university identity records, alias normalization, and local search. The existing server data boundary returns this catalogue when no API is configured and enriches compatible API results without embedding data in UI components. Cards and detail pages consume the extended `SchoolSummary` interface and render logos through Next.js Image.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node built-in test runner, CSS, Next.js Image

**Spec:** `docs/superpowers/specs/2026-09-17-university-catalog-logos-design.md`

## Global Constraints

- Do not import programme rows in this change.
- Do not invent rankings, accreditation, fees, descriptions, or marketing claims.
- Use one confidently matched individual logo per institution.
- Rename copied assets to stable lowercase ASCII filenames.
- Preserve logo proportions with `object-fit: contain`.
- Search must match localized names, English names, abbreviations, and approved aliases.
- Universities without programme data must remain visible with explicit bilingual pending copy.
- Preserve future API compatibility through `SchoolSummary`.

---

### Task 1: Reviewed catalogue and search

**Files:**
- Create: `frontend/src/data/university-catalog.ts`
- Create: `frontend/src/data/university-catalog.test.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/src/lib/universities.ts`

**Interfaces:**
- Produces: `UniversityCatalogEntry`, `UNIVERSITY_CATALOG`, `searchUniversityCatalog(query: string): UniversityCatalogEntry[]`, and extended `SchoolSummary` presentation fields.
- Consumes: the existing `SchoolSummary` and `SchoolResult` server boundary.

- [ ] **Step 1: Add the catalogue test command and failing search tests**

Add `"test:catalog": "node --test src/data/university-catalog.test.ts"` and test that `UM`, `马来亚大学`, `University of Malaya`, case differences, surrounding whitespace, and an unmatched term return the expected records.

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { searchUniversityCatalog } from "./university-catalog.ts";

test("matches an approved abbreviation", () => {
  assert.equal(searchUniversityCatalog("UM")[0]?.slug, "university-of-malaya");
});

test("matches a Chinese university name", () => {
  assert.equal(searchUniversityCatalog("马来亚大学")[0]?.slug, "university-of-malaya");
});

test("normalizes case and surrounding whitespace", () => {
  assert.equal(searchUniversityCatalog("  university OF malaya ")[0]?.slug, "university-of-malaya");
});

test("returns no records for an unmatched query", () => {
  assert.deepEqual(searchUniversityCatalog("no such institution"), []);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run test:catalog`
Expected: FAIL because `university-catalog.ts` does not exist.

- [ ] **Step 3: Implement the reviewed catalogue and normalized search**

Define stable records for the nineteen approved institutions with `id`, `slug`, `nameZh`, `nameEn`, `countryZh`, `countryEn`, `cityZh`, `cityEn`, `logoSrc`, `aliases`, and `programmeStatus: "pending"`. Normalize search text with Unicode normalization, trim, and lowercase. Match against names, location, and aliases.

- [ ] **Step 4: Integrate the local fallback**

Extend `SchoolSummary` with optional localized names, localized locations, `logoSrc`, `aliases`, and `programmeStatus`. Return the local catalogue from `getSchools()` when `NEXT_PUBLIC_API_BASE_URL` is absent. Filter it with `searchUniversityCatalog(query)` when a query is present. Keep configured API error handling unchanged.

- [ ] **Step 5: Run catalogue tests, lint, and TypeScript build**

Run: `npm run test:catalog && npm run lint && npm run build`
Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/src/data/university-catalog.ts frontend/src/data/university-catalog.test.ts frontend/src/lib/universities.ts
git commit -m "feat: add reviewed university catalogue"
```

### Task 2: Normalize supplied logo assets

**Files:**
- Create: `frontend/public/universities/*.jpg`
- Create: `frontend/public/universities/*.png`
- Create: `frontend/public/universities/*.svg`

**Interfaces:**
- Consumes: `logoSrc` values from `UNIVERSITY_CATALOG`.
- Produces: one stable public asset at every referenced path.

- [ ] **Step 1: Build an explicit source-to-destination mapping**

Map only confidently identified individual source files to catalogue slugs. Prefer the supplied SVG for Nottingham, the clean horizontal wordmarks for Sunway and Heriot-Watt, the small official Taylor's mark over the rendered monogram, and individual images over the multi-logo collage.

- [ ] **Step 2: Copy assets without changing their internal artwork**

Copy each approved file to `frontend/public/universities/<slug>.<ext>`. Do not upscale, redraw, recolor, remove wording, or use the composite logo sheet.

- [ ] **Step 3: Verify every catalogue asset exists**

Run a Node script that imports `UNIVERSITY_CATALOG`, resolves every `logoSrc` under `frontend/public`, and fails if any file is absent or empty.
Expected: nineteen existing nonempty files.

- [ ] **Step 4: Commit**

```bash
git add frontend/public/universities
git commit -m "assets: add reviewed university logos"
```

### Task 3: Render catalogue cards and localized status

**Files:**
- Modify: `frontend/src/components/school-card.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/[locale]/universities/page.tsx`

**Interfaces:**
- Consumes: extended `SchoolSummary` values.
- Produces: localized directory cards with logo, identity, location, and programme state.

- [ ] **Step 1: Add a failing source-level rendering assertion**

Extend `university-catalog.test.ts` with an asset-path invariant: every record must have a unique slug, at least one alias, an absolute `/universities/` logo path, and both localized names.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test:catalog`
Expected: FAIL until every record satisfies the presentation invariant.

- [ ] **Step 3: Render localized logo cards**

Use `next/image` in `SchoolCard`. Select `nameZh` or `nameEn` from `locale`, provide descriptive alt text, retain the English name as secondary identity in Chinese, and replace the generic course heading with a compact pending-status panel when `programmeStatus === "pending"`.

- [ ] **Step 4: Refine directory copy and CSS**

Remove the obsolete “relevance ordering is being connected” message for the local reviewed catalogue. Create a fixed logo surface with contained images, predictable card alignment, keyboard-visible links, and a stacked narrow-screen layout. Do not crop logos.

- [ ] **Step 5: Run tests and build**

Run: `npm run test:catalog && npm run lint && npm run build`
Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/data/university-catalog.test.ts frontend/src/components/school-card.tsx frontend/src/app/globals.css frontend/src/app/[locale]/universities/page.tsx
git commit -m "feat: display university logos and status"
```

### Task 4: Render reviewed university detail pages

**Files:**
- Modify: `frontend/src/app/[locale]/universities/[slug]/page.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: localized catalogue identity, logo, city, and programme status through `getSchools()`.
- Produces: detail pages that display only reviewed facts and explicit unavailable states.

- [ ] **Step 1: Add a failing catalogue lookup test**

Add and export `findUniversityBySlug(slug: string)` and first test that a known slug returns the expected bilingual record while an unknown slug returns `undefined`.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test:catalog`
Expected: FAIL because `findUniversityBySlug` is not exported.

- [ ] **Step 3: Implement lookup and detail presentation**

Implement `findUniversityBySlug`. On the detail page, localize the university name and location, render the logo in a contained identity panel, state that reviewed institutional and programme information is being prepared, and retain the consultation action. Do not render fabricated course rows.

- [ ] **Step 4: Run tests, lint, and build**

Run: `npm run test:catalog && npm run lint && npm run build`
Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/university-catalog.ts frontend/src/data/university-catalog.test.ts frontend/src/app/[locale]/universities/[slug]/page.tsx frontend/src/app/globals.css
git commit -m "feat: add reviewed university profiles"
```

### Task 5: Visual, functional, and regression verification

**Files:**
- Modify only if verification reveals a defect in the files above.

**Interfaces:**
- Consumes: the completed directory and detail experience.
- Produces: verification evidence suitable for pull-request review.

- [ ] **Step 1: Run the complete automated checks**

Run frontend catalogue tests, ESLint, and production build. Run `mvn test` in `backend` with Docker Desktop available.
Expected: zero failures and zero errors.

- [ ] **Step 2: Start the production preview**

Run: `npm run start -- -p 3100`
Expected: server accepts requests at `http://127.0.0.1:3100`.

- [ ] **Step 3: Review desktop pages**

Inspect `/en/universities`, `/zh/universities`, one horizontal-logo detail page, and one square-logo detail page. Verify logo containment, bilingual identity, pending status, search, pagination, navigation, and consultation links.

- [ ] **Step 4: Review narrow viewport pages**

At approximately 390px width, repeat the directory and detail review. Verify no horizontal overflow, clipped logos, overlapping controls, or inaccessible focus states.

- [ ] **Step 5: Run design pre-flight and correct defects**

Check hierarchy, spacing rhythm, contrast, typography, image fidelity, keyboard focus, alt text, empty states, and reduced-motion behavior. Re-run affected automated checks after any correction.

- [ ] **Step 6: Commit verification fixes if present**

```bash
git add frontend
git commit -m "fix: polish university catalogue presentation"
```
