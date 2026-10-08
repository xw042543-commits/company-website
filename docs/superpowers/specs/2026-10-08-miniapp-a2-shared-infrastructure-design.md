# UDAJO Mini Program A2 Shared Infrastructure Design

**Date:** 2026-10-08  
**Owner:** A（小程序基础设施）  
**Status:** Approved for planning

## 1. Goal

Strengthen the shared mini-program layer after the first foundation release so B and C can build their pages without duplicating network, catalogue, routing, image-fallback, or request-race logic.

This increment must ensure that rapid searches cannot publish stale data, all filter values come from the existing backend catalogue, broken remote images keep a stable branded layout, and detail links use one encoded route contract.

## 2. Scope

This increment includes:

- keyed cancellation for superseded read requests;
- latest-result protection at the university-search boundary;
- a strict mini-program client for `/api/v1/catalog/filter-options`;
- shared university and programme route builders;
- deterministic image-error fallback in the existing university card;
- unit and contract tests for every public interface;
- short collaboration documentation for B and C.

This increment does not include:

- university-detail or programme-detail page implementation;
- planning, account, order, points, or application business flows;
- U圈 feeds, comments, moderation, reporting, or capacity work;
- new backend catalogue endpoints or hard-coded fallback catalogue data;
- official WeChat AppID or device acceptance work.

## 3. Chosen Approach

### 3.1 Request cancellation

Extend the shared request layer with an optional `requestKey`. Only requests that deliberately provide the same key compete with one another. Starting a new request with that key settles the previous logical request as:

```ts
{ ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } }
```

and aborts its current `wx.request` task. The cancellation registry belongs to each `HttpClient` instance so tests and independently configured clients cannot affect one another. The application-level client remains one shared instance.

An authentication retry remains part of the same logical request and keeps ownership of its key. It must not cancel itself when retrying after a successful token refresh. Completion, failure, or explicit supersession always removes the registry entry only when the entry still belongs to that request.

University searches use a stable key such as `university-search`. The university service owns a monotonically increasing search generation and rejects a response as superseded when its generation is no longer current. This keeps the race policy in A's shared layer instead of requiring B's page to reimplement it, and it covers transports where abort completion races with a success callback.

The alternatives rejected were page-only generation checks, which prevent stale rendering but waste network and server work, and global cancellation of every GET, which would make unrelated pages interfere with one another.

### 3.2 Catalogue service

Add a public `catalogue.ts` service with these types:

```ts
interface FilterOption {
  readonly code: string;
  readonly nameZh: string;
  readonly nameEn: string;
}

interface FilterOptions {
  readonly countries: FilterOption[];
  readonly subjectCategories: FilterOption[];
  readonly studyLevels: FilterOption[];
  readonly courseModes: FilterOption[];
  readonly languages: FilterOption[];
}
```

`loadFilterOptions()` calls the existing public endpoint and strictly validates all five arrays. Every option requires a nonblank code, string labels, at least one nonblank label, and a unique code inside its group. Malformed responses return `INVALID_FILTER_OPTIONS_RESPONSE`; transport and HTTP errors keep the normalized shared error.

The service does not invent an `ALL` database value. Pages create their own localized “全部” presentation option and omit it from API requests. It does not ship local fallback catalogue data because PostgreSQL remains the source of truth.

Successful values may be memoized in memory for the current app process. Failures are never cached, and the service exposes a reset function for pull-to-refresh and tests. No catalogue value is written to local storage.

### 3.3 Route contract

Add `utils/routes.ts` with pure builders:

```ts
universityDetailRoute(slug: string)
programmeDetailRoute(universitySlug: string, programmeId: number | string)
```

The agreed destinations are:

- `/pages/university-detail/index?slug=<encoded slug>`
- `/pages/programme-detail/index?universitySlug=<encoded slug>&programmeId=<encoded id>`

Builders trim and validate identifiers, encode every query value, and return a validation result instead of producing a route for blank or unsafe input. B and C register and implement the destination pages on their own branches. A does not add placeholder detail pages or navigation to nonexistent routes.

