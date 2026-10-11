import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildUniversitySearchPath,
  createUniversitySearchService,
  mapUniversityDetail,
  mapUniversityPage,
  mapUniversityProgrammePage,
  getUniversityProgrammes,
} from '../miniprogram/services/universities.ts';
import type { RequestOptions, TransportOptions } from '../miniprogram/services/http.ts';
import type { Result } from '../miniprogram/utils/result.ts';
import { resetFilterOptionsCache } from '../miniprogram/services/catalogue.ts';

test('native university queries encode filters without URLSearchParams', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'URLSearchParams')!;
  Object.defineProperty(globalThis, 'URLSearchParams', { configurable: true, value: undefined });
  try {
    const path = buildUniversitySearchPath({ q: ' 商科 & A+B ', country: 'ALL', category: 'BUSINESS', level: 'BACHELOR' });
    const query = new URL(`https://example.test${path}`).searchParams;
    assert.equal(query.get('q'), '商科 & A+B');
    assert.equal(query.get('category'), 'BUSINESS');
    assert.equal(query.get('level'), 'BACHELOR');
    assert.equal(query.get('page'), '1');
    assert.equal(query.get('size'), '12');
    assert.equal(query.has('country'), false);
  } finally {
    Object.defineProperty(globalThis, 'URLSearchParams', original);
  }
});

const fixture = {
  items: [{
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    countryCode: 'MY',
    countryNameZh: '马来西亚',
    countryNameEn: 'Malaysia',
    cityZh: '吉隆坡',
    cityEn: 'Kuala Lumpur',
    popular: true,
    matchedProgrammeCount: 2,
    matchedProgrammes: [
      { categoryCode: 'BUSINESS' },
      { categoryCode: 'COMPUTER_SCIENCE' },
    ],
  }],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
};

test('programme requests respect the backend page-size ceiling', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  let requestedUrl = '';
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
    request: (options: TransportOptions) => {
      requestedUrl = options.url;
      options.success({ statusCode: 200, data: { items: [], page: 1, pageSize: 48, totalItems: 0, totalPages: 0 }, header: {}, cookies: [] });
      return { abort() {} };
    },
  } });
  try {
    assert.equal((await getUniversityProgrammes('segi')).ok, true);
    assert.equal(new URL(requestedUrl).searchParams.get('size'), '48');
  } finally {
    if (original) Object.defineProperty(globalThis, 'wx', original);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('published Chinese-only programmes remain accessible without fabricated English names', () => {
  const result = mapUniversityProgrammePage({ items: [{ id: 584, slug: 'segi-bachelor-001',
    nameZh: '商务管理（荣誉）学士学位', nameEn: null }], page: 1, pageSize: 48, totalItems: 1, totalPages: 1 });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.items[0]?.id, 584);
    assert.equal(result.value.items[0]?.nameEn, '');
  }
  assert.equal(mapUniversityProgrammePage({ items: [{ id: 584, slug: 'segi-bachelor-001', nameZh: null, nameEn: null }],
    page: 1, pageSize: 48, totalItems: 1, totalPages: 1 }).ok, false);
});

test('late university responses cannot replace the newest search generation', async () => {
  const resolvers: Array<(value: Result<unknown>) => void> = [];
  const options: RequestOptions[] = [];
  const service = createUniversitySearchService((requestOptions) => {
    options.push(requestOptions);
    return new Promise<Result<unknown>>((resolve) => resolvers.push(resolve));
  });

  const first = service.search({ q: 'old' });
  const second = service.search({ q: 'new' });
  assert.deepEqual(options, [
    { method: 'GET', path: '/api/v1/universities/search?q=old&page=1&size=12&sort=relevance', requestKey: 'university-search' },
    { method: 'GET', path: '/api/v1/universities/search?q=new&page=1&size=12&sort=relevance', requestKey: 'university-search' },
  ]);
  resolvers[1]?.({ ok: true, value: fixture });
  const latest = await second;
  assert.equal(latest.ok, true);
  if (latest.ok) assert.equal(latest.value.items[0]?.location, '吉隆坡，马来西亚');
  resolvers[0]?.({ ok: true, value: fixture });
  assert.deepEqual(await first, {
    ok: false,
    error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' },
  });
});

