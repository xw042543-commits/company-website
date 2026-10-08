import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createHttpClient,
  request,
  setAccessTokenReader,
  setUnauthorizedHandler,
  type HttpTransport,
} from '../miniprogram/services/http.ts';
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

test('shares refresh through the handler and retries an authenticated request only once', async () => {
  let requests = 0;
  let token = 'expired';
  let refreshes = 0;
  let aborts = 0;
  const client = createHttpClient(
    resolveRuntimeConfig('production'),
    (options) => {
      requests += 1;
      if (options.header.Authorization === 'Bearer expired') {
        options.success({ statusCode: 401, data: {}, header: {}, cookies: [] });
      } else {
        options.success({ statusCode: 200, data: { ok: true }, header: {}, cookies: [] });
      }
      return { abort() { aborts += 1; } };
    },
    () => token,
    async () => { refreshes += 1; token = 'fresh'; return true; },
  );

  const result = await client.request<{ ok: boolean }>({
    method: 'GET',
    path: '/api/v1/miniapp/account',
    authenticated: true,
    requestKey: 'account',
  });

  assert.deepEqual(result, { ok: true, value: { ok: true } });
  assert.equal(refreshes, 1);
  assert.equal(requests, 2);
  assert.equal(aborts, 0);
});

test('a newer request with the same key aborts and supersedes the previous owner', async () => {
  const pending: Array<{
    options: Parameters<HttpTransport>[0];
    aborted: boolean;
  }> = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (options) => {
    const entry = { options, aborted: false };
    pending.push(entry);
    return { abort() { entry.aborted = true; } };
  });

  const first = client.request({ method: 'GET', path: '/api/v1/first', requestKey: 'search' });
  const second = client.request<{ id: number }>({
    method: 'GET', path: '/api/v1/second', requestKey: 'search',
  });

  assert.equal(pending[0]?.aborted, true);
  assert.deepEqual(await first, {
    ok: false,
    error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' },
  });
  pending[1]?.options.success({ statusCode: 200, data: { id: 2 }, header: {}, cookies: [] });
  assert.deepEqual(await second, { ok: true, value: { id: 2 } });
});

test('different request keys remain independent', () => {
  const aborted: boolean[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), () => {
    const index = aborted.push(false) - 1;
    return { abort() { aborted[index] = true; } };
  });

  void client.request({ method: 'GET', path: '/api/v1/a', requestKey: 'a' });
  void client.request({ method: 'GET', path: '/api/v1/b', requestKey: 'b' });

  assert.deepEqual(aborted, [false, false]);
});

test('application requests share keyed ownership and use the latest authentication delegates', async () => {
  const originalWx = Object.getOwnPropertyDescriptor(globalThis, 'wx');
  const pending: Array<{ options: Parameters<HttpTransport>[0]; aborted: boolean }> = [];
  let signalRetry: (() => void) | undefined;
  const retryDispatched = new Promise<void>((resolve) => { signalRetry = resolve; });
  Object.defineProperty(globalThis, 'wx', {
    configurable: true,
    value: {
      getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
      request: (options: Parameters<HttpTransport>[0]) => {
        const entry = { options, aborted: false };
        pending.push(entry);
        if (pending.length === 4) signalRetry?.();
        return { abort() { entry.aborted = true; } };
      },
    },
  });

  try {
    const first = request({ method: 'GET', path: '/api/v1/first', requestKey: 'search' });
    const second = request<{ id: number }>({
      method: 'GET', path: '/api/v1/second', requestKey: 'search',
    });

    assert.equal(pending[0]?.aborted, true);
    assert.deepEqual(await first, {
      ok: false,
      error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' },
    });
    pending[1]?.options.success({ statusCode: 200, data: { id: 2 }, header: {}, cookies: [] });
    assert.deepEqual(await second, { ok: true, value: { id: 2 } });

    let refreshes = 0;
    setAccessTokenReader(() => 'expired');
    setUnauthorizedHandler(async () => {
      refreshes += 1;
      setAccessTokenReader(() => 'fresh');
      return true;
    });
    const authenticated = request<{ id: number }>({
      method: 'GET', path: '/api/v1/miniapp/account', authenticated: true, requestKey: 'account',
    });
    assert.equal(pending[2]?.options.header.Authorization, 'Bearer expired');
    pending[2]?.options.success({ statusCode: 401, data: {}, header: {}, cookies: [] });
    await retryDispatched;
    assert.equal(pending[3]?.options.header.Authorization, 'Bearer fresh');
    pending[3]?.options.success({ statusCode: 200, data: { id: 7 }, header: {}, cookies: [] });
    assert.deepEqual(await authenticated, { ok: true, value: { id: 7 } });
    assert.equal(refreshes, 1);
    assert.deepEqual(pending.map(({ aborted }) => aborted), [true, false, false, false]);
  } finally {
    setAccessTokenReader(() => null);
    setUnauthorizedHandler(async () => false);
    if (originalWx) Object.defineProperty(globalThis, 'wx', originalWx);
    else Reflect.deleteProperty(globalThis, 'wx');
  }
});

for (const token of [null, 'expired'] as const) {
  test(`settles a rejecting unauthorized handler with ${token === null ? 'a missing token' : 'HTTP 401'} and releases its key`, async () => {
    let currentToken: string | null = token;
    let aborts = 0;
    const client = createHttpClient(
      resolveRuntimeConfig('production'),
      (options) => {
        options.success({
          statusCode: currentToken === 'fresh' ? 200 : 401,
          data: { id: 7 }, header: {}, cookies: [],
        });
        return { abort() { aborts += 1; } };
      },
      () => currentToken,
      async () => { throw new Error('private refresh storage failure'); },
    );
    const options = {
      method: 'GET', path: '/api/v1/miniapp/account', authenticated: true, requestKey: 'account',
    } as const;

    const result = await Promise.race([
      client.request(options),
      new Promise<'PENDING'>((resolve) => { setImmediate(() => resolve('PENDING')); }),
    ]);

    assert.deepEqual(result, {
      ok: false, error: { kind: 'unexpected', code: 'REQUEST_FAILED' },
    });
    currentToken = 'fresh';
    assert.deepEqual(await client.request(options), { ok: true, value: { id: 7 } });
    assert.equal(aborts, 0);
  });
}

for (const provider of ['transport', 'token reader'] as const) {
  test(`settles a throwing ${provider} with a sanitized error and releases its key`, async () => {
    let shouldThrow = true;
    let aborts = 0;
    const client = createHttpClient(
      resolveRuntimeConfig('production'),
      (options) => {
        if (shouldThrow && provider === 'transport') throw new Error('private transport failure');
        options.success({ statusCode: 200, data: { id: 7 }, header: {}, cookies: [] });
        return { abort() { aborts += 1; } };
      },
      () => {
        if (shouldThrow && provider === 'token reader') throw new Error('private token failure');
        return 'fresh';
      },
    );
    const options = {
      method: 'GET', path: '/api/v1/miniapp/account', authenticated: true, requestKey: 'account',
    } as const;

    const result = await Promise.race([
      client.request(options),
      new Promise<'PENDING'>((resolve) => { setImmediate(() => resolve('PENDING')); }),
    ]);

    assert.deepEqual(result, {
      ok: false, error: { kind: 'unexpected', code: 'REQUEST_FAILED' },
    });
    shouldThrow = false;
    assert.deepEqual(await client.request(options), { ok: true, value: { id: 7 } });
    assert.equal(aborts, 0);
  });
}
