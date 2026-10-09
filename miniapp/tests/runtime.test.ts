import assert from 'node:assert/strict';
import test from 'node:test';

import { currentRuntimeConfig, resolveRuntimeConfig } from '../miniprogram/config/runtime.ts';

test('native runtime resolves origins without the browser URL global', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'URL')!;
  Object.defineProperty(globalThis, 'URL', { configurable: true, value: undefined });
  try {
    assert.equal(resolveRuntimeConfig('production').apiOrigin, 'https://yangdoujiao.com');
    assert.equal(resolveRuntimeConfig('preview', 'https://yangdoujiao.com:443/').apiOrigin, 'https://yangdoujiao.com');
    assert.equal(resolveRuntimeConfig('local').apiOrigin, 'http://127.0.0.1:8080');
    assert.equal(resolveRuntimeConfig('local', 'http://localhost:8080/').apiOrigin, 'http://localhost:8080');
    for (const origin of ['https://yangdoujiao.com.evil.test', 'https://user@yangdoujiao.com', 'https://yangdoujiao.com/path', 'https://yangdoujiao.com?x=1', 'https://yangdoujiao.com#x', 'https://yangdoujiao.com:8080', 'https://yangdoujiao.com\\\\evil.test', 'http://localhost:9000']) {
      assert.throws(() => resolveRuntimeConfig('local', origin), /Unsafe API origin/, origin);
    }
  } finally {
    Object.defineProperty(globalThis, 'URL', original);
  }
});

test('production runtime uses the canonical HTTPS API origin', () => {
  const config = resolveRuntimeConfig('production');

  assert.equal(config.apiOrigin, 'https://yangdoujiao.com');
  assert.equal(config.requestTimeoutMs, 8000);
});

test('production runtime rejects a non-HTTPS override', () => {
  assert.throws(
    () => resolveRuntimeConfig('production', 'http://yangdoujiao.com'),
    /Unsafe API origin/,
  );
});

test('production runtime rejects a different host', () => {
  assert.throws(
    () => resolveRuntimeConfig('production', 'https://example.com'),
    /Unsafe API origin/,
  );
});

test('development builds use the shared API by default', () => {
  (globalThis as typeof globalThis & { wx: unknown }).wx = {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'develop' } }),
  };

  const config = currentRuntimeConfig();
  assert.equal(config.environment, 'local');
  assert.equal(config.apiOrigin, 'https://yangdoujiao.com');
});
