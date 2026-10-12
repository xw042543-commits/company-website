# Mini Program A2 Shared Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cancellation-safe requests, authoritative filter dictionaries, shared detail routes, and deterministic university-image fallback without changing the B/C product layouts.

**Architecture:** The existing `HttpClient` becomes the single owner of keyed cancellation and keeps one logical owner across authentication retries. Thin shared services validate backend payloads and protect university searches from stale completion, while pure route helpers and the existing card component provide reusable UI contracts to B and C.

**Tech Stack:** Native WeChat Mini Program, TypeScript 5.9, `wx.request`, Node.js 24 test runner through `tsx`, ESLint 9.

**Spec:** `docs/superpowers/specs/2026-10-08-miniapp-a2-shared-infrastructure-design.md`

## Global Constraints

- Reuse `GET /api/v1/catalog/filter-options`; do not add a backend endpoint or local fallback dictionary.
- `ALL` is presentation-only and must never be returned by the catalogue service or sent as a concrete filter.
- A superseded request returns `unexpected/REQUEST_SUPERSEDED` and must not alter visible page state.
- Keep one shared application HTTP client; independent clients created in tests must never share cancellation state.
- Do not create university-detail or programme-detail placeholder pages and do not navigate to routes whose pages are not yet registered.
- Do not add a real AppID, AppSecret, token, user account, or invented university/programme data.
- Preserve the existing page layout, tabs, authentication flow, pagination, and B/C ownership boundaries.

---

### Task 1: Keyed cancellation in the shared HTTP client

**Files:**
- Modify: `miniapp/miniprogram/services/http.ts`
- Modify: `miniapp/tests/http.test.ts`

**Interfaces:**
- Consumes: existing `RequestOptions`, `HttpTransport`, `TransportTask`, `Result<T>`, token reader, and unauthorized handler.
- Produces: `RequestOptions.requestKey?: string`; keyed requests settle older owners with `{ ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } }`; the exported `request<T>()` uses one lazily created application client.

- [ ] **Step 1: Add failing keyed-cancellation tests**

Append tests with a controllable transport. The first test must start two same-key requests, assert that the first task was aborted, assert the first promise resolves as superseded, then complete the second request successfully. The second test must prove different keys do not abort one another.

```ts
test('a newer request with the same key aborts and supersedes the previous owner', async () => {
  const pending: Array<{
    options: Parameters<HttpTransport>[0];
    aborted: boolean;
  }> = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (options) => {
    const entry = { options, aborted: false };
    pending.push(entry);
    return { abort() { entry.aborted = true; } };
  });

  const first = client.request({ method: 'GET', path: '/api/v1/first', requestKey: 'search' });
  const second = client.request<{ id: number }>({
    method: 'GET', path: '/api/v1/second', requestKey: 'search',
  });

  assert.equal(pending[0]?.aborted, true);
  assert.deepEqual(await first, {
    ok: false,
    error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' },
  });
  pending[1]?.options.success({ statusCode: 200, data: { id: 2 }, header: {}, cookies: [] });
  assert.deepEqual(await second, { ok: true, value: { id: 2 } });
});

test('different request keys remain independent', () => {
  const aborted: boolean[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), () => {
    const index = aborted.push(false) - 1;
    return { abort() { aborted[index] = true; } };
  });

  void client.request({ method: 'GET', path: '/api/v1/a', requestKey: 'a' });
  void client.request({ method: 'GET', path: '/api/v1/b', requestKey: 'b' });

  assert.deepEqual(aborted, [false, false]);
});
```

- [ ] **Step 2: Run the focused tests and verify the new contract fails**

Run: `cd miniapp && npm test -- --test-name-pattern='same key|different request keys'`

Expected: FAIL because `RequestOptions` does not accept `requestKey` and the first transport task is not aborted.

- [ ] **Step 3: Implement one logical request owner per key**

Add `requestKey` and keep the registry inside `createHttpClient`. Use a single `finish` function so late transport callbacks cannot settle an already superseded request. Keep authentication refresh/retry inside the same owner rather than recursively calling the public `request` method.

