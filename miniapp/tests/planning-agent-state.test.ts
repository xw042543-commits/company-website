import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import * as agentState from '../miniprogram/utils/planning-agent-state';
import { canSave, createRunPoller, createRequestAttempt, describeError, programmeCards, parseReply } from '../miniprogram/utils/planning-agent-state';

test('saving requires a ready result and explicit confirmation', () => {
  assert.equal(canSave('polling', true), false);
  assert.equal(canSave('ready', false), false);
  assert.equal(canSave('ready', true), true);
});
test('academic scale aliases normalize without converting scores or language examination scales', () => {
  const { aliases } = JSON.parse(readFileSync(new URL('../../backend/src/test/resources/planning-score-contract.json', import.meta.url), 'utf8'));
  for (const field of ['grade.scale', 'math.scale', 'science.scale']) {
    for (const [alias, canonical] of Object.entries(aliases)) {
      assert.equal(agentState.canonicalAcademicScale(field, alias), canonical);
      assert.equal(agentState.canonicalAcademicScale(field, canonical as string), canonical);
    }
    assert.equal(agentState.canonicalAcademicScale(field, 'UNKNOWN'), 'UNKNOWN');
  }
  for (const value of ['IELTS', '9', 'TOEFL', '120', 'PERCENT']) assert.equal(agentState.canonicalAcademicScale('languageTotal.scale', value), value);
  assert.equal(agentState.canonicalAcademicScale('grade', '80.0'), '80.0');
});
test('uncertain retries keep their key and payload changes get a fresh key', () => {
  let count = 0;
  const attempt = createRequestAttempt(() => `key-${++count}`);
  assert.equal(attempt.key('生成方案'), 'key-1');
  assert.equal(attempt.key('生成方案'), 'key-1');
  assert.equal(attempt.key('预算'), 'key-2');
  attempt.clear();
  assert.equal(attempt.key('预算'), 'key-3');
});
test('poller starts at 2s, caps at 5s, stops on hide and ignores in-flight response', async () => {
  const scheduled: Array<{ fn: () => void; delay: number }> = [];
  let resolve!: (value: unknown) => void; let delivered = 0; let cancelled = 0;
  const poller = createRunPoller({ now: () => 0,
    schedule: (fn, delay) => { scheduled.push({ fn, delay }); return scheduled.length; }, cancel: () => { cancelled++; },
    read: () => new Promise(done => { resolve = done; }), receive: () => { delivered++; return true; }, expired: () => {} });
  poller.start(60000); assert.equal(scheduled[0]?.delay, 2000);
  scheduled[0]!.fn(); poller.stop(); resolve({}); await Promise.resolve(); await Promise.resolve();
  assert.equal(delivered, 0); assert.ok(cancelled >= 1);
  const delays: number[] = []; let now = 0; let timeout = 0;
  const bounded = createRunPoller({ now: () => now, schedule: (fn, delay) => { delays.push(delay); scheduled.push({ fn, delay }); return 1; },
    cancel: () => {}, read: async () => ({}), receive: () => true, expired: () => { timeout++; } });
  bounded.start(11000);
  for (let i = 0; i < 4; i++) { const job = scheduled.at(-1)!; now += job.delay; job.fn(); await Promise.resolve(); await Promise.resolve(); }
  assert.ok(delays.every(delay => delay <= 5000)); assert.equal(timeout, 1);
});
test('structured input and expired auth have usable recovery actions', () => {
  assert.equal(describeError('STRUCTURED_INPUT_REQUIRED').action, 'profile');
  assert.equal(describeError('AUTHENTICATION_REQUIRED').action, 'login');
  assert.equal(describeError('PRIVACY_CONSENT_REQUIRED').action, 'new-session');
  assert.equal(describeError('GENERATION_DAILY_LIMIT').action, 'later');
});
test('malformed model results never become plans', () => {
  assert.equal(parseReply('not json'), null);
  assert.equal(parseReply('{"type":"PLAN","plan":{}}'), null);
});
test('fee cards expose verified periods units inclusion and scope, while historical detail stays unknown', () => {
  const programme = { programmeId: 1, classification: 'UNKNOWN' as const, programmeNameZh: '课程', programmeNameEn: null, universityNameZh: '大学', universityNameEn: null,
    assessment: { eligible: false, alternatives: [] }, evidenceIds: [], evidenceSnapshot: [], ruleVersion: null, ruleSnapshot: null,
    budget: { subtotals: { MYR: 20000 }, complete: true, missing: [] } };
  const legacy = programmeCards({ profileVersion: 1, generalNextSteps: [], programmes: [programme] })[0]!;
  assert.match((legacy as unknown as { feeScope: string }).feeScope ?? '', /未知/);
  const details = { ...programme, budget: { ...programme.budget, calculationScope: 'WHOLE_STUDY', categories: ['TUITION','TAX','LIVING'], preference: 'WITHIN', comparisonReason: 'VERIFIED_SCOPE_ONLY',
    lineItems: [{ id: 1, programmeId: 1, amount: 10000, currency: 'MYR', period: 'YEAR', units: 2, evidenceId: 1, includedIn: null, category: 'TUITION', coverageComplete: true },
      { id: 2, programmeId: 1, amount: 100, currency: 'MYR', period: 'TOTAL', units: 1, evidenceId: 2, includedIn: 1, category: 'TAX', coverageComplete: true },
      { id: 3, programmeId: 1, amount: 0, currency: 'MYR', period: 'SEMESTER', units: 4, evidenceId: 3, includedIn: null, category: 'LIVING', coverageComplete: true }] } };
  const card = programmeCards({ profileVersion: 1, generalNextSteps: [], programmes: [details] })[0]! as unknown as { feeLines: string[]; feeScope: string; budgetPreference: string };
  assert.match(card.feeLines[0]!, /MYR 10000.*每年.*2/); assert.match(card.feeLines[1]!, /全程.*已包含.*#1/);
  assert.match(card.feeLines[2]!, /每学期.*4/); assert.match(card.feeScope, /学费.*税费.*生活费/); assert.match(card.budgetPreference, /已核验.*预算/);
});
test('a missing translation still renders the available server name', () => {
  const value = JSON.stringify({ type: 'PLAN', questions: [], plan: { profileVersion: 1, generalNextSteps: [], programmes: [{ programmeId: 2, classification: 'ELIGIBLE',
    programmeNameZh: null, programmeNameEn: 'Server programme', universityNameZh: null, universityNameEn: 'Server university',
    imageUrl: 'https://example.edu/campus.jpg', assessment: { eligible: true, alternatives: [[]] }, budget: { subtotals: {}, complete: false, missing: [] }, evidenceIds: [], ruleSnapshot: null, ruleVersion: null, evidenceSnapshot: [{ id: 1, sourceUrl: 'https://example.edu', checkedAt: '2026-10-01T00:00:00Z', expiresAt: null }] }] } });
  const reply = parseReply(value); assert.ok(reply?.plan); assert.equal(programmeCards(reply.plan)[0]?.title, 'Server programme');
  assert.equal(programmeCards(reply.plan)[0]?.imageUrl, 'https://example.edu/campus.jpg');
  assert.equal(programmeCards(reply.plan)[0]?.evidence[0]?.expiresDate, '未注明');
});
test('programme cards keep original currency and separate missing background from missing evidence', () => {
  const cards = programmeCards({ profileVersion: 1, generalNextSteps: [], programmes: [{ programmeId: 1,
    classification: 'UNKNOWN', programmeNameZh: '专业', programmeNameEn: '', universityNameZh: '大学', universityNameEn: '',
    evidenceIds: [1], ruleVersion: 1, ruleSnapshot: { alternatives: [[{ field: 'languageTotal', operator: 'GTE', expected: '6.0', scale: 'IELTS', evidenceId: 1 }]] },
    assessment: { eligible: false, alternatives: [[{ field: 'languageTotal', status: 'PROFILE_MISSING', evidenceId: 1 }, { field: 'grade', status: 'EVIDENCE_MISSING', evidenceId: 1 }]] },
    budget: { subtotals: { MYR: 42000 }, complete: false, missing: ['LIVING'] },
    evidenceSnapshot: [{ id: 1, programmeId: 1, factType: 'TUITION', sourceUrl: 'javascript:alert(1)', sourceType: 'OFFICIAL', studentScope: 'ALL', intake: '2027', checkedAt: '2026-10-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z' }] }] });
  assert.match(cards[0]!.fees, /MYR 42000/);
  assert.match(cards[0]!.profileMissing, /语言/); assert.match(cards[0]!.evidenceMissing, /成绩/);
  assert.equal(cards[0]!.evidence[0]!.safeUrl, '');
  assert.equal(cards[0]!.recommended, false);
  assert.match(cards[0]!.alternatives[0]!.conditions[0]!, /6.0.*IELTS/);
  assert.match(cards[0]!.alternatives[0]!.conditions[1]!, /依据待核实/);
});
