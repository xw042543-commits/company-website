import test from 'node:test';
import assert from 'node:assert/strict';
import { createImageUploader } from '../miniprogram/services/community-images';

function session() {
  let id: number | null = 1; let token = 'first'; let refreshes = 0;
  const listeners: (() => void)[] = [];
  return {
    getSnapshot: () => ({ account: id === null ? null : { id } }), getAccessToken: () => token,
    refresh: async () => { refreshes++; token = 'second'; return { ok: true }; },
    subscribe: (fn: () => void) => { listeners.push(fn); return () => undefined; },
    switchUser: (next: number | null) => { id = next; listeners.forEach((fn) => fn()); },
    refreshCount: () => refreshes,
  };
}
test('restricted upload explains permissions without exposing server messages or refreshing login', async () => {
  const auth = session();
  const uploader = createImageUploader(1, auth, async () => ({ statusCode: 403,
    data: JSON.stringify({ code: 'COMMUNITY_USER_RESTRICTED', message: 'private server text' }) }));
  await assert.rejects(uploader.upload('/image'), /社区权限受限.*管理员/);
  assert.equal(auth.refreshCount(), 0);
  uploader.dispose();
});
test('image upload refreshes bearer once and validates server image identity', async () => {
  const auth = session(); const tokens: string[] = [];
  const uploader = createImageUploader(1, auth, async (_path, token) => {
    tokens.push(token);
    return tokens.length === 1 ? { statusCode: 401, data: '{}' }
      : { statusCode: 201, data: JSON.stringify({ id: 'a'.repeat(32), width: 20, height: 30, status: 'PENDING' }) };
  });
  assert.deepEqual(await uploader.upload('/image'), { id: 'a'.repeat(32), width: 20, height: 30 });
  assert.deepEqual(tokens, ['first', 'second']); assert.equal(auth.refreshCount(), 1);
  uploader.dispose();
});
test('logout invalidates late upload even if same account logs in again', async () => {
  const auth = session(); let done!: (result: { statusCode: number; data: string }) => void;
  const uploader = createImageUploader(1, auth, () => new Promise((resolve) => { done = resolve; }));
  const promise = uploader.upload('/image');
  auth.switchUser(null); auth.switchUser(1);
  done({ statusCode: 201, data: JSON.stringify({ id: 'a'.repeat(32), width: 20, height: 30, status: 'PENDING' }) });
  await assert.rejects(promise, /登录/); uploader.dispose();
});