```ts
export interface RequestOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly path: `/api/${string}`;
  readonly data?: unknown;
  readonly idempotencyKey?: string;
  readonly authenticated?: boolean;
  readonly requestKey?: string;
}

interface ActiveRequest {
  readonly owner: symbol;
  supersede(): void;
}

export function createHttpClient(
  runtime: RuntimeConfig,
  transport: HttpTransport,
  tokenReader: () => string | null = () => null,
  onUnauthorized: (() => Promise<boolean>) | null = null,
): HttpClient {
  const active = new Map<string, ActiveRequest>();
  return {
    request<T>(options: RequestOptions): Promise<Result<T>> {
      if (!isSafePath(options.path)) {
        return Promise.resolve(failure('validation', 'INVALID_REQUEST_PATH'));
      }
      const owner = Symbol(options.requestKey ?? 'request');
      let settled = false;
      let currentTask: TransportTask | null = null;

      return new Promise<Result<T>>((resolve) => {
        const finish = (result: Result<T>) => {
          if (settled) return;
          settled = true;
          if (options.requestKey && active.get(options.requestKey)?.owner === owner) {
            active.delete(options.requestKey);
          }
          resolve(result);
        };
        const supersede = () => {
          const task = currentTask;
          finish(failure('unexpected', 'REQUEST_SUPERSEDED'));
          task?.abort();
        };
        if (options.requestKey) {
          active.get(options.requestKey)?.supersede();
          active.set(options.requestKey, { owner, supersede });
        }

        const handleResult = async (result: Result<T>, retried: boolean): Promise<void> => {
          if (settled) return;
          if (!retried && options.authenticated && !result.ok
            && result.error.kind === 'unauthorized' && onUnauthorized) {
            const refreshed = await onUnauthorized();
            if (settled) return;
            if (refreshed) { await attempt(true); return; }
          }
          finish(result);
        };
        const attempt = async (retried: boolean): Promise<void> => {
          if (settled) return;
          const header: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
          if (options.authenticated) {
            const token = tokenReader();
            if (!token) {
              if (!retried && onUnauthorized) {
                const refreshed = await onUnauthorized();
                if (settled) return;
                if (refreshed) { await attempt(true); return; }
              }
              finish(failure('unauthorized', 'AUTHENTICATION_REQUIRED'));
              return;
            }
            header.Authorization = `Bearer ${token}`;
          }
          if (options.idempotencyKey) header['Idempotency-Key'] = options.idempotencyKey;
          currentTask = transport({
            url: `${runtime.apiOrigin}${options.path}`,
            method: options.method,
            ...(options.data === undefined ? {} : { data: options.data }),
            header,
            timeout: runtime.requestTimeoutMs,
            success: (response) => { void handleResult(mapResponse<T>(response), retried); },
            fail: () => finish(failure('unavailable', 'NETWORK_UNAVAILABLE')),
          });
        };
        void attempt(false);
      });
    },
  };
}
```

Retain all current safe-path, header, status mapping, and missing-token behavior. The implementation may factor header construction into a private function, but it must not expose transport failures or backend messages.

- [ ] **Step 4: Replace per-call application clients with one lazy shared client**

Keep test-created clients isolated, but make the exported application helper retain its cancellation registry. Delegate token access to the latest configured readers so `setAccessTokenReader` and `setUnauthorizedHandler` still work after the client exists.

```ts
let applicationClient: HttpClient | null = null;

export function request<T>(options: RequestOptions): Promise<Result<T>> {
  applicationClient ??= createHttpClient(
    currentRuntimeConfig(),
    wechatTransport,
    () => accessTokenReader(),
    async () => unauthorizedHandler ? unauthorizedHandler() : false,
  );
  return applicationClient.request<T>(options);
}
```

- [ ] **Step 5: Add and pass the authentication-retry ownership regression**

Extend the existing 401 refresh test with `requestKey: 'account'`, record `abort()` calls, and assert two transport attempts, one refresh, zero aborts, and a successful result.

Run: `cd miniapp && npm test -- tests/http.test.ts`

Expected: all HTTP tests PASS.

- [ ] **Step 6: Commit the HTTP contract**

```bash
git add miniapp/miniprogram/services/http.ts miniapp/tests/http.test.ts
git commit -m "feat: add keyed miniapp request cancellation"
```

---

### Task 2: Latest-only university search integration

