# Mini-Program University and Programme Discovery Redesign

**Date:** 2026-10-09

**Status:** Approved design, pending implementation plan
**Scope:** WeChat mini-program university directory, university detail, and programme detail

## Problem

The current mini-program exposes the correct university and programme data, but its directory and detail pages use several different card systems and visual hierarchies. Browsing universities, narrowing results, understanding a school, and opening a programme do not yet feel like one connected journey.

The redesign must follow the supplied reference screens: a photographic university directory with inline filters, an image-led university page with programme browsing, and a readable programme page with structured facts. Admission requirements and curriculum may later become paid content. In this phase they will appear as clearly locked previews without payment, points, or entitlement logic.

## Goals

- Make university discovery feel visual, fast, and consistent with a native WeChat mini-program.
- Allow users to combine keyword, country, qualification, and subject filters using real API values.
- Let users move from a university card to its introduction, available programme groups, programme list, and programme details without losing context.
- Present programme descriptions and basic facts in a readable order before advanced sections.
- Reserve an honest, accessible locked-preview treatment for future paid sections.
- Preserve existing favourites, pagination, caching, loading, empty, offline, failure, and retry behaviour.
- Continue using existing university and programme APIs as the only source of business data.

## Non-Goals

- Payment, points, subscriptions, purchases, and entitlement checks.
- Fabricated rankings, campuses, tuition, course structures, entry requirements, or other university data.
- New backend endpoints or database schema changes unless implementation proves an existing response cannot support an approved visible field.
- Redesigning unrelated home, account, planning, application, or community pages.

## Design Direction

The pages will use the layout and interaction flow of the supplied references while retaining the 洋豆角 product identity.

- Warm yellow is the principal accent for custom navigation, active filters, tabs, section rules, and locked panels.
- White and soft neutral grey form the page surfaces.
- Near-black text provides high contrast; green remains available for existing saved and consultation actions where appropriate.
- University photography carries the directory; text overlays use a bottom gradient for predictable readability.
- Rounded corners and shadows remain restrained so the pages feel editorial rather than card-heavy.
- Controls use at least 88 rpx touch targets where practical.
- Existing business sentences and API content remain unchanged.

## User Flow

1. The user opens the university directory.
2. The user may enter a university or programme keyword.
3. The user may expand country and qualification filters and may also use the existing subject filter.
4. Results update with all active conditions combined.
5. The user selects a photographic university card.
6. The university detail opens on the introduction view and exposes a programme-query view.
7. The user selects a programme category and then a programme.
8. The programme detail presents its description and basic information first.
9. Advanced sections appear normally when public and as locked previews when designated for future paid access.

Back navigation uses the native page stack, so returning to the directory preserves the page instance, search query, filters, loaded results, and scroll position.

## University Directory

### Header and Search

The page uses the native navigation bar and begins with a compact search row. The input searches both school and programme keywords through the existing `q` parameter. Submitting trims the value and reloads from page one.

### Filters

Country and qualification are prominent inline selectors matching the references. Subject remains available as a third selector so current functionality is not removed.

- Country options come from `GET /api/v1/catalog/filter-options` → `countries`.
- Qualification options come from the same endpoint → `studyLevels` and therefore include Diploma, Bachelor, Master, and any future configured level.
- Subject options come from `subjectCategories`.
- `ALL` is a client-only neutral option and is never sent to the API.
- Selecting an option closes the expanded menu and reloads results from page one.
- Only one menu may be expanded at a time.
- Tapping outside or choosing the current value closes the menu.
- The active option uses the yellow accent and a check mark.
- While a menu is open, the result area receives a non-interactive dim layer as in the references.
- The reset action clears keyword and every filter.

The request continues to use `/api/v1/universities/search` with `q`, `country`, `level`, `category`, `page`, `size`, and `sort=relevance`, so filter combinations remain server-driven.

### Result Cards

Each result is a full-width image card with:

- campus or approved university image;
- Chinese and English university names;
- city and country text;
- ranking only when a real ranking field becomes available;
- a bottom gradient behind overlaid text;
- a predictable fallback when a campus image is unavailable.

No ranking label will be inferred from result position. Existing university favourites remain accessible through a labelled control without making the entire card harder to tap.

Infinite loading continues at the bottom. Duplicate slugs remain de-duplicated when pages are appended.

### Directory States

- Loading: image-card skeletons that match the final geometry.
- Empty: explanation plus a control to reset the current search and filters.
- Offline: network message and retry.
- Failed: service message and retry.
- Image failure: branded fallback rather than a broken image icon.

## University Detail

### Custom Header and Hero

The page uses a custom warm-yellow navigation header with safe-area spacing, a back control, the title `院校详情`, and standard WeChat capsule clearance. A full-width campus hero follows. If no campus image exists, the approved branded fallback is used.

### School Identity

Below the hero, one connected identity region displays:

- university logo;
- Chinese and English names;
- city and country;
- ranking only if provided by trusted data;
- favourite control;
- a programme count when available.

No decorative building, crest, or ranking is invented.

### Main Tabs

The page has two primary tabs:

- `院校简介`
- `专业查询`

The introduction view renders the existing Chinese description with readable paragraph spacing. If the description is absent, the existing audited fallback copy is used.

The programme-query view derives category chips from the university’s returned programmes. The first chip is `全部学院`; subsequent chips use API category codes mapped through catalogue labels when available. Selecting a chip filters in memory and does not refetch the university page.

Programme rows display only fields returned by the API: Chinese name, English name, study level, duration, tuition summary, and intake summary where present. Selecting a row opens the corresponding programme detail route.

