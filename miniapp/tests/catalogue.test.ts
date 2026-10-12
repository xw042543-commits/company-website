import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCatalogueService,
  loadFilterOptions,
  parseFilterOptions,
  resetFilterOptionsCache,
} from '../miniprogram/services/catalogue.ts';
import type { RequestOptions, TransportOptions } from '../miniprogram/services/http.ts';
import type { Result } from '../miniprogram/utils/result.ts';

const valid = {
  countries: [{ code: 'MY', nameZh: '马来西亚', nameEn: 'Malaysia' }],
  subjectCategories: [{ code: 'BUSINESS', nameZh: '商业与管理', nameEn: 'Business and Management' }],
  studyLevels: [{ code: 'BACHELOR', nameZh: '本科', nameEn: 'Bachelor' }],
  courseModes: [{ code: 'ON_CAMPUS', nameZh: '线下授课', nameEn: 'On campus' }],
  languages: [{ code: 'EN', nameZh: '英语', nameEn: 'English' }],
};

const invalid = {
  ok: false,
  error: { kind: 'unexpected', code: 'INVALID_FILTER_OPTIONS_RESPONSE' },
};

test('maps all five authoritative filter groups without inventing ALL', async () => {
  const service = createCatalogueService(async () => ({ ok: true, value: valid }));
  const result = await service.load();

  assert.deepEqual(result, { ok: true, value: valid });
  if (result.ok) {
    assert.equal(Object.values(result.value).flat().some((item) => item.code === 'ALL'), false);
  }
});

for (const [name, code] of [['ALL', 'ALL'], ['whitespace-padded ALL', ' ALL ']] as const) {
  test(`rejects reserved ${name} in every group without caching it`, async () => {
    for (const group of ['countries', 'subjectCategories', 'studyLevels', 'courseModes', 'languages']) {
      let calls = 0;
      const service = createCatalogueService(async () => {
        calls += 1;
        return {
          ok: true,
          value: calls === 1
            ? { ...valid, [group]: [{ code, nameZh: '全部', nameEn: 'All' }] }
            : valid,
        };
      });

      assert.deepEqual(await service.load(), invalid);
      assert.deepEqual(await service.load(), { ok: true, value: valid });
      assert.equal(calls, 2);
    }
  });
}

for (const [name, raw] of [
  ['missing group', { ...valid, languages: undefined }],
  ['non-array group', { ...valid, countries: {} }],
  ['blank code', { ...valid, countries: [{ code: ' ', nameZh: '马来西亚', nameEn: 'Malaysia' }] }],
  ['blank labels', { ...valid, countries: [{ code: 'MY', nameZh: ' ', nameEn: '' }] }],
  ['non-string label', { ...valid, countries: [{ code: 'MY', nameZh: 7, nameEn: 'Malaysia' }] }],
  ['non-string English label', { ...valid, countries: [{ code: 'MY', nameZh: '马来西亚', nameEn: null }] }],
  ['non-string code', { ...valid, countries: [{ code: 7, nameZh: '马来西亚', nameEn: 'Malaysia' }] }],
  ['non-object item', { ...valid, countries: [null] }],
  ['duplicate code', { ...valid, countries: [valid.countries[0], valid.countries[0]] }],
  ['duplicate trimmed code', {
    ...valid,
    countries: [valid.countries[0], { code: ' MY ', nameZh: '马来西亚', nameEn: 'Malaysia' }],
  }],
  ['null root', null],
  ['array root', []],
] as const) {
  test(`rejects ${name}`, async () => {
    const service = createCatalogueService(async () => ({ ok: true, value: raw }));
    assert.deepEqual(await service.load(), invalid);
  });
}

test('validates each of the five required groups', () => {
  for (const group of ['countries', 'subjectCategories', 'studyLevels', 'courseModes', 'languages']) {
    assert.deepEqual(parseFilterOptions({ ...valid, [group]: null }), invalid);
  }
});

