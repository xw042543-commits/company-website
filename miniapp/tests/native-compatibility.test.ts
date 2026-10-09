import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = new URL('../miniprogram/', import.meta.url);
test('native templates do not call JavaScript array methods', () => {
  function inspect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (path.endsWith('.wxml')) {
        const expressions = readFileSync(path, 'utf8').match(/{{[\s\S]*?}}/g) ?? [];
        for (const expression of expressions) assert.doesNotMatch(expression, /\.(?:includes|join|map|filter|some)\s*\(/, path);
      }
    }
  }
  inspect(fileURLToPath(root));
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
