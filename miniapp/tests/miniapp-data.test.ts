import assert from 'node:assert/strict'; import test from 'node:test';
import { mapProgrammeDetail } from '../miniprogram/services/miniapp-data.ts';

test('maps programme detail sections in API sort order', () => {
  const result = mapProgrammeDetail({ id: 9, programmeCode: 'CS01', slug: 'computer-science', nameZh: '计算机科学',
    nameEn: 'Computer Science', universitySlug: 'apu', universityNameZh: '亚太科技大学', languageCodes: ['EN'],
    intakeDisplayTexts: ['9 月'], sections: [
      { type: 'CAREER_OUTLOOK', titleZh: '职业方向', bodyZh: '软件工程师', sortOrder: 5 },
      { type: 'INTRODUCTION', titleZh: '介绍', bodyZh: '课程介绍', sortOrder: 1 },
    ] });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value.sections.map((item) => item.type), ['INTRODUCTION', 'CAREER_OUTLOOK']);
});

test('rejects malformed programme detail instead of presenting incomplete business data', () => {
  assert.deepEqual(mapProgrammeDetail({ id: 0, sections: [] }), {
    ok: false, error: { kind: 'unexpected', code: 'INVALID_PROGRAMME_DETAIL_RESPONSE' },
  });
});
