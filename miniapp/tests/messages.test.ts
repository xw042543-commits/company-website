import assert from 'node:assert/strict';
import test from 'node:test';
import { createMessagesService } from '../miniprogram/services/messages';
import type { RequestOptions } from '../miniprogram/services/http';
import type { Result } from '../miniprogram/utils/result';

const item = { id: '9007199254740993', category: 'COMMUNITY', title: '新回复', body: '<b>纯文本</b>', createdAt: '2026-10-09T08:00:00Z', readAt: null, targetType: 'COMMUNITY_POST', targetId: '9223372036854775807' };
const page = { items: [item], page: 1, pageSize: 20, totalItems: 1, totalPages: 1, unreadCount: 1 };
const ok = (value: unknown): Result<unknown> => ({ ok: true, value });

test('received inbox requests authenticated category pages and preserves exact IDs/plain text', async () => {
  const calls: RequestOptions[] = [];
  const service = createMessagesService(async (input) => { calls.push(input); return ok(page); });
  const result = await service.list({ category: 'COMMUNITY', page: 1, size: 20 });
  assert.deepEqual(result, ok(page));
  assert.equal(calls[0]?.path, '/api/v1/miniapp/me/messages?category=COMMUNITY&page=1&size=20');
  assert.equal(calls[0]?.authenticated, true);
});

test('inbox parser rejects unsafe IDs, unknown categories/targets, dates and counts', async () => {
  for (const changed of [{ id: 9007199254740992 }, { id: '01' }, { id: '9223372036854775808' }, { category: 'ADMIN' }, { targetId: '1&admin=1' }, { targetType: 'URL' }, { readAt: 'yesterday' }, { createdAt: '2026-02-30T08:00:00Z' }, { targetType: 'NONE', targetId: '1' }]) {
    const service = createMessagesService(async () => ok({ ...page, items: [{ ...item, ...changed }] }));
    assert.equal((await service.list({ category: 'ALL', page: 1, size: 20 })).ok, false);
  }
  for (const unreadCount of [-1, 1.5, '1', Number.MAX_SAFE_INTEGER + 1]) {
    const service = createMessagesService(async () => ok({ ...page, unreadCount }));
    assert.equal((await service.list({ category: 'ALL', page: 1, size: 20 })).ok, false);
    assert.equal((await service.unreadCount()).ok, false);
  }
});

test('validation prevents malformed query/read paths and read requires authentication', async () => {
  const calls: RequestOptions[] = [];
  const service = createMessagesService(async (input) => { calls.push(input); return ok(undefined); });
  assert.equal((await service.list({ category: 'X' as 'ALL', page: 1, size: 20 })).ok, false);
  assert.equal((await service.list({ category: 'ALL', page: 0, size: 20 })).ok, false);
  assert.equal((await service.markRead('1/read?x=1')).ok, false);
  assert.equal(calls.length, 0);
  assert.equal((await service.markRead('9007199254740993')).ok, true);
  assert.deepEqual(calls[0], { method: 'PUT', path: '/api/v1/miniapp/me/messages/9007199254740993/read', authenticated: true });
});

test('auth/network errors are propagated, never converted to empty messages or zero count', async () => {
  for (const error of [{ kind: 'unauthorized' as const, code: 'AUTHENTICATION_REQUIRED' }, { kind: 'unavailable' as const, code: 'SERVICE_UNAVAILABLE' }]) {
    const failure: Result<unknown> = { ok: false, error };
    const service = createMessagesService(async () => failure);
    assert.deepEqual(await service.list({ category: 'ALL', page: 1, size: 20 }), failure);
    assert.deepEqual(await service.unreadCount(), failure);
  }
});