test('trims fields into new objects and permits a single nonblank label', () => {
  const raw = {
    ...valid,
    countries: [{ code: ' MY ', nameZh: ' 马来西亚 ', nameEn: ' Malaysia ' }],
    languages: [{ code: ' EN ', nameZh: ' ', nameEn: ' English ' }],
  };
  const result = parseFilterOptions(raw);

  assert.deepEqual(result, {
    ok: true,
    value: { ...valid, languages: [{ code: 'EN', nameZh: '', nameEn: 'English' }] },
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.notEqual(result.value, raw);
  for (const group of ['countries', 'subjectCategories', 'studyLevels', 'courseModes', 'languages'] as const) {
    assert.notEqual(result.value[group], raw[group]);
    assert.notEqual(result.value[group][0], raw[group][0]);
  }
  raw.countries[0]!.nameEn = 'changed';
  assert.equal(result.value.countries[0]?.nameEn, 'Malaysia');
});

test('accepts empty authoritative groups without creating fallback options', () => {
  const empty = { countries: [], subjectCategories: [], studyLevels: [], courseModes: [], languages: [] };
  assert.deepEqual(parseFilterOptions(empty), { ok: true, value: empty });
});

test('requests the public catalogue endpoint and reuses successful results until reset', async () => {
  const requests: RequestOptions[] = [];
  const service = createCatalogueService(async (options) => {
    requests.push(options);
    return { ok: true, value: valid };
  });

  const first = await service.load();
  assert.deepEqual(first, { ok: true, value: valid });
  assert.deepEqual(await service.load(), first);
  assert.equal(requests.length, 1);
  service.reset();
  assert.deepEqual(await service.load(), first);
  assert.deepEqual(requests, [
    { method: 'GET', path: '/api/v1/catalog/filter-options' },
    { method: 'GET', path: '/api/v1/catalog/filter-options' },
  ]);
});

test('does not cache failures and retries on the next load', async () => {
  let calls = 0;
  const failure: Result<never> = {
    ok: false, error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' },
  };
  const service = createCatalogueService(async () => {
    calls += 1;
    return calls === 1 ? failure : { ok: true, value: valid };
  });

  assert.deepEqual(await service.load(), failure);
  assert.deepEqual(await service.load(), { ok: true, value: valid });
  assert.equal(calls, 2);
});

test('does not cache malformed successful responses', async () => {
  let calls = 0;
  const service = createCatalogueService(async () => {
    calls += 1;
    return { ok: true, value: calls === 1 ? {} : valid };
  });

  assert.deepEqual(await service.load(), invalid);
  assert.deepEqual(await service.load(), { ok: true, value: valid });
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
  assert.deepEqual(await afterReset, { ok: true, value: valid });
  assert.deepEqual(await service.load(), { ok: true, value: valid });
  assert.equal(calls, 2);
});

test('an old completion leaves a newer pending load shared', async () => {
  const resolvers: Array<(result: Result<unknown>) => void> = [];
  const service = createCatalogueService(() => (
    new Promise<Result<unknown>>((resolve) => resolvers.push(resolve))
  ));
  const first = service.load();
  service.reset();
  const latest = service.load();

  resolvers[0]?.({ ok: true, value: valid });
  await first;
  assert.equal(service.load(), latest);
  assert.equal(resolvers.length, 2);
  resolvers[1]?.({ ok: true, value: valid });
  assert.deepEqual(await latest, { ok: true, value: valid });
});

test('an old completion cannot overwrite the newer cached catalogue', async () => {
  const resolvers: Array<(result: Result<unknown>) => void> = [];
  const service = createCatalogueService(() => (
    new Promise<Result<unknown>>((resolve) => resolvers.push(resolve))
  ));
  const first = service.load();
  service.reset();
  const latest = service.load();
  const newer = { ...valid, countries: [{ code: 'SG', nameZh: '新加坡', nameEn: 'Singapore' }] };

  resolvers[1]?.({ ok: true, value: newer });
  assert.deepEqual(await latest, { ok: true, value: newer });
  resolvers[0]?.({ ok: true, value: valid });
  await first;
  assert.deepEqual(await service.load(), { ok: true, value: newer });
  assert.equal(resolvers.length, 2);
});

test('default exports use the shared request layer and reset their process-memory cache', async () => {
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const requests: TransportOptions[] = [];
  Object.defineProperty(globalThis, 'wx', {
    configurable: true,
    value: {
      getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
      request: (options: TransportOptions) => {
        requests.push(options);
        options.success({ statusCode: 200, data: valid, header: {}, cookies: [] });
        return { abort() {} };
      },
    },
  });
  resetFilterOptionsCache();
  try {
    assert.deepEqual(await loadFilterOptions(), { ok: true, value: valid });
    assert.deepEqual(await loadFilterOptions(), { ok: true, value: valid });
    assert.equal(requests.length, 1);
    resetFilterOptionsCache();
    assert.deepEqual(await loadFilterOptions(), { ok: true, value: valid });
    assert.equal(requests.length, 2);
    for (const options of requests) {
      assert.equal(options.method, 'GET');
      assert.equal(new URL(options.url).pathname, '/api/v1/catalog/filter-options');
      assert.equal('Authorization' in options.header, false);
    }
  } finally {
    resetFilterOptionsCache();
    if (originalWx) Object.defineProperty(globalThis, 'wx', originalWx);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});
