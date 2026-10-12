# Content-Independent UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the public website using only reviewed university data and approved UDAJO branding, without inventing business facts.

**Architecture:** Extend the reviewed local catalogue with explicit country and continent identifiers, then filter it through a pure tested function. Keep routing and presentation changes inside the existing Next.js App Router components and CSS system.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, CSS.

**Spec:** `docs/superpowers/specs/2026-09-17-frontend-brand-refresh-design.md`

## Global Constraints

- Preserve the approved UDAJO celadon identity and bilingual English/Chinese interface.
- Do not publish unapproved university, programme, partnership, contact, privacy, or legal claims.
- Navigation remains Home, Planning, Universities, Language, Scholarships, Study abroad programmes, News, About us.
- Normal text must meet WCAG AA contrast and interactive targets must remain at least 44px.
- Do not commit `.vscode/settings.json`.

---

### Task 1: Reviewed Catalogue Filters

**Files:**
- Modify: `frontend/src/data/university-catalog.ts`
- Modify: `frontend/src/data/university-catalog.test.ts`
- Modify: `frontend/src/lib/universities.ts`
- Modify: `frontend/src/app/[locale]/universities/page.tsx`

**Interfaces:**
- Produces: `filterUniversityCatalog(query, country, continent)` returning reviewed entries only.
- Consumes: existing approved local university catalogue.

- [ ] Add failing tests for Malaysia, Asia, combined query and geography, and unsupported geography.
- [ ] Run `npm run test:catalog` and verify the new assertions fail because the filter is missing.
- [ ] Add country/continent identifiers and implement the pure filter.
- [ ] Connect directory query parameters to the filter without changing unreviewed API behavior.
- [ ] Run the catalogue tests and verify they pass.

### Task 2: Navigation and Empty-State Recovery

**Files:**
- Modify: `frontend/src/lib/site.ts`
- Modify: `frontend/src/data/university-catalog.test.ts`
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/components/results-state.tsx`

**Interfaces:**
- Produces: `isNavigationActive(pathname, locale, path)` for top-level route highlighting.

- [ ] Add failing tests for the home route and nested university routes.
- [ ] Implement segment-aware active navigation.
- [ ] Add a clear-all action to empty directory results.
- [ ] Run tests and lint.

### Task 3: Directory and Homepage Visual Polish

**Files:**
- Modify: `frontend/src/components/school-card.tsx`
- Modify: `frontend/src/app/[locale]/page.tsx`
- Modify: `frontend/src/app/[locale]/universities/[slug]/page.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: existing reviewed catalogue and logo assets.
- Produces: compact cards, a reviewed directory strip, balanced benefit spacing, and a restrained university detail logo panel.

- [ ] Replace the large pending programme box with compact inline status copy.
- [ ] Add a homepage strip linking to the reviewed university directory without implying partnership.
- [ ] Reduce excessive benefits whitespace and detail logo height.
- [ ] Preserve the enlarged header logo at the standard site-container alignment.
- [ ] Run lint and a production build.

### Task 4: Visual and Functional Verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: completed implementation.
- Produces: test results and browser evidence.

- [ ] Run catalogue tests, lint, and production build.
- [ ] Start the local website and inspect English and Chinese home, university list, filtered list, empty state, and detail pages.
- [ ] Check desktop and narrow viewport behavior, keyboard focus, visible active navigation, logo rendering, and absence of horizontal overflow.
- [ ] Review the final diff and confirm `.vscode/settings.json` remains excluded.
