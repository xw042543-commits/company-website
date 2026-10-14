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

test('account exposes the unified favorites, personal posts and adviser actions without duplicate legacy menu entries', () => {
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
    wx: { navigateTo: ({ url }: { url: string }) => navigated.push(url), switchTab: ({ url }: { url: string }) => { assert.equal(url, '/pages/favorites-cart/index'); navigated.push(url); }, showToast: () => assert.fail('expected real navigation') },
  });
  const menu = (definition.data as { menuItems: Array<{ key: string }> }).menuItems;
  const openMenu = definition.openMenu as (event: { currentTarget: { dataset: { key: string } } }) => void;
  const app = JSON.parse(readFileSync(new URL('app.json', root), 'utf8')) as { pages: string[] };
  for (const key of ['plans', 'favorites', 'universityFavorites', 'community']) assert.equal(menu.some((item) => item.key === key), false);
  assert.equal(menu.some((item) => item.key === 'consultations'), false);
  for (const [key, page] of [['orders', 'orders'], ['settings', 'settings'], ['about', 'about']] as const) {
    assert.ok(menu.some((item) => item.key === key));
    openMenu({ currentTarget: { dataset: { key } } });
    assert.equal(navigated.at(-1), `/pages/${page}/index`);
    assert.ok(app.pages.includes(`pages/${page}/index`));
  }
  for (const [key, page] of [['favorites', 'favorites-cart'], ['community', 'circle-me'], ['adviser', 'consultation']] as const) {
    openMenu({ currentTarget: { dataset: { key } } });
    assert.equal(navigated.at(-1), `/pages/${page}/index`);
    assert.ok(app.pages.includes(`pages/${page}/index`));
  }
  const template=readFileSync(new URL('pages/account/index.wxml',root),'utf8');
  for(const label of ['我的收藏','我的发布','咨询顾问'])assert.match(template,new RegExp(label));
});

test('about page keeps complete service copy and independent contact actions', () => {
  const template = readFileSync(new URL('pages/about/index.wxml', root), 'utf8');
  const source = readFileSync(new URL('pages/about/index.ts', root), 'utf8');
  for (const copy of ['让留学变得更简单', '留学生境外一站式服务平台', '院校查询', '留学规划', '签证办理', '落地注册', 'U圈交流', '实习就业', '继续深造']) {
    assert.match(template, new RegExp(copy));
  }
  for (const contact of ['15589913695', 'bertram@staff.udajo.com', 'udajo005', 'udajo002', 'udajo006']) assert.match(source, new RegExp(contact.replace('.', '\\.')));
  assert.match(template, /bindtap="callPhone"/);
  assert.equal((template.match(/class="copy-button"/g) ?? []).length, 1, '微信号通过循环为每个账号生成独立复制按钮');
  assert.match(template, /data-value="\{\{item\}\}"[^>]+bindtap="copyContact"/);
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

test('consultation locks duplicate submissions before authentication completes', async () => {
  let definition: Record<string, unknown> = {};
  let authCalls = 0;
  let finishAuth: ((value: { ok: false }) => void) | undefined;
  const source = readFileSync(new URL('pages/consultation/index.ts', root), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, {
    exports: {}, Page: (value: Record<string, unknown>) => { definition = value; },
    require: (path: string) => path.includes('session') ? { sessionStore: {
      getSnapshot: () => ({ status: 'anonymous', account: null }),
      ensureAuthenticated: () => { authCalls++; return new Promise((resolve) => { finishAuth = resolve; }); },
    } } : { consultationGateway: { submit: () => assert.fail('submit should not run after failed login') } },
    wx: { showToast: () => {}, showLoading: () => {}, hideLoading: () => {}, setNavigationBarTitle: () => {} },
  });
  const data = structuredClone(definition.data) as Record<string, unknown>;
  Object.assign(data, { form: { name: '王欣', contact: 'wx-wang', intendedSchool: '世纪大学',
    intendedCourse: '', qualification: '', notes: '', privacyConsent: true } });
  const page = { ...definition, data, setData(update: Record<string, unknown>) { Object.assign(data, update); } };
  const submit = definition.submit as (this: typeof page) => Promise<void>;
  const first = submit.call(page);
  await submit.call(page);
  assert.equal(authCalls, 1);
  assert.equal(data.submitting, true);
  assert.ok(finishAuth);
  finishAuth({ ok: false });
  await first;
  assert.equal(data.submitting, false);
});
