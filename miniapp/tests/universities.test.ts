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

test('maps the real university search response without inventing missing images', () => {
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
    coverImageUrl: null,
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

test('maps university detail without inventing optional content', () => {
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
    imageUrl: null,
    logoUrl: 'https://yangdoujiao.com/universities/segi-university.jpg',
  } });
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
