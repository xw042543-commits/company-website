/* eslint-disable @typescript-eslint/no-explicit-any -- Exercise native Page lifecycle through a dynamic test harness. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
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
test('home hides the unfinished AI planning tool', async () => {
  const { createHomePage } = await import('../miniprogram/pages/home/index');
  const page = context(createHomePage());
  const urls: string[] = [];
  const originalNavigate = wx.navigateTo;
  wx.navigateTo = (({ url }: { url: string }) => urls.push(url)) as any;
  try {
    assert.deepEqual(page.data.featureEntries.map((entry: any) => entry.key), ['planning', 'universities', 'visa']);
    assert.equal(page.data.featureEntries.some((entry: any) => entry.key === 'ai'), false);
    assert.deepEqual(urls, []);
  } finally { wx.navigateTo = originalNavigate; }
});
test('plans page only loads and opens the supported manual plans', async () => {
  const { createPlansPage } = await import('../miniprogram/pages/plans/index');
  const urls: string[] = [];
  const page = context(createPlansPage({ auth: auth.ensureAuthenticated, navigate: url => urls.push(url),
    listLegacy: async () => ok([{ id: 7 }]) }));
  await page.load(); assert.equal(page.data.plans[0].id, 7); assert.equal('agentState' in page.data, false);
  page.edit({ currentTarget: { dataset: { id: 7 } } });
  assert.deepEqual(urls, ['/pages/planning/index?planId=7']);
});
test('adviser submit requires explicit consent and retries one immutable payload without early success', async () => {
  let finish: any; const calls: any[] = [];
  const page = context(createPlanningAgentPage({ api: { handoff: async (...args: any[]) => { calls.push(args); return new Promise(done => { finish = done; }); } } as any, createKey: () => 'share-key' }));
  page.onLoad({}); Object.assign(page.data, { savedPlanId: id, sharePreview: { programmeId: 1, fingerprint: 'a'.repeat(64), summary: 'Confirmed background' }, consultation: { name: 'A', contact: 'B', intendedSchool: '', intendedCourse: '', qualification: '', notes: '', privacyConsent: false } });
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
test('adviser sharing previews selected saved project and invalidates consent when selection changes', async () => {
  const previews: number[] = []; const submissions: any[] = [];
  const page = context(createPlanningAgentPage({ api: {
    consultationPreview: async (_id: string, programmeId: number) => { previews.push(programmeId); return ok({ programmeId, summary: `确认背景 / 项目 ${programmeId}`, fingerprint: String(programmeId).repeat(64) }); },
    handoff: async (...args: any[]) => { submissions.push(args); return ok({ referenceCode: id }); },
  } as any }));
  page.onLoad({}); Object.assign(page.data, { savedPlanId: id, cards: [{ id: 1, title: '项目一' }, { id: 2, title: '项目二' }], consultation: { name: 'A', contact: 'B' } });
  await page.openShare(); assert.deepEqual(previews, [1]); assert.equal(page.data.sharePreview.summary, '确认背景 / 项目 1');
  assert.equal(page.data.shareConsent, false); await page.handoff(); assert.equal(submissions.length, 0);
  page.data.shareConsent = true; await page.selectShareProgramme({ detail: { value: '1' } });
  assert.deepEqual(previews, [1, 2]); assert.equal(page.data.shareConsent, false); assert.equal(page.data.sharePreview.summary, '确认背景 / 项目 2');
  page.data.shareConsent = true; await page.handoff(); assert.equal(submissions[0][4], 2); assert.equal(submissions[0][5], '2'.repeat(64));
});
test('login recovery explicitly reauthenticates instead of trusting a cached account again', async () => {
  let logins = 0;
  const page = context(createPlanningAgentPage({ session: { ...auth, login: async () => { logins++; return ok({ id: 1 }); } } as any,
    storage: { get: () => '', set() {}, remove() {} }, api: { capability: async () => ok({ enabled: false, available: false, privacyVersion: null }) } as any }));
  page.onLoad({}); page.setData({ error: { action: 'login' } }); page.recover(); await flush();
  assert.equal(logins, 1); assert.equal(page.data.error, null);
});
for (const boundary of ['owner-change', 'auth-failure']) test(`${boundary} clears all drafts, derived views, consents and pending recovery context`, async () => {
  let owner = 1; let loggedIn = true; let nextKey = 0; const keys: string[] = [];
  const page = context(createPlanningAgentPage({
    session: { ensureAuthenticated: async () => loggedIn ? ok({ id: owner }) : { ok: false, error: { code: 'AUTH_REQUIRED' } } } as any,
    storage: { get: () => '', set() {}, remove() {} }, createKey: () => `request-${++nextKey}`,
    api: { capability: async () => ok({ enabled: true, available: true, privacyVersion: 'v1' }),
      sendMessage: async (_session: string, _text: string, _intent: string, key: string) => { keys.push(key); return { ok: false, error: { code: 'NETWORK_UNAVAILABLE' } }; } } as any,
  }));
  page.onLoad({}); page.onShow(); await flush();
  Object.assign(page.data, { sessionId: id, input: '预算' }); await page.send();
  page.editProfile(); page.fieldChanged({ currentTarget: { dataset: { key: 'budget' } }, detail: { value: '123456' } }); page.reviewProfile();
  Object.assign(page.data, { input: 'private draft', ageBand: 'AGE_18_PLUS', ageIndex: 2, privacyConsent: true, profileConsent: true,
    saveConsent: true, shareConsent: true, consentOpen: true, shareOpen: true, saveOpen: true, moreOpen: true, menuOpen: true,
    consultationDetails: true, qualificationIndex: 2, consultation: { name: 'private name', contact: 'private contact' },
    receipt: 'old receipt', backgroundSummary: 'old background', confirmedFacts: { budget: '123456' }, questions: ['old question'], warnings: ['old warning'] });
  assert.ok(page.data.summaryRows.some((row: any) => row.value === '123456'));
  page.onHide(); if (boundary === 'owner-change') owner = 2; else loggedIn = false;
  page.onShow(); await flush();
  assert.deepEqual(page.data.summaryRows, []); assert.ok(page.data.fields.every((field: any) => field.value === ''));
  assert.ok(page.data.stepFields.every((field: any) => field.value === ''));
  for (const field of ['formOpen', 'profileReview', 'privacyConsent', 'profileConsent', 'saveConsent', 'shareConsent', 'consentOpen', 'shareOpen', 'saveOpen', 'moreOpen', 'menuOpen', 'consultationDetails']) assert.equal(page.data[field], false, field);
  for (const field of ['input', 'ageBand', 'sessionId', 'runId', 'savedPlanId', 'receipt']) assert.equal(page.data[field], '', field);
  assert.equal(page.data.ageIndex, 0); assert.equal(page.data.qualificationIndex, 0); assert.deepEqual(page.data.confirmedFacts, {});
  assert.equal(page.data.consultation.name, ''); assert.equal(page.data.consultation.contact, ''); assert.deepEqual(page.data.questions, []); assert.deepEqual(page.data.warnings, []);
  assert.notEqual(page.data.backgroundSummary, 'old background');
  if (boundary === 'auth-failure') { assert.equal(page.data.error.action, 'login'); loggedIn = true; page.onShow(); await flush(); }
  page.setData({ error: { action: 'profile' } }); page.recover(); assert.equal(page.data.profileStep, 0, 'old pending narrative must not steer another identity');
  Object.assign(page.data, { sessionId: id, input: '预算', state: 'idle' }); await page.send();
  assert.notEqual(keys[0], keys[1], 'retry identity must not survive an account/auth boundary');
  page.onUnload();
});
test('terminal run clears retry key and a later profile version cannot save an older result', () => {
  const page = context(createPlanningAgentPage()); page.onLoad({}); page.data.profileVersion = 2;
  const again = page.applyRun({ runId: id, status: 'FAILED', errorCode: 'STRUCTURED_INPUT_REQUIRED', result: null, deadline: '2026-10-15T00:01:00Z' });
  assert.equal(again, false); assert.equal(page.data.formOpen, true);
  const result = page.applyRun({ runId: id, status: 'SUCCEEDED', result: JSON.stringify({ type: 'PLAN', questions: [], plan: { profileVersion: 1, programmes: [], generalNextSteps: [] } }), errorCode: null, deadline: '2026-10-15T00:01:00Z' });
  assert.equal(result, false); assert.equal(page.data.plan, null); assert.equal(page.data.state, 'idle');
});
for (const boundary of ['capability', 'poll', 'save', 'handoff']) test(`${boundary} final auth failure clears private state and invalidates outstanding responses`, async () => {
  const jobs: Array<() => void> = []; let stale: any; let capabilityFails = false;
  const denied = { ok: false, error: { code: 'AUTH_REQUIRED' } };
  const page = context(createPlanningAgentPage({ session: auth, now: () => 0,
    storage: { get: () => id, set() {}, remove() {} }, schedule: fn => { jobs.push(fn); return jobs.length; }, cancel() {},
    api: { capability: async () => capabilityFails ? denied : ok({ enabled: true, available: true, privacyVersion: 'v1' }),
      getSession: async () => ok({ id, profile: { version: 1, facts: { targetLevel: 'MASTER' } }, messages: [],
        runs: [{ runId: id, status: 'QUEUED', deadline: '1970-01-01T00:01:00Z', result: null, errorCode: null }] }),
      getRun: async () => denied, savePlan: async () => denied, handoff: async () => denied,
      getPlan: async () => new Promise(resolve => { stale = resolve; }) } as any,
  }));
  page.onLoad({}); await page.load();
  const pending = page.loadSaved(id);
  Object.assign(page.data, { state: 'ready', savedPlanId: boundary === 'save' ? '' : id, isSnapshot: false, plan: { profileVersion: 1 },
    saveConsent: true, shareConsent: true, shareOpen: true, input: 'private draft', confirmedFacts: { grade: '80' },
    sharePreview: { programmeId: 1, fingerprint: 'a'.repeat(64), summary: 'Private confirmed background' }, consultation: { name: 'Alice', contact: 'private contact' } });
  if (boundary === 'capability') { capabilityFails = true; await page.load(); }
  else if (boundary === 'poll') { jobs[0]!(); await flush(); }
  else await page[boundary]();
  assert.equal(page.data.error.action, 'login'); assert.equal(page.data.shareOpen, false); assert.equal(page.data.consultation.contact, '');
  assert.equal(page.data.plan, null); assert.deepEqual(page.data.confirmedFacts, {}); assert.equal(page.data.input, '');
  stale(ok({ snapshot: { profile: { version: 1, facts: { grade: '80' } }, plan: { profileVersion: 1, programmes: [], generalNextSteps: [] } }, revalidationWarnings: [] }));
  await pending; assert.equal(page.data.plan, null); assert.equal(page.data.savedPlanId, ''); page.onUnload();
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
test('confirmed UI score payload matches the contract exercised by the real backend endpoint and evaluator', async () => {
  const fixture = JSON.parse(readFileSync(new URL('../../backend/src/test/resources/planning-score-contract.json', import.meta.url), 'utf8'));
  let submitted: any;
  const page = context(createPlanningAgentPage({ api: { confirmProfile: async (_id: string, profile: any) => { submitted = profile; return ok({ confirmedVersion: 1 }); } } as any }));
  page.onLoad({}); page.data.sessionId = id; page.editProfile();
  for (const [key, value] of Object.entries(fixture.profile.facts)) {
    const field = page.data.fields.find((candidate: any) => candidate.key === key);
    if (key.endsWith('.scale')) {
      // Select the actual visible choice by its ordinal, not by injecting the expected wire value.
      const index = ['100', '4', '5', '10'].indexOf(value as string) + 1;
      page.chooseField({ currentTarget: { dataset: { key, value: field.options[index] } } });
    } else if (field.options.length) page.chooseField({ currentTarget: { dataset: { key, value } } });
    else page.fieldChanged({ currentTarget: { dataset: { key } }, detail: { value } });
  }
  page.reviewProfile(); page.data.profileConsent = true; await page.confirmProfile();
  assert.deepEqual(submitted, fixture.profile);
  page.showProfile({ ...fixture.profile.facts, 'grade.scale': 'PERCENT', 'math.scale': 'GPA4', 'science.scale': 'GPA5' });
  assert.deepEqual(page.data.fields.filter((field: any) => field.key.endsWith('.scale')).map((field: any) => field.value), ['100', '4', '5']);
  assert.ok(page.data.fields.filter((field: any) => field.key.endsWith('.scale')).every((field: any) => field.display !== '未提供'));
});