**Files:**
- Modify: `miniapp/miniprogram/services/universities.ts`
- Modify: `miniapp/miniprogram/pages/universities/index.ts`
- Modify: `miniapp/tests/universities.test.ts`

**Interfaces:**
- Consumes: `RequestOptions.requestKey`, `request<T>()`, and `Result<T>` from Task 1.
- Produces: `UniversitySearchService` and `createUniversitySearchService(requester)` for isolated tests; existing `searchUniversities(input)` remains the page-facing API; superseded calls return `REQUEST_SUPERSEDED`.

- [ ] **Step 1: Write a failing late-response race test**

Create a requester that exposes its resolvers. Resolve the second request first and the first request last. The second must map successfully; the first must be rejected as superseded even though its raw payload is valid.

```ts
test('late university responses cannot replace the newest search generation', async () => {
  const resolvers: Array<(value: Result<unknown>) => void> = [];
  const service = createUniversitySearchService(() => new Promise<Result<unknown>>((resolve) => {
    resolvers.push(resolve);
  }));

  const first = service.search({ q: 'old' });
  const second = service.search({ q: 'new' });
  resolvers[1]?.({ ok: true, value: fixture });
  assert.equal((await second).ok, true);
  resolvers[0]?.({ ok: true, value: fixture });
  assert.deepEqual(await first, {
    ok: false,
    error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' },
  });
});
```

Also capture the requester options and assert every search uses `requestKey: 'university-search'`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `cd miniapp && npm test -- --test-name-pattern='late university responses'`

Expected: FAIL because `createUniversitySearchService` does not exist.

- [ ] **Step 3: Implement the search service with a monotonic generation**

Keep the current public function for B's page, but delegate it to one default service.

```ts
type UnknownRequester = (options: RequestOptions) => Promise<Result<unknown>>;

export interface UniversitySearchService {
  search(input?: UniversitySearchInput): Promise<Result<UniversityPage>>;
}

export function createUniversitySearchService(
  requester: UnknownRequester = (options) => request<unknown>(options),
): UniversitySearchService {
  let generation = 0;
  return {
    async search(input: UniversitySearchInput = {}) {
      const current = ++generation;
      const result = await requester({
        method: 'GET',
        path: buildUniversitySearchPath(input),
        requestKey: 'university-search',
      });
      if (current !== generation) return superseded();
      if (!result.ok) return result;
      return mapUniversityPage(result.value);
    },
  };
}

const defaultUniversitySearch = createUniversitySearchService();

export function searchUniversities(input: UniversitySearchInput = {}) {
  return defaultUniversitySearch.search(input);
}
```

Import `RequestOptions` as a type from `http.ts` and add a private `superseded()` helper returning the exact shared error code.

- [ ] **Step 4: Make the existing page silently ignore superseded work**

Add the guard before the current offline/failed mapping; do not alter templates, filters, pagination, or card selection.

```ts
if (!result.ok) {
  if (result.error.code === 'REQUEST_SUPERSEDED') return;
  const state: ViewState = result.error.kind === 'unavailable' ? 'offline' : 'failed';
  this.setData({ state, loadingMore: false });
  return;
}
```

- [ ] **Step 5: Run service and full mini-app tests**

Run: `cd miniapp && npm test -- tests/universities.test.ts`

Expected: all university tests PASS, including existing response validation and `ALL` omission.

Run: `cd miniapp && npm run typecheck`

Expected: PASS with strict and exact optional property checks.

- [ ] **Step 6: Commit latest-only search behavior**

```bash
git add miniapp/miniprogram/services/universities.ts miniapp/miniprogram/pages/universities/index.ts miniapp/tests/universities.test.ts
git commit -m "feat: protect miniapp university searches from stale results"
```

---

### Task 3: Authoritative filter catalogue service

**Files:**
- Create: `miniapp/miniprogram/services/catalogue.ts`
- Create: `miniapp/tests/catalogue.test.ts`

**Interfaces:**
- Consumes: shared `request<T>()`, `RequestOptions`, and `Result<T>`.
- Produces: `FilterOption`, `FilterOptions`, `CatalogueService`, `createCatalogueService(requester)`, `loadFilterOptions()`, and `resetFilterOptionsCache()`.

