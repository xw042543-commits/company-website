import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = 'miniprogram';
const files = readdirSync(root, { recursive: true }).map(String)
  .filter((file) => statSync(join(root, file)).isFile());

test('startup uses the required-components injection contract', () => {
  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  assert.equal(app.lazyCodeLoading, 'requiredComponents');
});

test('bundled media stay within the 200 KiB performance budget', () => {
  const oversized = files.filter((file) => /\.(png|jpe?g|gif|webp|mp3|mp4|wav)$/i.test(file)
    && statSync(join(root, file)).size > 200 * 1024);
  assert.deepEqual(oversized, []);
});

test('page and component declarations do not inject unused custom components', () => {
  for (const file of files.filter((name) => name.endsWith('.json') && /^(pages|components)\//.test(name))) {
    const config = JSON.parse(readFileSync(join(root, file), 'utf8'));
    const template = readFileSync(join(root, file.replace(/\.json$/, '.wxml')), 'utf8');
    for (const tag of Object.keys(config.usingComponents ?? {})) {
      assert.match(template, new RegExp(`<${tag}(?:\\s|/?>)`), `${file}: unused ${tag}`);
    }
  }
});

test('upload config enables script template and stylesheet minification', () => {
  const config = JSON.parse(readFileSync('project.config.json', 'utf8'));
  for (const key of ['minified', 'minifyWXML', 'minifyWXSS']) {
    assert.equal(config.setting[key], true, key);
  }
});

test('excluded legacy component is not declared by any packaged page', () => {
  for (const file of files.filter((name) => name.endsWith('.json'))) {
    const config = JSON.parse(readFileSync(join(root, file), 'utf8'));
    for (const component of Object.values(config.usingComponents ?? {})) {
      assert.equal(String(component).includes('university-card'), false, file);
    }
  }
});