test('the university page silently ignores superseded searches while the newest search loads', async () => {
  interface PageHarness {
    data: Record<string, unknown>;
    loadUniversities(reset: boolean): Promise<void>;
    setData(patch: Record<string, unknown>): void;
  }
  const originalPage = Object.getOwnPropertyDescriptor(globalThis, 'Page');
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const requests: TransportOptions[] = [];
  const updates: Record<string, unknown>[] = [];
  let capturedPage: PageHarness | undefined;
  Object.defineProperty(globalThis, 'Page', {
    configurable: true,
    value: (page: PageHarness) => {
      capturedPage = page;
      page.setData = (patch) => {
        updates.push(patch);
        Object.assign(page.data, patch);
      };
    },
  });
  Object.defineProperty(globalThis, 'wx', {
    configurable: true,
    value: {
      getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
      request: (options: TransportOptions) => {
        requests.push(options);
        return { abort() {} };
      },
    },
  });
  try {
    await import('../miniprogram/pages/universities/index.ts');
    assert.ok(capturedPage);
    const page = capturedPage;
    page.data.query = 'old';
    const first = page.loadUniversities(true);
    page.data.query = 'new';
    const second = page.loadUniversities(true);
    await first;
    assert.equal(page.data.state, 'loading');
    assert.equal(updates.length, 2);

    requests[1]?.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await second;
    assert.equal(page.data.state, 'ready');
    assert.equal(page.data.totalItems, 1);
    assert.equal(updates.length, 3);
    const latestState = structuredClone(page.data);
    requests[0]?.success({ statusCode: 200, data: { ...fixture, items: [] }, header: {}, cookies: [] });
    await Promise.resolve();
    assert.deepEqual(page.data, latestState);
    assert.equal(updates.length, 3);
  } finally {
    if (originalPage) Object.defineProperty(globalThis, 'Page', originalPage);
    else Reflect.deleteProperty(globalThis, 'Page');
    if (originalWx) Object.defineProperty(globalThis, 'wx', originalWx);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

test('maps the real university search response with reviewed logo and campus assets', () => {
  const result = mapUniversityPage(fixture);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value.items[0], {
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    location: '吉隆坡，马来西亚',
    programmeCount: 2,
    subjectTags: ['BUSINESS', 'COMPUTER_SCIENCE'],
    imageUrl: 'https://yangdoujiao.com/universities/segi-university.jpg',
    coverImageUrl: 'https://yangdoujiao.com/universities/campuses/segi-campus.webp',
    imageMode: 'aspectFit',
    popular: true,
  });
});

test('rejects malformed page metadata instead of showing a false empty state', () => {
  const result = mapUniversityPage({ ...fixture, totalPages: 0 });

  assert.deepEqual(result, {
    ok: false,
    error: { kind: 'unexpected', code: 'INVALID_UNIVERSITY_RESPONSE' },
  });
});

test('omits empty and ALL filters while preserving API parameter names', () => {
  const path = buildUniversitySearchPath({
    q: '  ', country: 'ALL', category: 'BUSINESS', level: 'BACHELOR', page: 2, size: 12,
  });

  assert.equal(path, '/api/v1/universities/search?category=BUSINESS&level=BACHELOR&page=2&size=12&sort=relevance');
});

test('combines keyword, country, qualification and subject using the existing API names', () => {
  const path = buildUniversitySearchPath({ q: '  SEGi business  ', country: 'MY', level: 'BACHELOR', category: 'BUSINESS' });
  const query = new URL(path, 'https://example.test').searchParams;
  assert.deepEqual(Object.fromEntries(query), {
    q: 'SEGi business', country: 'MY', category: 'BUSINESS', level: 'BACHELOR',
    page: '1', size: '12', sort: 'relevance',
  });
  assert.equal(buildUniversitySearchPath({ country: 'ALL', level: 'ALL', category: 'ALL' }),
    '/api/v1/universities/search?page=1&size=12&sort=relevance');
});

interface DirectoryHarness {
  data: Record<string, unknown>;
  onLoad(options: Record<string, string | undefined>): void;
  onShow(): void;
  openUniversity(event: { detail: { slug: string } }): void;
  toggleFavorite(event: { detail: { slug: string } }): void;
  retry(): void;
  loadUniversities(reset: boolean): Promise<void>;
  setData(patch: Record<string, unknown>, callback?: () => void): void;
  openFilter(event: { currentTarget: { dataset: { key: string } } }): void;
  selectFilter(event: { currentTarget: { dataset: { code: string } } }): void;
  closeFilters(): void;
  clearFilters(): void;
  submitSearch(): void;
  onReachBottom(): void;
  loadFilters(): Promise<void>;
}

let directoryImport = 0;
async function withDirectory(run: (page: DirectoryHarness, requests: TransportOptions[]) => Promise<void>) {
  const originalPage = Object.getOwnPropertyDescriptor(globalThis, 'Page');
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const requests: TransportOptions[] = [];
  let page: DirectoryHarness | undefined;
  resetFilterOptionsCache();
  Object.defineProperty(globalThis, 'Page', { configurable: true, value(definition: DirectoryHarness) {
    page = definition;
    definition.setData = (patch, callback) => { Object.assign(definition.data, patch); callback?.(); };
  } });
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
    request(options: TransportOptions) { requests.push(options); return { abort() {} }; },
  } });
  try {
    await import(new URL(`../miniprogram/pages/universities/index.ts?directory=${++directoryImport}`, import.meta.url).href);
    assert.ok(page);
    await run(page, requests);
  } finally {
    if (originalPage) Object.defineProperty(globalThis, 'Page', originalPage);
    else Reflect.deleteProperty(globalThis, 'Page');
    if (originalWx) Object.defineProperty(globalThis, 'wx', originalWx);
    else Reflect.deleteProperty(globalThis, 'wx');
    resetFilterOptionsCache();
  }
}

