# UDAJO Frontend Brand Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved UDAJO brand system and a polished, accessible responsive experience across every existing public frontend route without changing backend behavior.

**Architecture:** Keep the current Next.js App Router structure and reuse the existing routes, server components, query parameters, and data access. Centralize the visual system in `globals.css`, keep `SiteHeader` as the only additional interactive navigation surface, use the unchanged supplied logo as a local static asset, and refine existing components rather than adding a UI library.

**Tech Stack:** Next.js 16.3.5, React 19.2.8, TypeScript 5, native CSS, Next.js `Image`, existing npm lint and build scripts.

**Spec:** `docs/superpowers/specs/2026-09-17-frontend-brand-refresh-design.md`

## Global Constraints

- UDAJO is the official English-facing brand name.
- Keep the supplied logo unchanged, including its lime circles and proportions.
- Use `#428675` as the primary UI green and only use accessible lighter or darker shades derived from it for other green interface elements.
- Use exact tokens: `#2F6D5F`, `#173B33`, `#FBFCFB`, `#F1F6F4`, `#172B27`, `#536760`, and `#CCDAD5` as defined in the specification.
- Keep the required navigation labels and order unchanged.
- Keep search as the primary homepage action and enquiry as the supporting action.
- Do not add a component library, animation package, remote font, or backend integration.
- Preserve existing routes, query parameters, data flow, and truthful unavailable states.
- Do not commit the pre-existing `.vscode/settings.json` modification.
- Do not use em dashes or en dashes in new user-visible copy.
- Maintain 44-pixel minimum touch targets, visible keyboard focus, reduced-motion support, and WCAG AA contrast.

---

### Task 1: Add the Official Brand Asset and Foundation Tokens

**Files:**
- Create: `frontend/public/brand/udajo-logo.jpg`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/layout.tsx`

**Interfaces:**
- Consumes: the approved source logo at `C:\Users\derry\AppData\Local\Temp\codex-clipboard-b2ab7559-75f7-4f0d-930a-fe37e7f75fd7.jpg`.
- Produces: `/brand/udajo-logo.jpg` and global CSS variables used by every later task.

- [ ] **Step 1: Record the source logo hash and dimensions**

Run from the repository root:

```powershell
Get-FileHash -Algorithm SHA256 'C:\Users\derry\AppData\Local\Temp\codex-clipboard-b2ab7559-75f7-4f0d-930a-fe37e7f75fd7.jpg'
Add-Type -AssemblyName System.Drawing
$logo = [System.Drawing.Image]::FromFile('C:\Users\derry\AppData\Local\Temp\codex-clipboard-b2ab7559-75f7-4f0d-930a-fe37e7f75fd7.jpg')
"$($logo.Width)x$($logo.Height)"
$logo.Dispose()
```

Expected: a SHA256 value and `480x480`.

- [ ] **Step 2: Copy the logo without modifying its bytes**

```powershell
New-Item -ItemType Directory -Force 'frontend\public\brand' | Out-Null
Copy-Item -LiteralPath 'C:\Users\derry\AppData\Local\Temp\codex-clipboard-b2ab7559-75f7-4f0d-930a-fe37e7f75fd7.jpg' -Destination 'frontend\public\brand\udajo-logo.jpg'
```

- [ ] **Step 3: Verify the copied asset is identical**

```powershell
Get-FileHash -Algorithm SHA256 'frontend\public\brand\udajo-logo.jpg'
```

Expected: the destination hash exactly matches Step 1.

- [ ] **Step 4: Replace the global token block and base element styles**

In `frontend/src/app/globals.css`, define these exact variables and use them for the existing base styles:

```css
:root {
  --brand: #428675;
  --brand-action: #2f6d5f;
  --brand-deep: #173b33;
  --paper: #fbfcfb;
  --wash: #f1f6f4;
  --ink: #172b27;
  --muted: #536760;
  --line: #ccdad5;
  --danger: #9f2f2f;
  --warning: #7a5412;
  --focus: #173b33;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --radius-sm: 6px;
  --radius-md: 12px;
  --shadow-sm: 0 4px 8px rgb(23 59 51 / 8%);
}
```

Set the body font stack to `"Segoe UI", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif`, use `--paper` and `--ink`, add balanced heading wrapping, pretty paragraph wrapping, consistent transitions on interactive controls, a dark-green three-pixel focus ring, active button scaling, and disabled styling. Do not add global entrance animations.

- [ ] **Step 5: Update root metadata**

In `frontend/src/app/layout.tsx`, use:

```ts
export const metadata: Metadata = {
  title: "UDAJO | 洋豆角",
  description: "UDAJO study planning and university search | 洋豆角留学规划与院校查询",
  robots: { index: false, follow: false },
};
```

- [ ] **Step 6: Run the static checks**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 7: Commit the foundation**

```powershell
git add frontend/public/brand/udajo-logo.jpg frontend/src/app/globals.css frontend/src/app/layout.tsx
git commit -m "feat: add UDAJO brand foundation"
```

---

### Task 2: Rebuild the Shared Header, Navigation, and Footer

**Files:**
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/app/[locale]/layout.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: `SiteHeader({ locale }: { locale: Locale })`, `navigation`, `words`, and `/brand/udajo-logo.jpg`.
- Produces: the same `SiteHeader` export with desktop and mobile navigation, plus a public locale shell without wireframe-only controls.

- [ ] **Step 1: Replace the text brand with the official logo**

Import `Image` from `next/image`. Render the unchanged 480-by-480 asset in the home link with explicit `width` and `height`, descriptive bilingual alt text, and CSS that preserves its aspect ratio. Keep the link accessible as the homepage destination.

- [ ] **Step 2: Add an accessible mobile navigation disclosure**

Add `useState(false)` to the existing client component. The toggle must:

```tsx
<button
  type="button"
  className="navigation-toggle"
  aria-expanded={menuOpen}
  aria-controls="primary-navigation"
  onClick={() => setMenuOpen(value => !value)}
