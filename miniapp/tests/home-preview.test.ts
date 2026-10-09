import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../miniprogram/', import.meta.url);

test('native tabs provide bundled normal and selected icons', () => {
  const app = JSON.parse(readFileSync(new URL('app.json', root), 'utf8'));
  for (const tab of app.tabBar.list) {
    assert.equal(typeof tab.iconPath, 'string');
    assert.equal(typeof tab.selectedIconPath, 'string');
    assert.ok(existsSync(new URL(tab.iconPath, root)));
    assert.ok(existsSync(new URL(tab.selectedIconPath, root)));
  }
});

test('home image failures fall back without losing university navigation or favorite state', async () => {
  type Event = { currentTarget: { dataset: { slug: string; kind: string } } };
  interface HomePage {
    data: { previewState: string; universities: Array<{ coverFailed: boolean; favorite: boolean }> };
    setData(data: object): void;
    loadUniversityPreview(): Promise<void>;
    imageError(event: Event): void;
    toggleFavorite(event: Event): void;
    openUniversity(event: Event): void;
  }
  let page!: HomePage;
  const navigated: string[] = [];
  let saved = false;
  const source = readFileSync(new URL('pages/home/index.ts', root), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, {
    exports: {}, Page: (value: HomePage) => { page = value; },
    require: (name: string) => name.includes('universities') ? {
      searchUniversities: async () => ({ ok: true, value: { items: [{ slug: 'segi-university', nameZh: '世纪大学', imageUrl: null, coverImageUrl: 'https://example.test/campus.jpg' }] } }),
    } : name.includes('favorites') ? { favoriteUniversities: { list: () => saved ? ['segi-university'] : [], toggle: () => { saved = !saved; return saved; } } }
      : name.includes('media') ? { universityLogoUrl: () => null }
        : { universityDetailRoute: (slug: string) => ({ ok: true, value: `/pages/university-detail/index?slug=${slug}` }) },
    wx: { navigateTo: ({ url }: { url: string }) => navigated.push(url), showToast() {} },
  });
  page.setData = (data: unknown) => Object.assign(page.data, data);
  await page.loadUniversityPreview();
  assert.equal(page.data.previewState, 'ready');
  assert.equal(typeof page.imageError, 'function');
  const event = { currentTarget: { dataset: { slug: 'segi-university', kind: 'cover' } } };
  page.imageError(event);
  assert.equal(page.data.universities[0]?.coverFailed, true);
  page.toggleFavorite(event);
  assert.equal(page.data.universities[0]?.favorite, true);
  assert.equal(page.data.universities[0]?.coverFailed, true);
  page.openUniversity(event);
  assert.equal(navigated[0], '/pages/university-detail/index?slug=segi-university');
});
