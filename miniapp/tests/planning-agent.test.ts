import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlanningAgentGateway } from '../miniprogram/services/planning-agent';
import { createHttpClient, type RequestOptions } from '../miniprogram/services/http';
import { resolveRuntimeConfig } from '../miniprogram/config/runtime';
const id = '00000000-0000-4000-8000-000000000001';
test('gateway sends authenticated owner-free payloads and validates identifiers', async () => {
  const calls: RequestOptions[] = [];
  const gateway = createPlanningAgentGateway(async options => { calls.push(options); return { ok: true, value: { id } }; });
  await gateway.createSession('AGE_18_PLUS', 'v1');
  assert.deepEqual(calls[0]?.data, { ageBand: 'AGE_18_PLUS', privacyVersion: 'v1' });
  assert.equal(calls[0]?.authenticated, true);
  assert.equal((await gateway.getSession('../x')).ok, false); assert.equal(calls.length, 1);
});
test('unconfirmed save or invalid adviser payload never reaches server', async () => {
  let calls = 0; const gateway = createPlanningAgentGateway(async () => { calls++; return { ok: true, value: {} }; });
  await gateway.savePlan(id, id, false, 'save');
  await gateway.handoff(id, { name: 'A', contact: '123', intendedSchool: '', intendedCourse: '', qualification: '', notes: 'x'.repeat(1949), privacyConsent: true }, true, 'share');
  assert.equal(calls, 0);
});
test('planning HTTP errors retain only public allowlisted codes', async () => {
  const client = createHttpClient(resolveRuntimeConfig('local'), options => {
    options.success({ statusCode: 409, data: { code: 'PROFILE_VERSION_CONFLICT', message: 'private detail' }, header: {}, cookies: [] }); return { abort() {} };
  }, () => 'token');
  const result = await client.request({ method: 'GET', path: `/api/v1/miniapp/me/planning-agent/sessions/${id}`, authenticated: true });
  assert.deepEqual(result, { ok: false, error: { kind: 'unexpected', code: 'PROFILE_VERSION_CONFLICT' } });
  const other = await client.request({ method: 'GET', path: '/api/v1/other' });
  assert.equal(other.ok, false); if (!other.ok) assert.equal(other.error.code, 'UNEXPECTED_RESPONSE');
});
test('successful HTTP with malformed receipt cannot display save or consultation success', async () => {
  const gateway = createPlanningAgentGateway(async () => ({ ok: true, value: {} }));
  assert.equal((await gateway.savePlan(id, id, true, 'save')).ok, false);
  assert.equal((await gateway.handoff(id, { name: 'A', contact: 'B', intendedSchool: '', intendedCourse: '', qualification: '', notes: '', privacyConsent: true }, true, 'share', 1, 'a'.repeat(64))).ok, false);
  assert.equal((await gateway.getSession(id)).ok, false);
});
test('adviser gateway transports the exact selected preview fingerprint with an authenticated request', async () => {
  const calls: RequestOptions[] = [];
  const gateway = createPlanningAgentGateway(async options => { calls.push(options); return { ok: true, value: options.method === 'GET'
    ? { programmeId: 7, summary: 'Confirmed profile / selected project', fingerprint: 'a'.repeat(64) } : { referenceCode: id, submittedAt: '2026-10-15T00:00:00Z' } }; });
  assert.equal((await gateway.consultationPreview(id, 7)).ok, true);
  assert.match(calls[0]!.path, /consultation-preview\?programmeId=7$/); assert.equal(calls[0]!.authenticated, true);
  const draft = { name: 'A', contact: 'B', intendedSchool: '', intendedCourse: '', qualification: '' as const, notes: '', privacyConsent: true };
  assert.equal((await gateway.handoff(id, draft, true, 'key', 7, 'a'.repeat(64))).ok, true);
  assert.equal((calls[1]!.data as { programmeId: number }).programmeId, 7);
  assert.equal((calls[1]!.data as { previewFingerprint: string }).previewFingerprint, 'a'.repeat(64));
  assert.equal((await gateway.handoff(id, { ...draft, notes: 'x'.repeat(501) }, true, 'key', 7, 'a'.repeat(64))).ok, false);
  assert.equal(calls.length, 2);
});