- [ ] **Step 1: Write failing mapping and validation tests**

Use this valid fixture and assert all five groups remain bilingual and contain no synthetic `ALL` entry.

```ts
const valid = {
  countries: [{ code: 'MY', nameZh: '马来西亚', nameEn: 'Malaysia' }],
  subjectCategories: [{ code: 'BUSINESS', nameZh: '商业与管理', nameEn: 'Business and Management' }],
  studyLevels: [{ code: 'BACHELOR', nameZh: '本科', nameEn: 'Bachelor' }],
  courseModes: [{ code: 'ON_CAMPUS', nameZh: '线下授课', nameEn: 'On campus' }],
  languages: [{ code: 'EN', nameZh: '英语', nameEn: 'English' }],
};

test('maps all five authoritative filter groups without inventing ALL', async () => {
  const service = createCatalogueService(async () => ({ ok: true, value: valid }));
  const result = await service.load();
  assert.deepEqual(result, { ok: true, value: valid });
  if (result.ok) {
    assert.equal(Object.values(result.value).flat().some((item) => item.code === 'ALL'), false);
  }
});
```

Add table-driven invalid fixtures for a missing group, a non-array group, a blank code, both labels blank, a non-string label, and duplicate codes within one group. Every case must return `unexpected/INVALID_FILTER_OPTIONS_RESPONSE`.

```ts
for (const [name, raw] of [
  ['missing group', { ...valid, languages: undefined }],
  ['non-array group', { ...valid, countries: {} }],
  ['blank code', { ...valid, countries: [{ code: ' ', nameZh: '马来西亚', nameEn: 'Malaysia' }] }],
  ['blank labels', { ...valid, countries: [{ code: 'MY', nameZh: ' ', nameEn: '' }] }],
  ['non-string label', { ...valid, countries: [{ code: 'MY', nameZh: 7, nameEn: 'Malaysia' }] }],
  ['duplicate code', { ...valid, countries: [valid.countries[0], valid.countries[0]] }],
] as const) {
  test(`rejects ${name}`, async () => {
    const service = createCatalogueService(async () => ({ ok: true, value: raw }));
    assert.deepEqual(await service.load(), {
      ok: false,
      error: { kind: 'unexpected', code: 'INVALID_FILTER_OPTIONS_RESPONSE' },
    });
  });
}
```

- [ ] **Step 2: Write failing cache lifecycle tests**

Assert concurrent loads share one requester call, successful results are reused, `reset()` triggers a new call, a request completed after reset cannot refill the cache, and a failed result is not cached.

```ts
test('does not cache failures and retries on the next load', async () => {
  let calls = 0;
  const service = createCatalogueService(async () => {
    calls += 1;
    return calls === 1
      ? { ok: false, error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' } }
      : { ok: true, value: valid };
  });

  assert.equal((await service.load()).ok, false);
  assert.equal((await service.load()).ok, true);
  assert.equal(calls, 2);
});

test('shares in-flight work and reset prevents an old completion from refilling cache', async () => {
  let calls = 0;
  const resolvers: Array<(result: Result<unknown>) => void> = [];
  const service = createCatalogueService(() => {
    calls += 1;
    return new Promise<Result<unknown>>((resolve) => resolvers.push(resolve));
  });

  const first = service.load();
  const shared = service.load();
  assert.equal(first, shared);
  assert.equal(calls, 1);

  service.reset();
  resolvers[0]?.({ ok: true, value: valid });
  await first;
  const afterReset = service.load();
  assert.equal(calls, 2);
  resolvers[1]?.({ ok: true, value: valid });
  assert.equal((await afterReset).ok, true);
  assert.deepEqual(await service.load(), { ok: true, value: valid });
  assert.equal(calls, 2);
});
```

- [ ] **Step 3: Run the catalogue tests and verify they fail**

Run: `cd miniapp && npm test -- tests/catalogue.test.ts`

Expected: FAIL because the service module does not exist.

- [ ] **Step 4: Implement strict parsing and process-memory caching**

Define readonly public types and one service instance with an injectable requester.