>
  <span className="navigation-toggle-label">{words(locale, "菜单", "Menu")}</span>
  <span aria-hidden="true">{menuOpen ? "Close" : "Open"}</span>
</button>
```

Use readable text rather than a hand-drawn SVG icon. Add `id="primary-navigation"` to the nav, close the menu when any navigation link is selected, and preserve each link's existing `aria-current` calculation.

- [ ] **Step 3: Remove public wireframe controls and refine the footer**

In `frontend/src/app/[locale]/layout.tsx`:

- remove the `Link` import used only by the preview strip;
- remove the preview strip and component-review link;
- keep the skip link and Suspense boundary;
- update the fallback brand text to `UDAJO`;
- render a footer with `UDAJO`, `洋豆角`, and a concise bilingual statement that does not invent contact details;
- retain a truthful note that contact information will be published after approval.

- [ ] **Step 4: Add header, navigation, footer, and mobile-menu styles**

In `globals.css`, keep desktop navigation on one line and no taller than 80 pixels. Below 900 pixels, show the menu toggle and collapse the navigation into a full-width disclosure area. Ensure the language switch, Enquire button, toggle, and every navigation link have at least 44-pixel targets. Use `--brand` for the active indicator and `--brand-action` for filled buttons.

- [ ] **Step 5: Verify source-level requirements**

```powershell
rg -n "preview-strip|Wireframe preview|Review component states|页面线框预览" frontend/src/app/'[locale]'/layout.tsx frontend/src/components/site-header.tsx
```

Expected: no matches.

- [ ] **Step 6: Run lint and build**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully with no TypeScript error.

- [ ] **Step 7: Commit the shared shell**

```powershell
git add frontend/src/components/site-header.tsx frontend/src/app/'[locale]'/layout.tsx frontend/src/app/globals.css
git commit -m "feat: refresh UDAJO site navigation"
```

---

### Task 3: Redesign the Homepage Around Search

**Files:**
- Modify: `frontend/src/app/[locale]/page.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: `words(locale, zh, en)`, the existing planning query format, the shared button classes, and `/brand/udajo-logo.jpg`.
- Produces: the existing home route with updated bilingual copy and layout; no route or query changes.

- [ ] **Step 1: Replace the hero content and hierarchy**

Use exact headlines:

```tsx
{words(
  locale,
  "找到适合你的院校，规划下一步留学之路。",
  "Find the right university and plan your next step abroad."
)}
```

