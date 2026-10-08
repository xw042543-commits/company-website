import assert from 'node:assert/strict';
import test from 'node:test';

import { buildUniversitySearchPath, mapUniversityPage } from '../miniprogram/services/universities.ts';

const fixture = {
  items: [{
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    countryCode: 'MY',
    countryNameZh: '马来西亚',
    countryNameEn: 'Malaysia',
    cityZh: '吉隆坡',
    cityEn: 'Kuala Lumpur',
    popular: true,
    matchedProgrammeCount: 2,
    matchedProgrammes: [
      { categoryCode: 'BUSINESS' },
      { categoryCode: 'COMPUTER_SCIENCE' },
    ],
  }],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
};

test('maps the real university search response without inventing missing images', () => {
  const result = mapUniversityPage(fixture);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value.items[0], {
    id: 12,
    slug: 'segi-university',
    nameZh: '世纪大学',
    nameEn: 'SEGi University',
    location: '吉隆坡，马来西亚',
    programmeCount: 2,
    subjectTags: ['BUSINESS', 'COMPUTER_SCIENCE'],
    imageUrl: null,
  });
});

test('rejects malformed page metadata instead of showing a false empty state', () => {
  const result = mapUniversityPage({ ...fixture, totalPages: 0 });

  assert.deepEqual(result, {
    ok: false,
    error: { kind: 'unexpected', code: 'INVALID_UNIVERSITY_RESPONSE' },
  });
});

test('omits empty and ALL filters while preserving API parameter names', () => {
  const path = buildUniversitySearchPath({
    q: '  ', country: 'ALL', category: 'BUSINESS', level: 'BACHELOR', page: 2, size: 12,
  });

  assert.equal(path, '/api/v1/universities/search?category=BUSINESS&level=BACHELOR&page=2&size=12&sort=relevance');
});
