import assert from 'node:assert/strict';
import test from 'node:test';

import {
  universityCampusUrl,
  universityLogoUrl,
} from '../miniprogram/services/university-media.ts';

test('uses only canonical website assets for known universities', () => {
  assert.equal(
    universityLogoUrl('segi-university'),
    'https://yangdoujiao.com/universities/segi-university.jpg',
  );
  assert.equal(
    universityCampusUrl('asia-pacific-university'),
    'https://yangdoujiao.com/universities/campuses/apu-campus.webp',
  );
});

test('does not invent image paths for universities without approved assets', () => {
  assert.equal(universityLogoUrl('unknown-university'), null);
  assert.equal(universityCampusUrl('unknown-university'), null);
});

test('published API school slugs reuse reviewed website logo and campus assets', () => {
  const aliases = {
    um: 'university-of-malaya', ukm: 'universiti-kebangsaan-malaysia',
    utm: 'universiti-teknologi-malaysia', upm: 'universiti-putra-malaysia',
    usm: 'universiti-sains-malaysia', uum: 'universiti-utara-malaysia',
    taylor: 'taylors-university', ucsi: 'ucsi-university', inti: 'inti-international-university',
    sunway: 'sunway-university', apu: 'asia-pacific-university', segi: 'segi-university',
    utar: 'universiti-tunku-abdul-rahman', city: 'city-university-malaysia',
    monash: 'monash-university-malaysia', nottingham: 'university-of-nottingham-malaysia',
    southampton: 'university-of-southampton-malaysia', help: 'help-university',
    mahsa: 'mahsa-university', nilai: 'nilai-university',
  };
  for (const [apiSlug, websiteSlug] of Object.entries(aliases)) {
    assert.ok(universityLogoUrl(websiteSlug));
    assert.equal(universityLogoUrl(apiSlug), universityLogoUrl(websiteSlug), apiSlug);
    assert.equal(universityCampusUrl(apiSlug), universityCampusUrl(websiteSlug), apiSlug);
  }
  assert.equal(universityLogoUrl('constructor'), null);
  assert.equal(universityCampusUrl('__proto__'), null);
});
