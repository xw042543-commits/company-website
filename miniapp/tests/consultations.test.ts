import assert from 'node:assert/strict';
import test from 'node:test';

import { createConsultationGateway } from '../miniprogram/services/consultations.ts';
import type { RequestOptions } from '../miniprogram/services/http.ts';

const valid = {
  name: '  王欣  ', contact: '  wx-wang  ', intendedSchool: '  世纪大学  ',
  intendedCourse: '  工商管理  ', qualification: 'bachelor' as const,
  notes: '  希望了解九月入学  ', privacyConsent: true,
};

test('authenticated consultation submission sends normalized consented data and maps its receipt', async () => {
  const calls: RequestOptions[] = [];
  const gateway = createConsultationGateway(async (options) => {
    calls.push(options);
    return { ok: true, value: { referenceCode: 'c4d29e18-b266-4f6a-8e24-7cc312388174', submittedAt: '2026-10-11T01:00:00Z' } };
  });
  const result = await gateway.submit(valid);
  assert.deepEqual(calls, [{
    method: 'POST', path: '/api/v1/consultations', authenticated: true, requestKey: 'consultation-submit',
    data: { name: '王欣', contact: 'wx-wang', intendedSchool: '世纪大学', intendedCourse: '工商管理',
      qualification: 'bachelor', notes: '希望了解九月入学', locale: 'zh', privacyConsent: true },
  }]);
  assert.deepEqual(result, { ok: true, value: {
    referenceCode: 'c4d29e18-b266-4f6a-8e24-7cc312388174', submittedAt: '2026-10-11T01:00:00Z',
  } });
});

test('consultation submission rejects incomplete data before making a request', async () => {
  let calls = 0;
  const gateway = createConsultationGateway(async () => { calls++; return { ok: true, value: {} }; });
  for (const draft of [
    { ...valid, name: ' ' }, { ...valid, contact: '' }, { ...valid, privacyConsent: false },
    { ...valid, notes: 'x'.repeat(2001) },
  ]) assert.equal((await gateway.submit(draft)).ok, false);
  assert.equal(calls, 0);
});

test('consultation submission rejects malformed server receipts', async () => {
  const gateway = createConsultationGateway(async () => ({ ok: true, value: { referenceCode: '../admin', submittedAt: '' } }));
  assert.deepEqual(await gateway.submit(valid), {
    ok: false, error: { kind: 'unexpected', code: 'INVALID_CONSULTATION_RESPONSE' },
  });
});
