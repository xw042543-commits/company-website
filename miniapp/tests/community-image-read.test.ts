import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCommunityImages } from '../miniprogram/services/community-images';

test('batch media reads use a single request and reject injected remote URLs', async () => {
  const id = 'a'.repeat(32); const path = `/api/v1/community/images/${id}`; const calls: unknown[] = [];
  const send = async (options: unknown) => { calls.push(options); return { ok: true as const, value: { '1': [{ id, width: 20, height: 30, url: path, thumbnailUrl: `${path}?thumbnail=true` }] } }; };
  const result = await fetchCommunityImages(['1', '2'], false, send as never);
  assert.equal(calls.length, 1); assert.equal(result['1']?.[0]?.id, id);
  const invalid = await fetchCommunityImages(['1'], false, (async () => ({ ok: true, value: { '1': [{ id, width: 20, height: 30, url: 'https://evil.test/image', thumbnailUrl: `${path}?thumbnail=true` }] } })) as never);
  assert.deepEqual(invalid, {});
});
