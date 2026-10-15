/* eslint-disable @typescript-eslint/no-explicit-any -- Exercise native Page lifecycle through a dynamic test harness. */
import assert from 'node:assert/strict';
import test from 'node:test';
Object.defineProperty(globalThis, 'Page', { configurable: true, value: () => {} });
Object.defineProperty(globalThis, 'wx', { configurable: true, value: { navigateTo() {}, showToast() {}, getStorageSync() {}, setStorageSync() {}, removeStorageSync() {} } });
const { createPlanningAgentPage } = await import('../miniprogram/pages/planning-agent/index');
const id = '00000000-0000-4000-8000-000000000001';
const ok = (value: any) => ({ ok: true as const, value });
const context = (definition: any) => ({ ...definition, data: structuredClone(definition.data), setData(update: any) { Object.assign(this.data, update); } });
const auth: any = { getSnapshot: () => ({ status: 'authenticated', account: { id: 1 } }), ensureAuthenticated: async () => ok({ id: 1 }) };
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
test('page restores persisted session from server after hide and never runs hidden polling', async () => {
  let reads = 0; let runReads = 0; let cancelled = 0; const jobs: Array<() => void> = [];
  const page = context(createPlanningAgentPage({ session: auth, storage: { get: () => id, set() {}, remove() {} }, now: () => 0,
    schedule: (fn: () => void) => { jobs.push(fn); return jobs.length; }, cancel: () => { cancelled++; },
    api: { capability: async () => ok({ enabled: true, available: true, privacyVersion: 'v1' }),
      getSession: async () => { reads++; return ok({ id, profile: { version: 1, facts: { targetLevel: 'BACHELOR' } }, messages: [],
        runs: [{ runId: id, status: 'QUEUED', deadline: '1970-01-01T00:01:00Z', result: null, errorCode: null }] }); },
      getRun: async () => { runReads++; return ok({}); } } as any,
  }));
  page.onLoad({}); page.onShow(); await flush(); assert.equal(page.data.state, 'polling');
  page.onHide(); jobs[0]!(); await flush(); assert.equal(runReads, 0); assert.ok(cancelled > 0);
  page.onShow(); await flush(); assert.equal(reads, 2); page.onUnload();
});
test('duplicate sends are locked and network retry keeps request key', async () => {
  const calls: any[] = []; let complete: any;
  const page = context(createPlanningAgentPage({ session: auth, api: { sendMessage: async (...args: any[]) => { calls.push(args); return new Promise(done => { complete = done; }); } } as any, createKey: () => 'same-key' }));
  page.onLoad({}); Object.assign(page.data, { available: true, sessionId: id, profileVersion: 1, input: '预算' });
  const first = page.send(); await page.send(); assert.equal(calls.length, 1);
  complete({ ok: false, error: { code: 'NETWORK_UNAVAILABLE' } }); await first;
  const retry = page.send(); assert.equal(calls[1][3], calls[0][3]); complete({ ok: false, error: { code: 'NETWORK_UNAVAILABLE' } }); await retry;
});
test('save and adviser actions show success only after server confirms, with explicit consent', async () => {
  let saves = 0; let finish: any;
  const page = context(createPlanningAgentPage({ session: auth, api: { savePlan: async () => { saves++; return new Promise(done => { finish = done; }); } } as any }));
  page.onLoad({}); Object.assign(page.data, { sessionId: id, runId: id, state: 'ready', plan: { profileVersion: 1 }, profileVersion: 1 });
  await page.save(); assert.equal(saves, 0);
  page.data.saveConsent = true; const save = page.save(); await page.save();
  assert.equal(saves, 1); assert.equal(page.data.savedPlanId, '');
  finish(ok({ planId: id, version: 1 })); await save; assert.equal(page.data.savedPlanId, id);
});
test('unavailable direct entry retains catalogue consultation and saved history navigation', async () => {
  const urls: string[] = [];
  const page = context(createPlanningAgentPage({ session: auth, navigate: url => urls.push(url),
    api: { capability: async () => ok({ enabled: false, available: false, privacyVersion: null }) } as any }));
  page.onLoad({}); page.onShow(); await flush(); assert.equal(page.data.available, false);
  page.catalogue(); page.adviser(); page.myPlans();
  assert.deepEqual(urls, ['/pages/planning-discovery/index', '/pages/consultation/index', '/pages/plans/index']);
});
test('home Agent entry requires enabled and available, stale success cannot reopen it', async () => {
  const { createHomePage } = await import('../miniprogram/pages/home/index');
  let result: any = ok({ enabled: true, available: false });
  const page = context(createHomePage({ capability: async () => result } as any));
  await page.loadAgentCapability(); assert.equal(page.data.agentAvailable, false);
  result = ok({ enabled: true, available: true }); await page.loadAgentCapability(); assert.equal(page.data.agentAvailable, true);
  result = { ok: false, error: { code: 'AUTH_REQUIRED' } }; await page.loadAgentCapability(); assert.equal(page.data.agentAvailable, false);
});
test('Agent list failure preserves legacy plans and each type opens its own route', async () => {
  const { createPlansPage } = await import('../miniprogram/pages/plans/index');
  const urls: string[] = [];
  const page = context(createPlansPage({ auth: auth.ensureAuthenticated, navigate: url => urls.push(url),
    listLegacy: async () => ok([{ id: 7 }]), api: { listPlans: async () => ({ ok: false, error: { code: 'NETWORK_UNAVAILABLE' } }) } as any }));
  await page.load(); assert.equal(page.data.plans[0].id, 7); assert.equal(page.data.agentState, 'failed');
  page.edit({ currentTarget: { dataset: { id: 7 } } }); page.openAgent({ currentTarget: { dataset: { id } } });
  assert.deepEqual(urls, ['/pages/planning/index?planId=7', `/pages/planning-agent/index?planId=${id}`]);
});
test('adviser submit requires explicit consent and retries one immutable payload without early success', async () => {
  let finish: any; const calls: any[] = [];
  const page = context(createPlanningAgentPage({ api: { handoff: async (...args: any[]) => { calls.push(args); return new Promise(done => { finish = done; }); } } as any, createKey: () => 'share-key' }));
  page.onLoad({}); Object.assign(page.data, { savedPlanId: id, consultation: { name: 'A', contact: 'B', intendedSchool: '', intendedCourse: '', qualification: '', notes: '', privacyConsent: false } });
  await page.handoff(); assert.equal(calls.length, 0);
  page.data.shareConsent = true; const first = page.handoff(); await page.handoff(); assert.equal(calls.length, 1); assert.equal(page.data.receipt, '');
  finish({ ok: false, error: { code: 'NETWORK_UNAVAILABLE' } }); await first; assert.equal(page.data.receipt, '');
  const retry = page.handoff(); assert.equal(calls[0][3], calls[1][3]); finish(ok({ referenceCode: id, submittedAt: '2026-10-15T00:00:00Z' })); await retry;
  assert.equal(page.data.receipt, id); assert.equal(calls[0][1].privacyConsent, true);
});
test('failed login clears previously rendered snapshot and adviser personal fields', async () => {
  const page = context(createPlanningAgentPage({ session: { ensureAuthenticated: async () => ({ ok: false, error: { code: 'AUTH_REQUIRED' } }) } as any }));
  page.onLoad({ planId: id }); Object.assign(page.data, { isSnapshot: true, plan: {}, cards: [{}], messages: [{}], consultation: { name: 'old owner' }, shareOpen: true });
  await page.load(); assert.equal(page.data.isSnapshot, false); assert.deepEqual(page.data.cards, []); assert.equal(page.data.consultation.name, '');
  assert.equal(page.data.error.action, 'login');
});
test('terminal run clears retry key and a later profile version cannot save an older result', () => {
  const page = context(createPlanningAgentPage()); page.onLoad({}); page.data.profileVersion = 2;
  const again = page.applyRun({ runId: id, status: 'FAILED', errorCode: 'STRUCTURED_INPUT_REQUIRED', result: null, deadline: '2026-10-15T00:01:00Z' });
  assert.equal(again, false); assert.equal(page.data.formOpen, true);
  const result = page.applyRun({ runId: id, status: 'SUCCEEDED', result: JSON.stringify({ type: 'PLAN', questions: [], plan: { profileVersion: 1, programmes: [], generalNextSteps: [] } }), errorCode: null, deadline: '2026-10-15T00:01:00Z' });
  assert.equal(result, false); assert.equal(page.data.plan, null); assert.equal(page.data.state, 'idle');
});
test('background steps show at most two questions and require an explicit final confirmation', async () => {
  let confirmations = 0;
  const page = context(createPlanningAgentPage({ api: { confirmProfile: async () => { confirmations++; return ok({ confirmedVersion: 1 }); } } as any }));
  page.onLoad({}); page.data.sessionId = id; page.editProfile();
  assert.equal(page.data.stepFields.length, 2); assert.equal(page.data.profileReview, false);
  page.nextProfileStep(); assert.equal(page.data.profileStep, 0);
  page.chooseField({ currentTarget: { dataset: { key: 'targetLevel', value: 'BACHELOR' } } });
  page.fieldChanged({ currentTarget: { dataset: { key: 'intake' } }, detail: { value: '2027' } });
  page.nextProfileStep(); assert.equal(page.data.profileStep, 1); assert.ok(page.data.stepFields.length <= 2);
  page.reviewProfile(); assert.equal(page.data.profileReview, true); assert.equal(confirmations, 0);
  assert.deepEqual(page.data.summaryRows.map((row: any) => row.value), ['本科', '2027']);
  await page.confirmProfile(); assert.equal(confirmations, 0);
  page.data.profileConsent = true; await page.confirmProfile(); assert.equal(confirmations, 1);
});
test('optional background groups preserve prior answers while never opening a long form', () => {
  const page = context(createPlanningAgentPage()); page.onLoad({}); page.editProfile();
  page.chooseField({ currentTarget: { dataset: { key: 'targetLevel', value: 'MASTER' } } });
  page.openProfileGroup({ currentTarget: { dataset: { step: 9 } } });
  assert.ok(page.data.stepFields.length <= 2);
  assert.equal(page.data.fields.find((field: any) => field.key === 'targetLevel').value, 'MASTER');
  assert.ok(page.data.moreGroups.length > 0);
});
test('unparsed narrative opens the relevant question without inventing extracted facts', () => {
  const page = context(createPlanningAgentPage()); page.onLoad({});
  page.openBackgroundForText('我想知道预算大概够不够');
  assert.equal(page.data.profileStep, 4);
  assert.equal(page.data.fields.find((field: any) => field.key === 'budget').value, '');
  assert.ok(page.data.stepFields.length <= 2);
});
