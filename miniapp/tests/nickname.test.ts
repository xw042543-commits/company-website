import assert from 'node:assert/strict';
import test from 'node:test';
import { createNicknameService } from '../miniprogram/services/nickname';
import type { RequestOptions } from '../miniprogram/services/http';

test('nickname saves a trimmed value to the authenticated endpoint', async () => {
  const calls: RequestOptions[] = [];
  const service = createNicknameService(async <T>(options: RequestOptions) => {
    calls.push(options);
    return { ok: true as const, value: { id: 1, displayName: '小王', avatarUrl: null, bindingStatus: 'LINKED' } as T };
  });
  const result = await service(' 小王 ');
  assert.equal(result.ok && result.value.displayName, '小王');
  assert.equal(calls[0]?.authenticated, true);
  assert.equal(calls[0]?.path, '/api/v1/miniapp/account/nickname');
  assert.equal(calls[0]?.method, 'PUT');
  assert.deepEqual(calls[0]?.data, { displayName: '小王' });
});

test('invalid nicknames do not make a request and server failures remain failures', async () => {
  let calls = 0;
  const service = createNicknameService(async () => { calls++; return { ok: false, error: { kind: 'unavailable', code: 'OFFLINE' } }; });
  for (const value of ['', '   ', 'a\nb', '名'.repeat(33)]) {
    const result = await service(value);
    assert.equal(result.ok, false);
  }
  assert.equal(calls, 0);
  const result = await service('小王');
  assert.equal(result.ok, false);
  assert.equal(calls, 1);
});
