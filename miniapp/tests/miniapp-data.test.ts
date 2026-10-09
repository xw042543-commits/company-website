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
