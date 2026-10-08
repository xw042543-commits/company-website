import assert from 'node:assert/strict'; import test from 'node:test';
import { createExpiringCache } from '../miniprogram/utils/expiring-cache.ts';

test('reuses values only within the configured freshness window', () => {
  let now = 1000; const cache = createExpiringCache<string>(200, () => now);
  cache.set('programme', 'cached'); assert.equal(cache.get('programme'), 'cached');
  now = 1200; assert.equal(cache.get('programme'), null);
});

test('clears all cached API reads without retaining account data', () => {
  const cache = createExpiringCache<number>(200); cache.set('one', 1); cache.clear();
  assert.equal(cache.get('one'), null);
});
