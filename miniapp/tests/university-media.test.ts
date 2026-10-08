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
