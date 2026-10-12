import assert from 'node:assert/strict';
import test from 'node:test';

import { createFavoriteStore, parseFavoriteSlugs } from '../miniprogram/stores/favorites.ts';

test('favorite parser keeps unique safe university slugs', () => {
  assert.deepEqual(parseFavoriteSlugs([
    'segi-university', 'segi-university', '../admin', 42, 'asia-pacific-university',
  ]), ['segi-university', 'asia-pacific-university']);
});

test('favorite state persists and toggles through its storage adapter', () => {
  let stored: unknown = [];
  const store = createFavoriteStore({
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
  });

  assert.equal(store.toggle('segi-university'), true);
  assert.equal(store.has('segi-university'), true);
  assert.deepEqual(stored, ['segi-university']);
  assert.equal(store.toggle('segi-university'), false);
  assert.deepEqual(stored, []);
});