Keep the search form action at `/${locale}/planning`, the query name `q`, and the existing maximum length. Keep `Find a course` as the filled action. Add a secondary Enquire link below or beside the search without competing with the main button.

- [ ] **Step 2: Replace the placeholder with the reserved media panel**

Render a `hero-media` container with a stable 4:3 ratio. Use the official logo through `next/image` as a low-emphasis watermark and include no fake photograph, fake screenshot, plus symbol, or development instruction. The image must remain proportional and must not be recolored.

- [ ] **Step 3: Refine benefits copy without unsupported claims**

Keep four themes but use positive, defensible language:

```ts
const benefits = [
  ["快速查找", "Focused search", "按学习方向快速缩小选择范围。", "Narrow your options by study direction."],
  ["清晰资料", "Clear information", "在一个地方比较院校与课程重点。", "Compare key university and course information in one place."],
  ["真实来源", "Reliable sources", "重要资料以已审核内容为准。", "Important information is presented from reviewed sources."],
  ["专业协助", "Practical guidance", "需要时可联系顾问了解申请步骤。", "Contact an adviser when you need help with application steps."],
] as const;
```

Do not present the benefits as four identical raised cards. Use an asymmetric grid with dividers and typography.

- [ ] **Step 4: Refine the real application sequence**

Keep the existing five steps and order. Use numbers only inside this sequence because order is meaningful. Add a line or spacing rhythm that communicates progression without automatic animation.

- [ ] **Step 5: Implement responsive homepage styles**

Use a two-column hero at desktop and a single-column layout below 800 pixels. Keep the headline to roughly two lines on wide screens and prevent overflow at 320 pixels. Style study shortcuts as compact links, not oversized pills. Keep the search action visible in the initial desktop viewport.

- [ ] **Step 6: Run lint and build**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 7: Commit the homepage**

```powershell
git add frontend/src/app/'[locale]'/page.tsx frontend/src/app/globals.css
git commit -m "feat: redesign UDAJO homepage"
```

---

### Task 4: Polish Search, Filters, Results, and University Details

**Files:**
- Modify: `frontend/src/components/filter-panel.tsx`
- Modify: `frontend/src/components/school-card.tsx`
- Modify: `frontend/src/components/results-state.tsx`
- Modify: `frontend/src/components/pagination.tsx`
- Modify: `frontend/src/app/[locale]/planning/page.tsx`
- Modify: `frontend/src/app/[locale]/universities/page.tsx`
- Modify: `frontend/src/app/[locale]/universities/[slug]/page.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: the current `Query`, `SchoolSummary`, `getSchools`, `pageLink`, filter query names, and route paths.
- Produces: unchanged component signatures and URL behavior with a consistent branded presentation.

- [ ] **Step 1: Refine the filter panel without changing submitted values**

Preserve every existing input `name`, option value, action URL, GET method, and hidden field. Improve the mobile toggle text, expanded state, grouping, labels, helper text, clear-all link, and submit button. Keep unapproved category and language options visibly unavailable rather than inventing choices.

- [ ] **Step 2: Refine university cards**

Keep the `SchoolCard` signature and maximum of three matched courses. Replace the plus-sign image placeholder with a restrained neutral media area that does not pretend to contain a university photograph. Improve name, location, course metadata, and View details hierarchy. Retain truthful fallback text.

- [ ] **Step 3: Refine state and pagination components**

Use text and simple typographic symbols already available in the page. Do not add an icon package. Preserve `role="alert"` for errors, `role="status"` for other result states, and `aria-busy` for loading. Keep pagination links and disabled controls semantically correct and at least 44 pixels tall.

- [ ] **Step 4: Remove development-style headings from listing pages**

Replace labels such as `STUDY PLANNING`, `EXPLORE UNIVERSITIES`, `STRUCTURE PREVIEW`, and long implementation notes with concise user-facing headings or professionally styled availability messages. Do not hide the fact that matching filters or detailed course data are not connected.

- [ ] **Step 5: Refine the university detail layout**

Keep the current data-loading behavior and `notFound()` conditions. Improve the back link, title block, information sections, course definition list, aside call to action, QR placeholder, and responsive collapse. Replace implementation language about field structures with visitor-facing availability wording.

- [ ] **Step 6: Run behavior-preservation searches**

```powershell
rg -n 'name="(q|category|level|continent|country|mode|language|duration|intake|tuitionMin|tuitionMax|sort)"' frontend/src/components/filter-panel.tsx
rg -n 'method="get"|pageLink\(|getSchools\(' frontend/src
```

Expected: all existing query inputs, GET behavior, page links, and data calls remain present.

- [ ] **Step 7: Run lint and build**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 8: Commit discovery pages**

```powershell
git add frontend/src/components/filter-panel.tsx frontend/src/components/school-card.tsx frontend/src/components/results-state.tsx frontend/src/components/pagination.tsx frontend/src/app/'[locale]'/planning/page.tsx frontend/src/app/'[locale]'/universities/page.tsx frontend/src/app/'[locale]'/universities/'[slug]'/page.tsx frontend/src/app/globals.css
git commit -m "feat: polish university discovery experience"
```

---

### Task 5: Polish Consultation, Content, and System States

**Files:**
- Modify: `frontend/src/components/consultation-form.tsx`
- Modify: `frontend/src/app/[locale]/consultation/page.tsx`
- Modify: `frontend/src/app/[locale]/[section]/page.tsx`
- Modify: `frontend/src/app/[locale]/loading.tsx`
- Modify: `frontend/src/app/[locale]/error.tsx`
- Modify: `frontend/src/app/not-found.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: the approved Q31 A fields and existing `ConsultationForm({ locale })` signature.
- Produces: the same frontend-only consultation behavior and truthful content/system states with improved presentation.

