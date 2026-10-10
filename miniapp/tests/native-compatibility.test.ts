import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = new URL('../miniprogram/', import.meta.url);
test('component styles avoid native-unsupported type and attribute selectors', () => {
  for (const component of ['app-state', 'community-post-card']) {
    const css = readFileSync(new URL(`components/${component}/index.wxss`, root), 'utf8');
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((match) => (match[1] ?? '').trim());
    for (const selector of selectors) {
      if (selector.startsWith('@') || selector === 'to' || selector === 'from') continue;
      assert.doesNotMatch(selector, /\[|(^|[\s,>+~])(?:view|text|button|image)(?=[\s.:#,{]|$)/, `${component}: ${selector}`);
    }
  }
});

test('native templates do not call JavaScript array methods', () => {
  function inspect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (path.endsWith('.wxml')) {
        const template = readFileSync(path, 'utf8');
        assert.doesNotMatch(template, /<\/?(?:div|span|strong|small|p|h[1-6]|section|article|i|b)(?:\s|>)/, path);
        const expressions = template.match(/{{[\s\S]*?}}/g) ?? [];
        for (const expression of expressions) assert.doesNotMatch(expression, /\.(?:includes|join|map|filter|some)\s*\(/, path);
      }
    }
  }
  inspect(fileURLToPath(root));
});

test('account exposes registered C data pages and personal community navigation together', () => {
  let definition: Record<string, unknown> = {};
  const navigated: string[] = [];
  const source = readFileSync(new URL('pages/account/index.ts', root), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, {
    exports: {}, Page: (value: Record<string, unknown>) => { definition = value; },
    require: () => ({
      sessionStore: { getSnapshot: () => ({ status: 'anonymous' }) },
      communityMeRoute: () => ({ ok: true, value: '/pages/circle-me/index' }),
    }),
    wx: { navigateTo: ({ url }: { url: string }) => navigated.push(url), showToast: () => assert.fail('expected real navigation') },
  });
  const menu = (definition.data as { menuItems: Array<{ key: string }> }).menuItems;
  const openMenu = definition.openMenu as (event: { currentTarget: { dataset: { key: string } } }) => void;
  const app = JSON.parse(readFileSync(new URL('app.json', root), 'utf8')) as { pages: string[] };
  for (const [key, page] of [['plans', 'plans'], ['favorites', 'favorites'], ['consultations', 'consultations'], ['community', 'circle-me'], ['settings', 'settings'], ['about', 'about']] as const) {
    assert.ok(menu.some((item) => item.key === key));
    openMenu({ currentTarget: { dataset: { key } } });
    assert.equal(navigated.at(-1), `/pages/${page}/index`);
    assert.ok(app.pages.includes(`pages/${page}/index`));
  }
});

test('planning locks duplicate saves before authentication and blocks edits while loading', async () => {
  let definition: Record<string, unknown> = {};
  let authCalls = 0;
  let finishAuth: ((value: { ok: false }) => void) | undefined;
  const source = readFileSync(new URL('pages/planning/index.ts', root), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, {
    exports: {},
    Page: (value: Record<string, unknown>) => { definition = value; },
    require: () => ({ sessionStore: { ensureAuthenticated: () => {
      authCalls++;
      return new Promise((resolve) => { finishAuth = resolve; });
    } } }),
    wx: { showToast: () => {} },
  });
  const data = structuredClone(definition.data) as Record<string, unknown>;
  data.form = { goal: 'Bachelor', country: 'Malaysia', education: 'School', subjects: [], intake: '', grade: '', language: '', budget: '' };
  const context = { ...definition, data, setData(update: Record<string, unknown>) { Object.assign(data, update); } };
  const submit = definition.submit as (this: typeof context) => Promise<void>;
  const first = submit.call(context);
  await submit.call(context);
  assert.equal(authCalls, 1);
  assert.equal(data.saving, true);
  assert.ok(finishAuth);
  finishAuth({ ok: false });
  await first;
  assert.equal(data.saving, false);
  data.loading = true;
  const patch = definition.patch as (this: typeof context, field: string, value: string) => void;
  patch.call(context, 'country', 'Changed');
  assert.equal((data.form as Record<string, unknown>).country, 'Malaysia');
  await submit.call(context);
  assert.equal(authCalls, 1);
});
