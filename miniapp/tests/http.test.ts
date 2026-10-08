import assert from 'node:assert/strict';
import test from 'node:test';

import { createHttpClient, type HttpTransport } from '../miniprogram/services/http.ts';
import { resolveRuntimeConfig } from '../miniprogram/config/runtime.ts';

function transportReturning(statusCode: number, data: unknown): HttpTransport {
  return (options) => {
    options.success({ statusCode, data, header: {}, cookies: [] });
    return { abort() {} };
  };
}

test('rejects path traversal before dispatching a request', async () => {
  let dispatched = false;
  const client = createHttpClient(resolveRuntimeConfig('production'), (options) => {
    dispatched = true;
    options.fail({ errMsg: 'must not run' });
    return { abort() {} };
  });

  const result = await client.request({ method: 'GET', path: '/api/../private' });

  assert.deepEqual(result, {
    ok: false,
    error: { kind: 'validation', code: 'INVALID_REQUEST_PATH' },
  });
  assert.equal(dispatched, false);
});

test('returns a successful JSON response', async () => {
  const client = createHttpClient(
    resolveRuntimeConfig('production'),
    transportReturning(200, { items: [] }),
  );

  const result = await client.request<{ items: unknown[] }>({
    method: 'GET',
    path: '/api/v1/universities/search',
  });

  assert.deepEqual(result, { ok: true, value: { items: [] } });
});

for (const [statusCode, kind] of [
  [401, 'unauthorized'],
  [403, 'forbidden'],
  [429, 'rate-limited'],
  [500, 'unavailable'],
] as const) {
  test(`maps HTTP ${statusCode} to ${kind}`, async () => {
    const client = createHttpClient(
      resolveRuntimeConfig('production'),
      transportReturning(statusCode, { code: 'RAW_BACKEND_ERROR', message: 'do not expose' }),
    );

    const result = await client.request({ method: 'GET', path: '/api/v1/example' });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.kind, kind);
      assert.equal('message' in result.error, false);
    }
  });
}

test('maps transport failure to unavailable', async () => {
  const client = createHttpClient(resolveRuntimeConfig('production'), (options) => {
    options.fail({ errMsg: 'request:fail network down' });
    return { abort() {} };
  });

  const result = await client.request({ method: 'GET', path: '/api/v1/example' });

  assert.deepEqual(result, {
    ok: false,
    error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' },
  });
});

test('adds bearer and idempotency headers only when requested', async () => {
  let capturedHeaders: Record<string, string> | undefined;
  const client = createHttpClient(
    resolveRuntimeConfig('production'),
    (options) => {
      capturedHeaders = options.header;
      options.success({ statusCode: 204, data: undefined, header: {}, cookies: [] });
      return { abort() {} };
    },
    () => 'opaque-access-token',
  );

  await client.request({
    method: 'POST',
    path: '/api/v1/miniapp/example',
    authenticated: true,
    idempotencyKey: '2e5bcf59-0b12-4390-86e5-0d9c01b32823',
  });

  assert.deepEqual(capturedHeaders, {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer opaque-access-token',
    'Idempotency-Key': '2e5bcf59-0b12-4390-86e5-0d9c01b32823',
  });
});
