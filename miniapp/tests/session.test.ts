import assert from 'node:assert/strict';
import test from 'node:test';

import { createSessionStore, REFRESH_TOKEN_STORAGE_KEY } from '../miniprogram/stores/session.ts';
import type { AuthGateway, SessionPayload } from '../miniprogram/services/auth.ts';

const account = { id: 7, displayName: '微信用户', avatarUrl: null, bindingStatus: 'LINKED' as const };

function payload(suffix: string): SessionPayload {
  return {
    accessToken: `access-${suffix}`,
    accessExpiresAt: '2026-10-08T03:00:00Z',
    refreshToken: `refresh-${suffix}`,
    refreshExpiresAt: '2026-11-08T03:00:00Z',
    account,
  };
}

function storage(initial?: string) {
  const values = new Map<string, string>();
  if (initial) values.set(REFRESH_TOKEN_STORAGE_KEY, initial);
  return {
    get: (key: string) => values.get(key) ?? null,
    set: (key: string, value: string) => values.set(key, value),
    remove: (key: string) => values.delete(key),
    values,
  };
}

test('login exchanges a wx code, keeps access in memory and persists only refresh', async () => {
  const saved = storage();
  let loginCalls = 0;
  const auth: AuthGateway = {
    async login() { loginCalls += 1; return { ok: true, value: payload('one') }; },
    async refresh() { throw new Error('not used'); },
    async logout() {},
  };
  const store = createSessionStore(auth, saved);

  const result = await store.login();

  assert.equal(result.ok, true);
  assert.equal(loginCalls, 1);
  assert.equal(store.getAccessToken(), 'access-one');
  assert.equal(saved.values.get(REFRESH_TOKEN_STORAGE_KEY), 'refresh-one');
  assert.equal([...saved.values.values()].includes('access-one'), false);
});

test('concurrent refresh calls share one request', async () => {
  const saved = storage('refresh-old');
  let calls = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const auth: AuthGateway = {
    async login() { throw new Error('not used'); },
    async refresh(token) {
      calls += 1;
      assert.equal(token, 'refresh-old');
      await gate;
      return { ok: true, value: payload('new') };
    },
    async logout() {},
  };
  const store = createSessionStore(auth, saved);

  const first = store.refresh();
  const second = store.refresh();
  release?.();
  const [a, b] = await Promise.all([first, second]);

  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.equal(store.getAccessToken(), 'access-new');
  assert.equal(saved.values.get(REFRESH_TOKEN_STORAGE_KEY), 'refresh-new');
});

test('failed refresh clears all session state', async () => {
  const saved = storage('refresh-old');
  const auth: AuthGateway = {
    async login() { throw new Error('not used'); },
    async refresh() { return { ok: false, error: { kind: 'unauthorized', code: 'EXPIRED' } }; },
    async logout() {},
  };
  const store = createSessionStore(auth, saved);

  await store.refresh();

  assert.equal(store.getSnapshot().status, 'anonymous');
  assert.equal(store.getAccessToken(), null);
  assert.equal(saved.values.has(REFRESH_TOKEN_STORAGE_KEY), false);
});

test('logout clears memory and storage even when network fails', async () => {
  const saved = storage();
  const auth: AuthGateway = {
    async login() { return { ok: true, value: payload('active') }; },
    async refresh() { throw new Error('not used'); },
    async logout() { throw new Error('offline'); },
  };
  const store = createSessionStore(auth, saved);
  await store.login();

  await store.logout();

  assert.equal(store.getSnapshot().status, 'anonymous');
  assert.equal(store.getAccessToken(), null);
  assert.equal(saved.values.has(REFRESH_TOKEN_STORAGE_KEY), false);
});

test('an uploaded avatar replaces the authenticated account without touching credentials', async () => {
  const saved = storage();
  const auth: AuthGateway = {
    async login() { return { ok: true, value: payload('active') }; },
    async refresh() { throw new Error('not used'); },
    async logout() {},
  };
  const store = createSessionStore(auth, saved);
  await store.login();

  store.updateAccount({ ...account, avatarUrl: 'https://yangdoujiao.com/api/v1/miniapp/avatars/7?v=1' });

  assert.equal(store.getSnapshot().account?.avatarUrl,
    'https://yangdoujiao.com/api/v1/miniapp/avatars/7?v=1');
  assert.equal(store.getAccessToken(), 'access-active');
  assert.equal(saved.values.get(REFRESH_TOKEN_STORAGE_KEY), 'refresh-active');
});
