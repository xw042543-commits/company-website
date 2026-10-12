import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUniversitySearchPath } from '../miniprogram/services/universities.ts';
import type { Result } from '../miniprogram/utils/result.ts';
import type { UniversityPage, UniversitySearchInput } from '../miniprogram/services/universities.ts';

Object.assign(globalThis, { Page: () => {}, wx: { stopPullDownRefresh() {}, navigateTo() {} } });
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const empty: UniversityPage = { items: [], page: 1, pageSize: 12, totalItems: 0, totalPages: 0 };
const school = { id: 1, slug: 'segi', nameZh: '世纪大学', nameEn: 'SEGi', location: '马来西亚', programmeCount: 2,
  subjectTags: [], imageUrl: null, coverImageUrl: null, imageMode: 'aspectFit' as const, popular: false };
// Only native rendering is replaced: event handlers and asynchronous state transitions are real.
function mount<T extends { data: object }>(definition: T): T & { setData(patch: object): void } {
  return Object.assign({}, definition, { data: structuredClone(definition.data), setData(patch: object) { Object.assign(this.data, patch); } });
}
const event = (field: string, value: string) => ({ currentTarget: { dataset: { field } }, detail: { value } });

test('opening a planning school carries applied criteria and leaves the result page intact', async () => {
  const { createPlanningDiscoveryPage } = await import('../miniprogram/pages/planning-discovery/index.ts');
  const page = mount(createPlanningDiscoveryPage());
  Object.assign(page.data.applied, { q: '计算机 & AI', level: 'BACHELOR', category: 'COMPUTING', country: 'MY', tuitionMin: '0' });
  page.data.keyword = '未提交的关键词';
  const before = structuredClone(page.data);
  let destination = '';
  const previous = wx.navigateTo;
  wx.navigateTo = (({ url }: { url: string }) => { destination = url; }) as typeof wx.navigateTo;
  try { page.openUniversity({ currentTarget: { dataset: { slug: 'apu' } } }); }
  finally { wx.navigateTo = previous; }
  const url = new URL(destination, 'https://example.test');
  assert.equal(url.pathname, '/pages/university-detail/index');
  assert.equal(url.searchParams.get('planning'), '1');
  assert.equal(url.searchParams.get('q'), '计算机 & AI');
  assert.equal(url.searchParams.get('level'), 'BACHELOR');
  assert.equal(url.searchParams.get('category'), 'COMPUTING');
  assert.equal(url.searchParams.get('tuitionMin'), '0');
  assert.deepEqual(page.data, before);
});

test('course expansion carries the same applied filters, never an unfiltered cached programme list', async () => {
  const { createPlanningDiscoveryService } = await import('../miniprogram/services/planning-discovery.ts');
  let requested = '';
  const service = createPlanningDiscoveryService(async (options) => { requested = options.path; return ok({ ...empty, items: [] }); });
  assert.equal((await service.programmes('segi', { q: '设计', level: 'MASTER', tuitionMax: '90000' }, 2)).ok, true);
  const url = new URL(`https://example.test${requested}`);
  assert.equal(url.pathname, '/api/v1/universities/segi/programmes');
  assert.equal(url.searchParams.get('level'), 'MASTER');
  assert.equal(url.searchParams.get('q'), '设计');
  assert.equal(url.searchParams.get('tuitionMax'), '90000');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal((await service.programmes('../private', {}, 1)).ok, false);
});

test('filters apply together; invalid budget and cancelled draft never change result criteria', async () => {
  const { createPlanningDiscoveryPage } = await import('../miniprogram/pages/planning-discovery/index.ts');
  const calls: UniversitySearchInput[] = [];
  const page = mount(createPlanningDiscoveryPage({ search: async (input) => { calls.push(input); return ok(empty); } }));
  page.openFilters();
  page.updateDraft(event('tuitionMin', '200'));
  page.updateDraft(event('tuitionMax', '100'));
  await page.applyFilters();
  assert.equal(calls.length, 0);
  assert.match(page.data.validation, /学费/);
  page.closeFilters();
  page.openFilters();
  assert.equal(page.data.draft.tuitionMin, '');
  page.updateDraft(event('level', 'MASTER'));
  page.updateDraft(event('tuitionMax', '90000'));
  await page.applyFilters();
  assert.equal(calls[0]?.level, 'MASTER');
  assert.equal(calls[0]?.tuitionMax, '90000');
  assert.equal(page.data.state, 'empty');
  await page.removeFilter({ currentTarget: { dataset: { field: 'level' } } });
  assert.equal(calls[1]?.level, '');
  assert.equal(calls[1]?.tuitionMax, '90000');
});

test('late search responses cannot overwrite a newer filter generation', async () => {
  const { createPlanningDiscoveryPage } = await import('../miniprogram/pages/planning-discovery/index.ts');
  const pending: Array<(result: Result<UniversityPage>) => void> = [];
  const page = mount(createPlanningDiscoveryPage({ search: () => new Promise(resolve => pending.push(resolve)) }));
  const first = page.loadResults(true);
  const second = page.loadResults(true);
  pending[1]!(ok(empty)); await second;
  pending[0]!(ok({ ...empty, items: [school], totalItems: 1, totalPages: 1 })); await first;
  assert.equal(page.data.state, 'empty');
  assert.deepEqual(page.data.schools, []);
});

test('opening more filters preserves an unsubmitted keyword', async () => {
  const { createPlanningDiscoveryPage } = await import('../miniprogram/pages/planning-discovery/index.ts');
  const calls: UniversitySearchInput[] = [];
  const page = mount(createPlanningDiscoveryPage({ search: async input => { calls.push(input); return ok(empty); } }));
  page.updateKeyword({ detail: { value: '计算机' } });
  page.openFilters();
  page.updateDraft(event('level', 'MASTER'));
  await page.applyFilters();
  assert.equal(calls[0]?.q, '计算机');
  assert.equal(page.data.keyword, '计算机');
});

test('pagination failure retains visible schools and retries the failed page', async () => {
  const { createPlanningDiscoveryPage } = await import('../miniprogram/pages/planning-discovery/index.ts');
  const pages: Array<number | undefined> = [];
  const page = mount(createPlanningDiscoveryPage({ search: async (input) => {
    pages.push(input.page);
    return input.page === 1 ? ok({ ...empty, items: [school], totalItems: 13, totalPages: 2 })
      : { ok: false, error: { kind: 'unavailable', code: 'NETWORK_ERROR' } };
  } }));
  await page.loadResults(true); await page.loadResults(false); await page.loadResults(false);
  assert.equal(page.data.schools.length, 1);
  assert.equal(page.data.state, 'ready');
  assert.equal(page.data.moreFailed, true);
  assert.deepEqual(pages, [1, 2, 2]);
});

test('planning forwards every website filter with encoded keywords and zero tuition', () => {
  const path = buildUniversitySearchPath({ q: '设计 & AI', level: 'BACHELOR', category: 'DESIGN', country: 'MY',
    mode: 'FULL_TIME', language: 'EN', duration: '36', intake: '2027-09', tuitionMin: '0', tuitionMax: '200000' });
  const query = new URL(`https://example.test${path}`).searchParams;
  assert.equal(query.get('q'), '设计 & AI');
  assert.equal(query.get('mode'), 'FULL_TIME');
  assert.equal(query.get('language'), 'EN');
  assert.equal(query.get('duration'), '36');
  assert.equal(query.get('intake'), '2027-09');
  assert.equal(query.get('tuitionMin'), '0');
  assert.equal(query.get('tuitionMax'), '200000');
});
