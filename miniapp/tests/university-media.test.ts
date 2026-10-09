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