- [ ] **Step 1: Preserve and visually refine all approved consultation fields**

Keep visible labels and controls for name, phone or WeChat, intended university, intended course, qualification level, notes, and privacy consent. Add `name` attributes matching these concepts for future API integration, but keep submission prevented. Do not collect identity documents, transcripts, passports, or other sensitive uploads.

- [ ] **Step 2: Make incomplete submission behavior unmistakable and professional**

Keep the privacy checkbox and real submission button disabled until privacy wording and backend submission are approved. Replace development-focused wording with concise visitor-facing text. Preserve the preview-check behavior only if its purpose remains understandable; otherwise replace it with a non-submitting review action and status message that clearly states no data was sent or saved.

- [ ] **Step 3: Refine the consultation page and adviser aside**

Improve the page introduction, form hierarchy, QR placeholder, and contact-availability note. Do not invent adviser names, response times, phone numbers, email addresses, or QR content.

- [ ] **Step 4: Refine content placeholder pages**

Keep Language, Scholarships, Study Abroad Programmes, News, and About Us routable. Replace `SECTION PREVIEW` and development language with a consistent title, a concise truthful availability message, and a clear Return home link.

- [ ] **Step 5: Refine loading, error, and not-found states**

Keep `aria-busy`, `role="status"`, `role="alert"`, reset behavior, and bilingual navigation. Use the shared spacing, type, button, and state patterns. Replace the middle-dot separator in not-found links with layout spacing.

- [ ] **Step 6: Verify the Q31 A field set and truthful behavior**

```powershell
rg -n 'Name|姓名|Phone number or WeChat|手机或微信|Intended university|意向学校|Intended course|意向专业|Qualification level|学历层次|Notes|备注|Privacy consent|隐私同意' frontend/src/components/consultation-form.tsx
rg -n 'preventDefault|disabled|Nothing is sent or saved|未发送或保存' frontend/src/components/consultation-form.tsx
```

Expected: every approved field is present and the form still cannot claim to submit or save data.

- [ ] **Step 7: Run lint and build**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 8: Commit consultation and system states**

```powershell
git add frontend/src/components/consultation-form.tsx frontend/src/app/'[locale]'/consultation/page.tsx frontend/src/app/'[locale]'/'[section]'/page.tsx frontend/src/app/'[locale]'/loading.tsx frontend/src/app/'[locale]'/error.tsx frontend/src/app/not-found.tsx frontend/src/app/globals.css
git commit -m "feat: refine consultation and content states"
```

---

