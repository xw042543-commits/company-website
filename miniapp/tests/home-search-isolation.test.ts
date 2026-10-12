import assert from 'node:assert/strict';
import test from 'node:test';
import type { TransportOptions } from '../miniprogram/services/http';

test('home preview and university filters both finish when their requests overlap', async () => {
  interface PageHarness {
    data: { previewState?: string; state?: string; universities?: Array<{ slug: string }> };
    setData(patch: object): void;
    loadUniversityPreview(): Promise<void>;
    loadUniversities(reset: boolean): Promise<void>;
  }
  const pages: PageHarness[] = [];
  const requests: TransportOptions[] = [];
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const originalPage = Object.getOwnPropertyDescriptor(globalThis, 'Page');
  Object.defineProperty(globalThis, 'Page', { configurable: true, value: (page: PageHarness) => {
    page.setData = (patch) => Object.assign(page.data, patch);
    pages.push(page);
  } });
  Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
    getStorageSync: () => [],
    request: (options: TransportOptions) => { requests.push(options); return { abort() {} }; },
  } });
  try {
    await import('../miniprogram/pages/home/index');
    await import('../miniprogram/pages/universities/index');
    const home = pages[0]!;
    const list = pages[1]!;
    const homeLoad = home.loadUniversityPreview();
    const listLoad = list.loadUniversities(true);
    const data = { items: [{ id: 9, slug: 'segi', nameZh: '世纪大学', nameEn: 'SEGi University',
      matchedProgrammeCount: 3, matchedProgrammes: [], countryNameZh: '马来西亚' }],
      page: 1, pageSize: 6, totalItems: 1, totalPages: 1 };
    for (const request of requests) request.success({ statusCode: 200, data, header: {}, cookies: [] });
    await Promise.all([homeLoad, listLoad]);
    assert.equal(home.data.previewState, 'ready');
    assert.equal(home.data.universities?.[0]?.slug, 'segi');
    assert.equal(list.data.state, 'ready');
  } finally {
    for (const [key, descriptor] of [['wx', originalWx], ['Page', originalPage]] as const) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