```ts
export interface FilterOption {
  readonly code: string;
  readonly nameZh: string;
  readonly nameEn: string;
}

export interface FilterOptions {
  readonly countries: FilterOption[];
  readonly subjectCategories: FilterOption[];
  readonly studyLevels: FilterOption[];
  readonly courseModes: FilterOption[];
  readonly languages: FilterOption[];
}

export interface CatalogueService {
  load(): Promise<Result<FilterOptions>>;
  reset(): void;
}
```

Use a fixed `GROUPS` tuple for the five property names. `parseFilterOptions(raw)` must require an object and every group. `parseGroup` must require arrays; string `code`, `nameZh`, and `nameEn`; trimmed nonblank code; at least one trimmed nonblank label; and unique code within that group. Return newly allocated trimmed objects rather than exposing the raw payload.

```ts
const GROUPS = [
  'countries', 'subjectCategories', 'studyLevels', 'courseModes', 'languages',
] as const;

function parseGroup(raw: unknown): FilterOption[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const options: FilterOption[] = [];
  for (const item of raw) {
    if (!isObject(item) || typeof item.code !== 'string'
      || typeof item.nameZh !== 'string' || typeof item.nameEn !== 'string') return null;
    const code = item.code.trim();
    const nameZh = item.nameZh.trim();
    const nameEn = item.nameEn.trim();
    if (!code || (!nameZh && !nameEn) || seen.has(code)) return null;
    seen.add(code);
    options.push({ code, nameZh, nameEn });
  }
  return options;
}

export function parseFilterOptions(raw: unknown): Result<FilterOptions> {
  if (!isObject(raw)) return invalidFilterOptions();
  const parsed = Object.fromEntries(GROUPS.map((group) => [group, parseGroup(raw[group])]));
  if (GROUPS.some((group) => parsed[group] === null)) return invalidFilterOptions();
  return {
    ok: true,
    value: {
      countries: parsed.countries as FilterOption[],
      subjectCategories: parsed.subjectCategories as FilterOption[],
      studyLevels: parsed.studyLevels as FilterOption[],
      courseModes: parsed.courseModes as FilterOption[],
      languages: parsed.languages as FilterOption[],
    },
  };
}
```

The service holds `cached: FilterOptions | null`, `pending: Promise<Result<FilterOptions>> | null`, and a numeric `generation`. Each load captures the current generation. On success, set `cached` only when the captured generation is still current; in `finally`, clear `pending` only when it is still the same promise; on failure, leave `cached` null. `reset()` increments `generation` and clears both cached value and pending reference, so an older completion cannot repopulate the cache. The default loader calls exactly:

```ts
type UnknownRequester = (options: RequestOptions) => Promise<Result<unknown>>;

export function createCatalogueService(
  requester: UnknownRequester = (options) => request<unknown>(options),
): CatalogueService {
  let cached: FilterOptions | null = null;
  let pending: Promise<Result<FilterOptions>> | null = null;
  let generation = 0;
  return {
    load() {
      if (cached) return Promise.resolve({ ok: true, value: cached });
      if (pending) return pending;
      const current = generation;
      const work = (async (): Promise<Result<FilterOptions>> => {
        const response = await requester({
          method: 'GET',
          path: '/api/v1/catalog/filter-options',
        });
        if (!response.ok) return response;
        const parsed = parseFilterOptions(response.value);
        if (parsed.ok && current === generation) cached = parsed.value;
        return parsed;
      })();
      pending = work;
      void work.finally(() => { if (pending === work) pending = null; });
      return work;
    },
    reset() {
      generation += 1;
      cached = null;
      pending = null;
    },
  };
}

const catalogue = createCatalogueService();

export function loadFilterOptions(): Promise<Result<FilterOptions>> {
  return catalogue.load();
}

export function resetFilterOptionsCache(): void {
  catalogue.reset();
}
```

- [ ] **Step 5: Run catalogue tests, typecheck, and lint**

Run: `cd miniapp && npm test -- tests/catalogue.test.ts && npm run typecheck && npm run lint`

Expected: all commands PASS.

- [ ] **Step 6: Commit the catalogue contract**

```bash
git add miniapp/miniprogram/services/catalogue.ts miniapp/tests/catalogue.test.ts
git commit -m "feat: add miniapp filter catalogue service"
```

---

### Task 4: Encoded detail-route builders

