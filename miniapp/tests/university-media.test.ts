import assert from 'node:assert/strict';
import test from 'node:test';

import {
  universityCampusUrl,
  universityLogoUrl,
} from '../miniprogram/services/university-media.ts';

test('resolves production API slugs without changing route identifiers', () => {
  assert.equal(universityLogoUrl('segi'), universityLogoUrl('segi-university'));
  assert.equal(universityCampusUrl('apu'), universityCampusUrl('asia-pacific-university'));
  assert.equal(universityLogoUrl('southampton'), universityLogoUrl('university-of-southampton-malaysia'));
});

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

test('uses the supplied campus photos for their matching published schools', () => {
  const expected = {
    segi: 'segi-campus.webp', southampton: 'southampton-campus.webp',
    sunway: 'sunway-campus.webp', ucsi: 'ucsi-campus.webp', utar: 'utar-campus.webp',
    nilai: 'nilai-campus.webp', help: 'help-campus.webp', inti: 'inti-campus.webp',
    monash: 'monash-campus.webp', nottingham: 'nottingham-campus.webp',
  };
  for (const [slug, filename] of Object.entries(expected)) {
    assert.equal(universityCampusUrl(slug), `https://yangdoujiao.com/universities/campuses/${filename}`);
  }
});
