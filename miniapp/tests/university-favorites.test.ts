import assert from 'node:assert/strict';
import test from 'node:test';
import { loadFavoriteUniversityDetails } from '../miniprogram/services/university-favorites.ts';

const detail = (slug: string) => ({
  id: slug === 'segi-university' ? 1 : 2,
  slug,
  nameZh: slug === 'segi-university' ? '世纪大学' : '亚太科技大学',
  nameEn: slug === 'segi-university' ? 'SEGi University' : 'Asia Pacific University',
  countryCode: 'MY', countryNameZh: '马来西亚', cityZh: '吉隆坡',
  descriptionZh: '院校简介', popular: true,
  imageUrl: `https://yangdoujiao.com/universities/${slug}-campus.jpg`,
  logoUrl: `https://yangdoujiao.com/universities/${slug}.png`,
});

test('favorite university loader preserves saved order and reports unavailable records', async () => {
  const calls: string[] = [];
  const result = await loadFavoriteUniversityDetails(
    ['segi-university', 'missing-school', 'asia-pacific-university'],
    async (slug) => {
      calls.push(slug);
      return slug === 'missing-school'
        ? { ok: false as const, error: { kind: 'unavailable' as const, code: 'NOT_FOUND' } }
        : { ok: true as const, value: detail(slug) };
    },
  );
  assert.deepEqual(calls, ['segi-university', 'missing-school', 'asia-pacific-university']);
  assert.deepEqual(result.items.map((item) => item.slug), ['segi-university', 'asia-pacific-university']);
  assert.equal(result.unavailableCount, 1);
});

test('favorite university loader skips duplicate and invalid stored slugs', async () => {
  const calls: string[] = [];
  const result = await loadFavoriteUniversityDetails(
    ['segi-university', 'segi-university', '../unsafe'],
    async (slug) => { calls.push(slug); return { ok: true as const, value: detail(slug) }; },
  );
  assert.deepEqual(calls, ['segi-university']);
  assert.equal(result.items.length, 1);
  assert.equal(result.unavailableCount, 0);
});