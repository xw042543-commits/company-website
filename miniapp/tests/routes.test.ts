import assert from 'node:assert/strict';
import test from 'node:test';

import {
  programmeDetailRoute,
  universityDetailRoute,
  communityPostRoute, communityComposeRoute, communityMeRoute, communityFeedRoute, applicationOrderRoute,
  consultationRoute,
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

test('community routes use canonical decimal strings and circle page paths', () => {
  assert.deepEqual(communityPostRoute('9007199254740993'), { ok: true, value: '/pages/circle-detail/index?id=9007199254740993' });
  assert.deepEqual(communityComposeRoute(), { ok: true, value: '/pages/circle-compose/index' });
  assert.deepEqual(communityMeRoute(), { ok: true, value: '/pages/circle-me/index' });
  assert.deepEqual(communityFeedRoute(), { ok: true, value: '/pages/circle/index' });
  for (const bad of ['01', '0', '+1', ' 1', '1 ', '1&admin=1', '1/like', '9223372036854775808', 1])
    assert.deepEqual(communityPostRoute(bad as string), { ok: false, error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' } });
});

test('builds validated application order detail routes', () => {
  const reference = 'c4d29e18-b266-4f6a-8e24-7cc312388174';
  assert.deepEqual(applicationOrderRoute(reference), {
    ok: true,
    value: `/pages/order-detail/index?referenceCode=${reference}`,
  });
  for (const bad of ['', '../admin', 'APP202409001', `${reference}?admin=1`]) {
    assert.equal(applicationOrderRoute(bad).ok, false);
  }
});

test('builds a consultation route with encoded university and programme context', () => {
  assert.deepEqual(consultationRoute({
    school: '世纪大学 & Colleges', course: '工商管理 / Business', qualification: 'bachelor',
  }), {
    ok: true,
    value: '/pages/consultation/index?school=%E4%B8%96%E7%BA%AA%E5%A4%A7%E5%AD%A6%20%26%20Colleges&course=%E5%B7%A5%E5%95%86%E7%AE%A1%E7%90%86%20%2F%20Business&qualification=bachelor',
  });
  assert.deepEqual(consultationRoute({ school: '  世纪大学  ' }), {
    ok: true, value: '/pages/consultation/index?school=%E4%B8%96%E7%BA%AA%E5%A4%A7%E5%AD%A6',
  });
});

test('consultation routes reject oversized or unsupported context', () => {
  for (const context of [
    { school: 'x'.repeat(201) },
    { course: 'x'.repeat(201) },
    { qualification: 'diploma' },
  ]) assert.equal(consultationRoute(context).ok, false);
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