The existing fixed consultation and favourite controls are retained, but their visual treatment is aligned with the new page.

## Programme Detail

### Identity

The page uses the same custom warm-yellow navigation header with the title `专业详情`. A compact identity row contains the university logo, Chinese programme name, English programme name, and university name. The service will expose the known university logo using the existing media mapping rather than downloading or inventing artwork.

### Content Order

The programme content is a single readable document rather than a tab-only interface:

1. `专业描述`
2. `基本信息`
3. `录取要求`
4. `课程设置`
5. remaining public sections in API sort order

The description uses `descriptionZh`, falling back to the `INTRODUCTION` section if needed. Repeated introduction text is rendered once.

### Basic Information Table

The table uses labels on the left and API values on the right. Rows appear only when meaningful, except that core missing values retain the current audited fallback text.

- 学历 → `studyLevelCode`
- 学制 → `durationDisplay`
- 模式／方式 → `courseModeCode` or `studyPaceDisplay`
- 授课语言 → `languageCodes`
- 开学日期 → `intakeDisplayTexts`
- 学习地点 → `cityZh`
- 学费 → `tuitionDisplay`

Credits are shown only if a future trusted API field is added; no credits are derived.

### Locked Previews

The first implementation treats `ADMISSION_REQUIREMENTS`, `ADMISSIONS`, `COURSE_STRUCTURE`, and `CURRICULUM` as future premium candidates. Their headings remain visible. Their bodies use a decorative preview layer with blur and a yellow lock panel explaining that the section is not yet available.

Rules:

- No payment or points amount is displayed.
- No purchase button is displayed.
- No locked text is rendered into an accessible label.
- The UI must not imply that payment is already supported.
- A central configuration function identifies locked section types so future entitlement work can replace the temporary rule without rewriting the page.
- Introduction, basic facts, career information, and other public sections remain readable.

## Data and Component Changes

### Services

`services/universities.ts` remains responsible for university directory and detail mapping. The presentation may add derived view fields, but strict response validation stays in the service layer.

`services/miniapp-data.ts` continues to map programme details. Programme identity will reuse the existing university media helper to obtain a known logo URL from `universitySlug`.

No UI component reads unvalidated raw responses.

### Pages

- `pages/universities`: search, inline selector state, combined query, photographic results, and state views.
- `pages/university-detail`: header, hero, school identity, main tab state, derived programme categories, and filtered programme list.
- `pages/programme-detail`: ordered document sections, facts table, and locked-preview policy.

### Reusable UI

The current `university-card` component may be restyled or replaced with a directory-specific result component. If it remains shared with the home page, visual changes must not silently alter the home layout. A separate component is preferred when the two contexts require different compositions.

## Accessibility and WeChat Behaviour

- Buttons and tappable rows have meaningful `aria-label` values.
- Colour is not the sole signal for an active filter or locked section.
- Text remains readable over images through a fixed gradient and tested contrast.
- Custom headers account for `env(safe-area-inset-top)` and the WeChat menu capsule.
- Dropdowns are keyboard-independent and operable through native tap events.
- Loading controls cannot issue duplicate requests.
- Reduced animation does not affect comprehension; motion is limited to short opacity and translate transitions.

## Performance

- Campus images use `lazy-load`, `fade-show`, and `aspectFill`.
- Directory responses continue to paginate and de-duplicate.
- Existing two-minute service caches remain in place.
- Category filtering on a loaded university happens locally.
- State changes update only affected page data; large objects are not repeatedly cloned for decoration.
- Dropdown overlays do not create additional network calls until a value changes.

## Error Handling

- Superseded searches remain silent.
- Failed filters do not prevent an unfiltered directory from loading.
- A failed university image falls back independently without failing its card.
- University detail loads detail and programmes together and exposes retry when either required source fails.
- Programme detail retains loading, offline, failure, and retry states.
- Invalid route parameters never issue malformed requests.

## Testing Strategy

Implementation follows test-driven development.

### Unit tests

- Country, level, and category selections generate the expected combined API query.
- `ALL` options are omitted from requests.
- Programme category derivation is deterministic and de-duplicated.
- Programme filtering returns the correct subset and all-programmes state.
- Section ordering places description and basic information before advanced sections.
- Locked section classification includes admissions and curriculum aliases only.
- Programme identity resolves known university logos safely.

### Contract and source tests

- WXML remains compatible with native WeChat mini-program syntax.
- Each custom navigation page retains safe-area and back controls.
- Directory cards and programme rows expose accessible actions.
- Existing favourites and routes remain wired.

### Repository checks

- `npm test`
- `npm run typecheck`
- `npm run lint`
- the mini-program package’s full `npm run check`

Visual verification will cover narrow phone widths, long bilingual names, missing images, missing optional values, open filter menus, empty results, and multiple programme categories.

## Acceptance Criteria

- The three pages follow the supplied reference flow and visual hierarchy.
- Country and qualification selectors are populated from API catalogue values.
- Keyword, country, qualification, and subject filters work in combination.
- Selecting a university opens the correct university detail.
- Selecting a category filters only that university’s programmes.
- Selecting a programme opens the correct programme detail.
- University and programme text comes from existing APIs or existing audited fallbacks.
- Programme description and basic facts are readable without payment.
- Admissions and curriculum appear as honest locked previews with no payment claims.
- Existing favourites, pagination, caching, loading, empty, offline, failed, and retry behaviours continue to work.
- Tests, type checking, and linting pass.
