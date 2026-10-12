import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareDraftImage } from '../miniprogram/utils/community-image-selection';

test('compression checks real dimensions and persists the resulting file', async () => {
  const copies: string[] = []; let compressed = 0;
  const result = await prepareDraftImage(2, '/chosen', {
    info: async () => ({ type: 'jpeg', width: 4000, height: 3000 }),
    compress: async (_path, width) => { assert.ok(width <= 1600); compressed++; return '/compressed'; },
    size: async () => 500000, persist: async (owner, path) => { copies.push(path); return `/draft/${owner}/saved.jpg`; },
  });
  assert.equal(result, '/draft/2/saved.jpg'); assert.equal(compressed, 1); assert.deepEqual(copies, ['/compressed']);
});
test('animated or excessive pixel inputs are rejected before file persistence', async () => {
  for (const info of [{ type: 'gif', width: 100, height: 100 }, { type: 'jpeg', width: 10000, height: 10000 }]) {
    await assert.rejects(prepareDraftImage(1, '/chosen', { info: async () => info, compress: async () => { throw new Error('must not decode'); }, size: async () => 10, persist: async () => { throw new Error('must not save'); } }), /JPEG|像素/);
  }
});