test('inline filters open one menu and current or invalid selections close without a search', async () => {
  await withDirectory(async (page, requests) => {
    assert.equal(typeof page.openFilter, 'function', 'directory must expose its inline filter action');
    page.openFilter({ currentTarget: { dataset: { key: 'country' } } });
    assert.equal(page.data.openFilterKey, 'country');
    page.openFilter({ currentTarget: { dataset: { key: 'level' } } });
    assert.equal(page.data.openFilterKey, 'level');
    page.selectFilter({ currentTarget: { dataset: { code: 'ALL' } } });
    assert.equal(page.data.openFilterKey, '');
    page.openFilter({ currentTarget: { dataset: { key: 'category' } } });
    page.selectFilter({ currentTarget: { dataset: { code: 'INVALID' } } });
    assert.equal(page.data.category, 'ALL');
    assert.equal(page.data.openFilterKey, '');
    page.openFilter({ currentTarget: { dataset: { key: 'country' } } });
    page.closeFilters();
    assert.equal(page.data.openFilterKey, '');
    assert.equal(requests.length, 0);
  });
});

test('a literal percent in the directory route keyword loads without a decode exception', async () => {
  await withDirectory(async (page, requests) => {
    assert.doesNotThrow(() => page.onLoad({ q: '100%' }));
    assert.equal(page.data.query, '100%');
    assert.equal(new URL(requests[1]!.url).searchParams.get('q'), '100%');
    requests[0]!.success({ statusCode: 503, data: {}, header: {}, cookies: [] });
    requests[1]!.success({ statusCode: 200, data: { items: [], page: 1, pageSize: 12, totalItems: 0, totalPages: 0 }, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(page.data.state, 'empty');
  });
});

test('directory pagination deduplicates schools and returning from a detail synchronizes favourites without reloading browsing state', async () => {
  await withDirectory(async (page, requests) => {
    const wxDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'wx')!;
    let saved: unknown = [];
    const navigations: string[] = [];
    Object.defineProperty(globalThis, 'wx', { configurable: true, value: { ...wxDescriptor.value,
      getStorageSync: () => saved, setStorageSync: (_key: string, value: unknown) => { saved = value; },
      showToast() {}, navigateTo({ url }: { url: string }) { navigations.push(url); },
    } });
    Object.assign(page.data, { query: 'science', country: 'MY', level: 'BACHELOR', category: 'COMPUTING' });
    const first = page.loadUniversities(true);
    const items = Array.from({ length: 12 }, (_, index) => ({ ...fixture.items[0], id: index + 1, slug: `school-${index + 1}` }));
    requests[0]!.success({ statusCode: 200, data: { items, page: 1, pageSize: 12, totalItems: 24, totalPages: 2 }, header: {}, cookies: [] });
    await first;
    page.onReachBottom();
    page.onReachBottom();
    assert.equal(requests.length, 2, 'load-more must issue only one request while already pending');
    const next = Array.from({ length: 12 }, (_, index) => ({ ...fixture.items[0], id: index + 12, slug: `school-${index + 12}` }));
    requests[1]!.success({ statusCode: 200, data: { items: next, page: 2, pageSize: 12, totalItems: 24, totalPages: 2 }, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    const universities = page.data.universities as Array<{ slug: string; favorite: boolean }>;
    assert.equal(universities.length, 23);
    assert.equal(new Set(universities.map((school) => school.slug)).size, 23);
    page.openUniversity({ detail: { slug: 'school-12' } });
    page.openUniversity({ detail: { slug: '../invalid' } });
    assert.deepEqual(navigations, ['/pages/university-detail/index?slug=school-12']);
    page.toggleFavorite({ detail: { slug: 'school-12' } });
    assert.deepEqual(saved, ['school-12']);
    saved = ['school-23'];
    page.onShow();
    assert.equal((page.data.universities as typeof universities).find((school) => school.slug === 'school-12')?.favorite, false);
    assert.equal((page.data.universities as typeof universities).find((school) => school.slug === 'school-23')?.favorite, true);
    assert.deepEqual([page.data.query, page.data.country, page.data.level, page.data.category, page.data.page], ['science', 'MY', 'BACHELOR', 'COMPUTING', 2]);
    page.onReachBottom();
    assert.equal(requests.length, 2, 'onShow and end-of-results must preserve results without refetching');
  });
});

test('directory retries offline and malformed API reads and supports resetting an empty result', async () => {
  await withDirectory(async (page, requests) => {
    const initial = page.loadUniversities(true);
    requests[0]!.fail({ errMsg: 'offline' });
    await initial;
    assert.equal(page.data.state, 'offline');
    page.retry();
    requests[1]!.success({ statusCode: 200, data: {}, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(page.data.state, 'failed');
    page.retry();
    requests[2]!.success({ statusCode: 200, data: { items: [], page: 1, pageSize: 12, totalItems: 0, totalPages: 0 }, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(page.data.state, 'empty');
    page.data.query = 'unmatched';
    page.clearFilters();
    requests[3]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(page.data.state, 'ready');
    assert.equal(page.data.query, '');
  });
});

test('a changed inline selection reloads page one with all active filters and reset clears them', async () => {
  await withDirectory(async (page, requests) => {
    assert.equal(typeof page.openFilter, 'function');
    Object.assign(page.data, { query: '  SEGi  ', country: 'MY', level: 'BACHELOR', page: 3, totalPages: 5,
      categoryOptions: [{ code: 'ALL', nameZh: '全部专业', nameEn: 'All' }, { code: 'BUSINESS', nameZh: '商科', nameEn: 'Business' }] });
    page.openFilter({ currentTarget: { dataset: { key: 'category' } } });
    page.selectFilter({ currentTarget: { dataset: { code: 'BUSINESS' } } });
    assert.equal(page.data.openFilterKey, '');
    assert.equal(page.data.page, 1);
    assert.equal(page.data.totalPages, 0);
    assert.equal(page.data.categoryIndex, 1);
    assert.equal(requests.length, 1);
    const query = new URL(requests[0]!.url).searchParams;
    assert.deepEqual(Object.fromEntries(query), { q: 'SEGi', country: 'MY', category: 'BUSINESS', level: 'BACHELOR', page: '1', size: '12', sort: 'relevance' });
    requests[0]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
    page.openFilter({ currentTarget: { dataset: { key: 'country' } } });
    page.clearFilters();
    assert.deepEqual([page.data.query, page.data.country, page.data.level, page.data.category, page.data.openFilterKey], ['', 'ALL', 'ALL', 'ALL', '']);
    assert.equal(new URL(requests[1]!.url).searchParams.has('country'), false);
    requests[1]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
  });
});

test('catalogue failure leaves neutral inline filters usable', async () => {
  await withDirectory(async (page, requests) => {
    const loading = page.loadFilters();
    requests[0]!.success({ statusCode: 503, data: {}, header: {}, cookies: [] });
    await loading;
    assert.equal(page.data.filtersLoading, false);
    assert.equal(typeof page.openFilter, 'function');
    for (const key of ['country', 'level', 'category']) {
      page.openFilter({ currentTarget: { dataset: { key } } });
      assert.equal(page.data.openFilterKey, key);
      assert.equal((page.data.openFilterOptions as Array<{ code: string }>)[0]?.code, 'ALL');
      page.selectFilter({ currentTarget: { dataset: { code: 'ALL' } } });
      assert.equal(page.data.openFilterKey, '');
    }
    assert.equal(requests.length, 1);
  });
});

test('open filters block result pagination and a loading search cannot be submitted twice', async () => {
  await withDirectory(async (page, requests) => {
    assert.equal(typeof page.openFilter, 'function');
    Object.assign(page.data, { state: 'ready', page: 1, totalPages: 2 });
    page.openFilter({ currentTarget: { dataset: { key: 'country' } } });
    page.onReachBottom();
    assert.equal(requests.length, 0);
    page.closeFilters();
    page.data.query = '  SEGi  ';
    page.submitSearch();
    page.submitSearch();
    assert.equal(page.data.query, 'SEGi');
    assert.equal(requests.length, 1);
    requests[0]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
  });
});

test('search marks itself loading before the native render callback so rapid taps issue one request', async () => {
  await withDirectory(async (page, requests) => {
    const callbacks: Array<() => void> = [];
    page.setData = (patch, callback) => { Object.assign(page.data, patch); if (callback) callbacks.push(callback); };
    Object.assign(page.data, { state: 'ready', query: '  SEGi  ' });
    page.submitSearch();
    page.submitSearch();
    assert.equal(page.data.state, 'loading');
    assert.equal(callbacks.length, 1);
    callbacks[0]!();
    assert.equal(requests.length, 1);
    requests[0]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
    await new Promise((resolve) => setImmediate(resolve));
  });
});

for (const initialState of ['ready', 'loading']) {
  for (const deferredRender of [false, true]) {
    test(`repeated reset from ${initialState} issues one page-one request with ${deferredRender ? 'delayed' : 'immediate'} render callbacks`, async () => {
      await withDirectory(async (page, requests) => {
        const callbacks: Array<() => void> = [];
        if (deferredRender) {
          page.setData = (patch, callback) => { Object.assign(page.data, patch); if (callback) callbacks.push(callback); };
        }
        Object.assign(page.data, { state: initialState, query: 'SEGi', country: 'MY', level: 'BACHELOR', category: 'BUSINESS',
          countryIndex: 1, levelIndex: 1, categoryIndex: 1, page: 3, totalPages: 5, openFilterKey: 'country' });
        page.clearFilters();
        page.clearFilters();
        assert.deepEqual([page.data.query, page.data.country, page.data.level, page.data.category, page.data.openFilterKey], ['', 'ALL', 'ALL', 'ALL', '']);
        assert.deepEqual([page.data.countryIndex, page.data.levelIndex, page.data.categoryIndex], [0, 0, 0]);
        if (deferredRender) {
          assert.equal(callbacks.length, 1, 'reset must schedule only one load before rendering finishes');
          callbacks.shift()!();
        }
        assert.equal(requests.length, 1, 'the first reset must work while loading and repeated resets must be ignored');
        assert.equal(page.data.state, 'loading');
        assert.equal(page.data.page, 1);
        assert.deepEqual(Object.fromEntries(new URL(requests[0]!.url).searchParams), { page: '1', size: '12', sort: 'relevance' });
        requests[0]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
        await new Promise((resolve) => setImmediate(resolve));
        assert.equal(page.data.state, 'ready');
        page.clearFilters();
        if (deferredRender) callbacks.shift()!();
        assert.equal(requests.length, 2, 'reset is available again after the load completes');
        requests[1]!.success({ statusCode: 200, data: fixture, header: {}, cookies: [] });
        await new Promise((resolve) => setImmediate(resolve));
      });
    });
  }
}

test('maps university detail with reviewed media without inventing optional content', () => {
  assert.deepEqual(mapUniversityDetail({
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    countryCode: 'MY',
    countryNameZh: '马来西亚',
    cityZh: '哥打白沙罗',
    descriptionZh: '院校简介',
    popular: true,
  }), { ok: true, value: {
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    countryCode: 'MY',
    countryNameZh: '马来西亚',
    cityZh: '哥打白沙罗',
    descriptionZh: '院校简介',
    popular: true,
    imageUrl: 'https://yangdoujiao.com/universities/campuses/segi-campus.webp',
    logoUrl: 'https://yangdoujiao.com/universities/segi-university.jpg',
  } });
});

test('published university programme rows accept absent English names but reject malformed supplied names', () => {
  const item = { id: 2272, slug: 'apu-bachelor-pdf-026', nameZh: '互动媒体与沉浸式技术荣誉学士学位' };
  for (const nameEn of [null, undefined, '', '  ']) {
    const result = mapUniversityProgrammePage({ items: [{ ...item, nameEn }], page: 1, pageSize: 48, totalItems: 1, totalPages: 1 });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.items[0]?.nameEn, '');
  }
  for (const nameEn of [1, [], {}]) {
    assert.equal(mapUniversityProgrammePage({ items: [{ ...item, nameEn }], page: 1, pageSize: 48, totalItems: 1, totalPages: 1 }).ok, false);
  }
});

test('maps the published programme list used by university details', () => {
  const result = mapUniversityProgrammePage({
    items: [{
      id: 584,
      slug: 'business-management',
      nameZh: '工商管理',
      nameEn: 'Business Management',
      categoryCode: 'BUSINESS',
      studyLevelCode: 'BACHELOR',
      durationDisplay: '3 年',
      tuitionDisplay: 'RM 89,200',
      intakeDisplayTexts: ['9 月'],
    }],
    page: 1,
    pageSize: 50,
    totalItems: 1,
    totalPages: 1,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.items[0]?.nameZh, '工商管理');
});