**Files:**
- Create: `miniapp/miniprogram/utils/routes.ts`
- Create: `miniapp/tests/routes.test.ts`

**Interfaces:**
- Consumes: `Result<T>`.
- Produces: `universityDetailRoute(slug: string): Result<string>` and `programmeDetailRoute(universitySlug: string, programmeId: number | string): Result<string>`.

- [ ] **Step 1: Write failing route contract tests**

```ts
test('builds encoded university and programme detail routes', () => {
  assert.deepEqual(universityDetailRoute('segi-university'), {
    ok: true,
    value: '/pages/university-detail/index?slug=segi-university',
  });
  assert.deepEqual(programmeDetailRoute('segi-university', 584), {
    ok: true,
    value: '/pages/programme-detail/index?universitySlug=segi-university&programmeId=584',
  });
  assert.deepEqual(universityDetailRoute('  segi-university  '), {
    ok: true,
    value: '/pages/university-detail/index?slug=segi-university',
  });
});

test('rejects blank, malformed slugs and non-positive programme identifiers', () => {
  for (const result of [
    universityDetailRoute(' '),
    universityDetailRoute('../admin'),
    programmeDetailRoute('segi-university', 0),
    programmeDetailRoute('segi-university', '5x'),
  ]) {
    assert.deepEqual(result, {
      ok: false,
      error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' },
    });
  }
});
```

- [ ] **Step 2: Run the route tests and verify they fail**

Run: `cd miniapp && npm test -- tests/routes.test.ts`

Expected: FAIL because `utils/routes.ts` does not exist.

- [ ] **Step 3: Implement pure validation and builders**

Accept canonical lowercase kebab-case slugs and positive integer programme IDs only. Encode validated values even though their accepted character set is already safe.

```ts
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

export function universityDetailRoute(slug: string): Result<string> {
  const normalized = slug.trim();
  if (!SLUG.test(normalized)) return invalidRoute();
  return {
    ok: true,
    value: `/pages/university-detail/index?slug=${encodeURIComponent(normalized)}`,
  };
}

export function programmeDetailRoute(
  universitySlug: string,
  programmeId: number | string,
): Result<string> {
  const slug = universitySlug.trim();
  const id = String(programmeId).trim();
  if (!SLUG.test(slug) || !POSITIVE_INTEGER.test(id)) return invalidRoute();
  return {
    ok: true,
    value: `/pages/programme-detail/index?universitySlug=${encodeURIComponent(slug)}&programmeId=${encodeURIComponent(id)}`,
  };
}
```

Do not call `wx.navigateTo` and do not register the destination pages in `app.json`; B and C will consume these helpers when their pages exist.

- [ ] **Step 4: Run route tests and static checks**

Run: `cd miniapp && npm test -- tests/routes.test.ts && npm run typecheck && npm run lint`

Expected: all commands PASS.

- [ ] **Step 5: Commit route helpers**

```bash
git add miniapp/miniprogram/utils/routes.ts miniapp/tests/routes.test.ts
git commit -m "feat: add miniapp detail route contracts"
```

---

### Task 5: Deterministic university-card image fallback

**Files:**
- Modify: `miniapp/miniprogram/components/university-card/index.ts`
- Modify: `miniapp/miniprogram/components/university-card/index.wxml`
- Create: `miniapp/tests/component-contracts.test.ts`

**Interfaces:**
- Consumes: existing `university.imageUrl` and `university.slug` component properties.
- Produces: local `imageFailed: boolean`, `imageError()` handler, reset-on-university-change behavior, and unchanged `select` event payload `{ slug }`.

- [ ] **Step 1: Write failing component contract tests**

Read the component source as text, following the repository's existing contract-test style. Verify the image declares `binderror="imageError"`, rendering checks `!imageFailed`, the component initializes `imageFailed: false`, and the university property observer resets it.

