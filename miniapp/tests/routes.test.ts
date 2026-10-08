import assert from 'node:assert/strict';
import test from 'node:test';

import {
  programmeDetailRoute,
  universityDetailRoute,
} from '../miniprogram/utils/routes.ts';

test('builds encoded university and programme detail routes', () => {
  assert.deepEqual(universityDetailRoute('segi-university'), {
    ok: true,
    value: '/pages/university-detail/index?slug=segi-university',
  });
  assert.deepEqual(programmeDetailRoute('segi-university', 584), {
    ok: true,
    value: '/pages/programme-detail/index?universitySlug=segi-university&programmeId=584',
  });
  assert.deepEqual(universityDetailRoute('  segi-university  '), {
    ok: true,
    value: '/pages/university-detail/index?slug=segi-university',
  });
  assert.deepEqual(programmeDetailRoute('  segi-university  ', '  584  '), {
    ok: true,
    value: '/pages/programme-detail/index?universitySlug=segi-university&programmeId=584',
  });
});

test('rejects blank and malformed university slugs with the route validation result', () => {
  for (const result of [
    universityDetailRoute(' '),
    universityDetailRoute('../admin'),
    universityDetailRoute('Segi-University'),
    universityDetailRoute('segi--university'),
  ]) {
    assert.deepEqual(result, {
      ok: false,
      error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' },
    });
  }
});

test('rejects malformed programme slugs and non-positive or non-integer IDs', () => {
  for (const result of [
    programmeDetailRoute('../admin', 584),
    programmeDetailRoute('segi-university', 0),
    programmeDetailRoute('segi-university', -1),
    programmeDetailRoute('segi-university', '5x'),
    programmeDetailRoute('segi-university', '1.5'),
    programmeDetailRoute('segi-university', '  '),
  ]) {
    assert.deepEqual(result, {
      ok: false,
      error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' },
    });
  }
});

test('rejects unsafe numeric IDs but preserves exact large decimal string IDs', () => {
  assert.deepEqual(programmeDetailRoute('segi-university', Number.MAX_SAFE_INTEGER + 1), {
    ok: false,
    error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' },
  });
  assert.deepEqual(programmeDetailRoute('segi-university', '9007199254740993'), {
    ok: true,
    value: '/pages/programme-detail/index?universitySlug=segi-university&programmeId=9007199254740993',
  });
});
