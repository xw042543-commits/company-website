import assert from 'node:assert/strict'; import test from 'node:test';
import { mapApplicationOrder, mapApplicationOrderDetail, mapProgrammeDetail } from '../miniprogram/services/miniapp-data.ts';

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

test('accepts missing English programme names without inventing a translation', () => {
  for (const nameEn of [null, undefined, '']) {
    const result = mapProgrammeDetail({ id: 584, slug: 'segi-bachelor-001',
      nameZh: '商务管理（荣誉）学士学位', nameEn, universitySlug: 'segi',
      universityNameZh: '世纪大学', sections: [] });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.nameZh, '商务管理（荣誉）学士学位');
      assert.equal(result.value.nameEn, '');
    }
  }
  assert.equal(mapProgrammeDetail({ id: 584, slug: 'segi-bachelor-001', nameZh: '商科',
    nameEn: 123, universitySlug: 'segi', universityNameZh: '世纪大学', sections: [] }).ok, false);
});

test('rejects malformed programme detail instead of presenting incomplete business data', () => {
  assert.deepEqual(mapProgrammeDetail({ id: 0, sections: [] }), {
    ok: false, error: { kind: 'unexpected', code: 'INVALID_PROGRAMME_DETAIL_RESPONSE' },
  });
});

const programmePayload = {
  id: 9, slug: 'computer-science', nameZh: '计算机科学', nameEn: 'Computer Science',
  universitySlug: 'asia-pacific-university', universityNameZh: '亚太科技大学',
};

test('published programme detail accepts absent English names but rejects malformed supplied names', () => {
  for (const nameEn of [null, undefined, '', '  ']) {
    const result = mapProgrammeDetail({ ...programmePayload, nameEn, sections: [] });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.nameEn, '');
  }
  for (const nameEn of [1, [], {}]) {
    assert.equal(mapProgrammeDetail({ ...programmePayload, nameEn, sections: [] }).ok, false);
  }
});

test('programme identity resolves known logos and falls back for unknown universities', () => {
  for (const [universitySlug, expected] of [
    ['asia-pacific-university', 'https://yangdoujiao.com/universities/asia-pacific-university.png'],
    ['unknown-university', null],
  ]) {
    const result = mapProgrammeDetail({ ...programmePayload, universitySlug, sections: [] });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.universityLogoUrl, expected);
  }
});

test('programme section validation rejects malformed order, type and supplied bilingual content', () => {
  for (const section of [null, [], { type: '', sortOrder: 0 }, { type: 'OTHER', sortOrder: -1 },
    { type: 'OTHER', sortOrder: 1.5 }, { type: 'OTHER', sortOrder: '1' },
    ...['titleZh', 'titleEn', 'bodyZh', 'bodyEn'].map((field) => ({ type: 'OTHER', sortOrder: 0, [field]: { text: 'invalid' } })),
  ]) {
    assert.deepEqual(mapProgrammeDetail({ ...programmePayload, sections: [section] }), {
      ok: false, error: { kind: 'unexpected', code: 'INVALID_PROGRAMME_DETAIL_RESPONSE' },
    });
  }
});

test('programme mapping retains equal-order API sections and bilingual fallback content', () => {
  const result = mapProgrammeDetail({ ...programmePayload, sections: [
    { type: 'OTHER', sortOrder: 4, titleEn: ' Details ', bodyEn: ' English content ' },
    { type: 'CAREER_OUTLOOK', sortOrder: 4, titleZh: '职业', bodyZh: '就业方向' },
    { type: 'INTRODUCTION', sortOrder: 0, titleZh: null, bodyZh: null },
  ] });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value.sections.map((section) => section.type), ['INTRODUCTION', 'OTHER', 'CAREER_OUTLOOK']);
    assert.equal(result.value.sections[1]?.bodyEn, 'English content');
    assert.equal(result.value.sections[0]?.bodyZh, '');
  }
});

test('maps application order summaries and details from authenticated API data', () => {
  const order = { referenceCode: 'c4d29e18-b266-4f6a-8e24-7cc312388174', universityName: '世纪大学',
    programmeName: '工商管理学士学位', qualification: '本科', status: 'IN_PROGRESS', statusLabel: '进行中',
    submittedAt: '2026-10-09T09:30:00+08:00' };
  assert.deepEqual(mapApplicationOrder(order), { ...order, submittedDate: '2026-10-09' });
  const result = mapApplicationOrderDetail({ order, activeStage: 2,
    stages: [{ number: 1, title: '材料准备', description: '整理资料', state: 'COMPLETED' }],
    materials: [{ name: '申请人学历', description: '本科', state: 'RECORDED' }],
    payment: { paymentRequired: false, message: '当前阶段无需支付' },
    history: [{ title: '申请已创建', occurredAt: '2026-10-09T09:30:00+08:00' }], currentMessage: '材料初审中' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.order.universityName, '世纪大学');
    assert.equal(result.value.history[0]?.occurredDate, '2026-10-09');
  }
});

test('rejects malformed application order payloads', () => {
  assert.equal(mapApplicationOrder({ referenceCode: '../admin', status: 'IN_PROGRESS', statusLabel: '进行中' }), null);
  assert.equal(mapApplicationOrderDetail({}).ok, false);
});