```ts
const componentTs = readFileSync('miniprogram/components/university-card/index.ts', 'utf8');
const componentWxml = readFileSync('miniprogram/components/university-card/index.wxml', 'utf8');
const componentWxss = readFileSync('miniprogram/components/university-card/index.wxss', 'utf8');

test('university card replaces failed remote images with its stable fallback', () => {
  assert.match(componentWxml, /binderror="imageError"/);
  assert.match(componentWxml, /university\.imageUrl\s*&&\s*!imageFailed/);
  assert.match(componentTs, /imageFailed:\s*false/);
  assert.match(componentTs, /imageError\(\)/);
  assert.match(componentTs, /observer/);
  assert.match(componentWxss, /\.university-image,\.university-fallback\s*\{[^}]*width:144rpx;[^}]*height:144rpx;/s);
});
```

Also assert the WXML still uses the existing `university-fallback` and the TypeScript still triggers only `{ slug }`.

- [ ] **Step 2: Run the component test and verify it fails**

Run: `cd miniapp && npm test -- tests/component-contracts.test.ts`

Expected: FAIL because the image has no error binding or failed state.

- [ ] **Step 3: Add failure state and reset it when the card data changes**

```ts
Component({
  properties: {
    university: {
      type: Object,
      value: {},
      observer() { this.setData({ imageFailed: false }); },
    },
  },
  data: { imageFailed: false },
  methods: {
    imageError() { this.setData({ imageFailed: true }); },
    select() {
      const university = this.data.university as { slug?: unknown };
      this.triggerEvent('select', {
        slug: typeof university.slug === 'string' ? university.slug : undefined,
      });
    },
  },
});
```

Update only the image condition and error binding:

```xml
<image
  wx:if="{{university.imageUrl && !imageFailed}}"
  class="university-image"
  src="{{university.imageUrl}}"
  mode="aspectFill"
  binderror="imageError"
/>
<view wx:else class="university-fallback">U</view>
```

Do not change `.university-image,.university-fallback` dimensions in WXSS; those existing shared dimensions are the layout-stability contract.

- [ ] **Step 4: Run component and full static checks**

Run: `cd miniapp && npm test -- tests/component-contracts.test.ts && npm run typecheck && npm run lint`

Expected: all commands PASS.

- [ ] **Step 5: Commit image fallback behavior**

```bash
git add miniapp/miniprogram/components/university-card/index.ts miniapp/miniprogram/components/university-card/index.wxml miniapp/tests/component-contracts.test.ts
git commit -m "fix: stabilize miniapp university image fallback"
```

---

### Task 6: Collaboration documentation and final verification

**Files:**
- Modify: `miniapp/README.md`
- Verify: all files changed in Tasks 1-5

**Interfaces:**
- Consumes: the public APIs produced in Tasks 1-5.
- Produces: B/C integration rules and recorded automated verification evidence.

- [ ] **Step 1: Document the exact shared contracts for B and C**

Add a compact subsection under “协作边界” stating:

```md
### A2 公共能力

- 可被新查询替代的读取请求必须传稳定的 `requestKey`；页面收到 `REQUEST_SUPERSEDED` 时保持当前状态，不显示失败提示。
- 筛选项统一来自 `services/catalogue.ts`；“全部”只在页面展示，发请求时省略，禁止在页面硬编码数据库 code。
- 院校与专业详情地址统一使用 `utils/routes.ts`；目标页面注册完成前不得导航。
- 远程院校图统一使用 `university-card` 的失败回退，页面不得重复维护图片错误状态。
```

Do not add claims that real AppID, DevTools, preview build, or physical devices were verified.

- [ ] **Step 2: Run the complete mini-app quality gate**

Run: `cd miniapp && npm run check`

Expected: all Node tests PASS, then TypeScript and ESLint PASS with zero warnings.

- [ ] **Step 3: Inspect the final diff for boundary violations**

Run: `git diff --check`

Expected: no output.

Run: `git diff --name-only f553a1e`

Expected: only the design/plan documents and the `miniapp/` files named in this plan; no backend, frontend website, deployment, secret, or unrelated B/C page files other than the single superseded-result guard in `pages/universities/index.ts`.

- [ ] **Step 4: Commit documentation**

```bash
git add miniapp/README.md
git commit -m "docs: document miniapp A2 shared contracts"
```

- [ ] **Step 5: Record manual verification limitations in the PR handoff**

Report the `npm run check` result and state that rapid-search, broken-image, and pull-to-refresh behavior still require WeChat DevTools with an authorized AppID. Do not mark those device checks complete until they are actually run.