### Task 6: Perform Full Functional, Responsive, and Visual Verification

**Files:**
- Modify only files that fail this verification.

**Interfaces:**
- Consumes: the complete frontend from Tasks 1-5.
- Produces: a verified implementation ready for code review, with no uncommitted fixes except the pre-existing `.vscode/settings.json` change.

- [ ] **Step 1: Run clean static verification**

```powershell
cd frontend
npm run lint
npm run build
```

Expected: both commands exit with code 0.

- [ ] **Step 2: Check brand and copy invariants**

From the repository root:

```powershell
rg -n '#428675|#2f6d5f|#173b33' frontend/src/app/globals.css
rg -n 'Yangdoujiao|Wireframe preview|Review component states|SECTION PREVIEW|STRUCTURE PREVIEW|\x{2013}|\x{2014}' frontend/src --glob '!app/[locale]/review/page.tsx'
Get-FileHash -Algorithm SHA256 'frontend\public\brand\udajo-logo.jpg'
```

Expected: required colors are present; public source has no old English brand name, wireframe labels, structure-preview labels, or prohibited dash characters; logo hash matches Task 1.

- [ ] **Step 3: Start the production server**

```powershell
cd frontend
npm run start -- --port 3100
```

Expected: server reports ready at `http://localhost:3100` after the successful production build.

- [ ] **Step 4: Review the route matrix in English and Chinese**

Open each route at desktop width and check for visible runtime errors, broken layout, missing logo, incorrect navigation state, and misleading functionality:

```text
/en                    /zh
/en/planning           /zh/planning
/en/universities       /zh/universities
/en/universities/preview  /zh/universities/preview
/en/consultation       /zh/consultation
/en/language           /zh/language
/en/scholarships       /zh/scholarships
/en/programmes         /zh/programmes
/en/news               /zh/news
/en/about              /zh/about
/en/does-not-exist     /zh/does-not-exist
```

- [ ] **Step 5: Exercise functional paths**

Verify:

1. Language switching preserves the current path and query string.
2. Desktop navigation reaches every approved route.
3. Mobile navigation opens, exposes `aria-expanded="true"`, follows a link, and closes.
4. Homepage search sends `q` to the planning URL.
5. Planning and university filters preserve their current query names.
6. Clear all removes active filters.
7. Pagination remains disabled when only one page exists.
8. University detail links and back navigation work.
9. Consultation review never sends or saves personal data.
10. Error and not-found actions remain usable.

- [ ] **Step 6: Review responsive layouts**

Check at minimum:

```text
1440 x 900 desktop
1024 x 768 tablet landscape
768 x 1024 tablet portrait
390 x 844 mobile
320 x 568 small mobile
```

At each width, confirm no horizontal overflow, clipped navigation, overlapping text, inaccessible controls, or hero headline overflow.

- [ ] **Step 7: Review keyboard and accessibility behavior**

Starting at the browser address bar, use only Tab, Shift+Tab, Enter, Space, and Escape where supported. Confirm the skip link, logo, language switch, Enquire action, mobile navigation, main navigation, search, filters, pagination, consultation controls, and footer links receive a visible focus indicator in logical order. Confirm all buttons and form fields have accessible names.

- [ ] **Step 8: Check browser console and refine the first visual pass**

Review console errors on the homepage, planning, universities, details, and consultation pages. Then perform a second visual critique for hierarchy, spacing rhythm, excessive containers, inconsistent radii, logo proportions, color misuse, hover/focus/active states, and bilingual wrapping. Fix every confirmed issue and rerun Steps 1-7 for affected areas.

- [ ] **Step 9: Inspect the final diff and working tree**

```powershell
git diff --check main...HEAD
git diff --stat main...HEAD
git status --short
```

Expected: no whitespace errors; diff contains only the approved specification, plan, logo, and frontend changes; `.vscode/settings.json` remains uncommitted and is excluded from every commit.

- [ ] **Step 10: Commit final verification fixes**

If verification required code changes:

```powershell
git add frontend docs/superpowers/plans/2026-09-17-frontend-brand-refresh.md
git restore --staged .vscode/settings.json
git commit -m "fix: complete frontend brand verification"
```

If no fixes were required, do not create an empty commit.
