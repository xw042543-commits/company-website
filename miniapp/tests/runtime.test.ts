import assert from 'node:assert/strict';
import test from 'node:test';

import { currentRuntimeConfig, resolveRuntimeConfig } from '../miniprogram/config/runtime.ts';

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