### 3.4 Image fallback

The shared university card owns image presentation. It reserves the same dimensions whether the remote image is loading, loaded, missing, or failed. `binderror` switches to the existing brand fallback and never retries automatically. When a card receives a different image URL, the failed state resets.

The card emits only the stable university slug. It never emits a raw image URL, database object, or index.

### 3.5 Collaboration boundary

B and C must consume:

- `services/http.ts` for transport;
- `services/catalogue.ts` for filter dictionaries;
- `utils/routes.ts` for detail routes;
- shared components for loading/error and image fallback.

They must not create a second HTTP client, copy catalogue values into page files, or build routes through string concatenation. Any contract change starts with shared types and tests on A's branch before dependent page changes.

## 4. Data and State Flow

1. A page requests filter options through `loadFilterOptions()`.
2. The catalogue service strictly validates the backend response before exposing it.
3. The user changes search text or filters.
4. The university service sends a keyed request and advances its shared search generation.
5. The shared client settles and aborts the previous request with the same key.
6. The university service exposes only the current generation; a superseded result is silent and cannot become ready, empty, offline, or failed page state.
7. Cards render returned image URLs when present and a dimensionally identical fallback when absent or broken.
8. A valid card selection gives B's page a stable, encoded route generated by the route helper.

## 5. Error Handling

- Superseded requests are silent and never become an offline or empty state.
- Network failures remain `unavailable`; malformed payloads remain `unexpected` with a stable code.
- A catalogue failure leaves filters unavailable and retryable; it does not substitute hard-coded codes.
- Empty catalogue groups are valid only when the backend returns a structurally valid empty array.
- Blank route identifiers fail locally and never call a navigation API.
- Image failures affect only the image presentation and do not remove the university card.
- Raw backend messages, URLs containing credentials, and provider responses never reach page copy or logs.

## 6. Tests and Acceptance

Automated tests must prove:

- a second request with the same key aborts and supersedes the first;
- unrelated request keys and requests without keys run independently;
- an authenticated retry does not cancel itself;
- late success from an aborted transport cannot replace the newest search state;
- valid filter options map all five groups;
- duplicate codes, missing groups, wrong field types, and blank codes fail closed;
- failures are not cached and a later retry can succeed;
- `ALL` remains a presentation value and is never returned by the catalogue service;
- route builders encode slugs and identifiers and reject blanks;
- the university card declares image-error handling and preserves the fallback dimensions;
- existing authentication, university mapping, TypeScript, and ESLint checks remain green.

Manual verification in WeChat DevTools must cover rapid repeated searches, switching filters while a request is in flight, offline recovery, a deliberately broken image URL, pull-to-refresh catalogue recovery, and navigation once B/C detail pages are merged. Manual verification cannot be claimed until an authorized AppID and DevTools session are available.

## 7. Files Expected to Change

- Modify `miniapp/miniprogram/services/http.ts`
- Modify `miniapp/miniprogram/services/universities.ts`
- Create `miniapp/miniprogram/services/catalogue.ts`
- Create `miniapp/miniprogram/utils/routes.ts`
- Modify `miniapp/miniprogram/components/university-card/index.{ts,wxml}`
- Modify `miniapp/README.md`
- Modify `miniapp/tests/http.test.ts`
- Modify `miniapp/tests/universities.test.ts`
- Create `miniapp/tests/catalogue.test.ts`
- Create `miniapp/tests/routes.test.ts`
- Create `miniapp/tests/component-contracts.test.ts`

No backend schema or endpoint change is expected.

## 8. Completion Criteria

- All automated acceptance cases above pass.
- `npm run check` passes from `miniapp/`.
- Existing backend and frontend regression suites remain unaffected; focused integration checks run if shared contracts require them.
- No real AppID, AppSecret, token, account, or sample university is added.
- The A branch is pushed and PR #72 is updated with test evidence and the manual-verification limitation.
