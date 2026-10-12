import test from 'node:test';
import assert from 'node:assert/strict';
import { readCommunityImages } from './community-image-data.ts';

test('adviser images accept only canonical same-origin paths', () => {
  const id = 'a'.repeat(32); const image = { id, width: 800, height: 600, url: `/api/v1/community/images/${id}`, thumbnailUrl: `/api/v1/community/images/${id}?thumbnail=true` };
  assert.deepEqual(readCommunityImages({ '12': [image] }, '12'), [image]);
  assert.throws(() => readCommunityImages({ '12': [{ ...image, url: 'https://untrusted.test' }] }, '12'));
  assert.throws(() => readCommunityImages({ '12': Array(10).fill(image) }, '12'));
  assert.deepEqual(readCommunityImages({}, '12'), []);
});
