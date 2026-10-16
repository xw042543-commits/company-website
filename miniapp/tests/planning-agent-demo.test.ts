/* eslint-disable @typescript-eslint/no-explicit-any -- Exercise the actual native Page controller in the browser demo boundary. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlanningDemo, demoFacts, demoPlan } from '../scripts/planning-agent-demo';
import { attachDemoInputBridge } from '../scripts/planning-demo-input-bridge';
Object.defineProperty(globalThis, 'Page', { configurable: true, value: () => {} });
const { createPlanningAgentPage } = await import('../miniprogram/pages/planning-agent/index');
async function setup(demo = createPlanningDemo()) {
  const definition = createPlanningAgentPage({ api: demo.api, session: demo.session, storage: demo.storage });
  const page: any = { ...definition, data: structuredClone(definition.data), setData(patch: any) { Object.assign(this.data, patch); } };
  page.onLoad({}); await page.load(); return { demo, page };
}
async function profile(page: any, budget = '150000') {
  page.ageChanged({ detail: { value: '2' } }); page.data.privacyConsent = true; await page.start();
  page.showProfile({ targetLevel: 'BACHELOR', intake: '2027', education: 'HIGH_SCHOOL', qualification: 'HIGH_SCHOOL', grade: '82', 'grade.scale': '100', languageTest: 'IELTS', languageTotal: '6', budget, budgetCurrency: 'MYR', budgetPeriod: 'TOTAL', budgetIncludesLiving: 'true', subject: '计算机', city: '演示城' });
  page.data.profileConsent = true; await page.confirmProfile();
}
// Catches disabled gateway, malformed transport payloads, missing authoritative session/run updates.
test('demo drives the real controller from consent through a synthetic plan and budget revision', async () => {
  const { page } = await setup(); assert.equal(page.data.available, true);
  await profile(page); assert.equal(page.data.profileVersion, 1);
  await page.generate(); assert.equal(page.data.state, 'ready');
  assert.equal(page.data.cards.length, 2);
  assert.match(page.data.cards[0].university, /虚构/);
  assert.equal(page.data.cards[0].fees, 'MYR 126000');
  page.expandEvidence({ currentTarget: { dataset: { id: 101 } } });
  assert.equal(page.data.cards[0].expanded, true);
  assert.equal(page.data.cards[0].feeLines.length, 3);
  assert.match(page.data.cards[0].evidence[0].studentScope, /模拟来源/);
  assert.match(page.data.cards[0].budgetPreference, /未超过/);
  page.editProfile(); page.fieldChanged({ currentTarget: { dataset: { key: 'budget' } }, detail: { value: '90000' } });
  page.data.profileConsent = true; await page.confirmProfile();
  assert.equal(page.data.profileVersion, 2); assert.equal(page.data.plan, null);
  await page.generate(); assert.match(page.data.cards[0].budgetPreference, /超过确认预算/);
  assert.equal(page.data.plan.profileVersion, 2);
});

// Catches a bachelor fallback for other levels or invented verified/official evidence.
for (const [level, title] of [['FOUNDATION', '预科'], ['BACHELOR', '学士'], ['MASTER', '硕士'], ['DOCTOR', '博士']]) {
  test(`fictional plan respects ${level}`, () => {
    const plan = demoPlan({ version: 2, facts: { ...demoFacts, targetLevel: level! } });
    assert.equal(plan.programmes.length, 2);
    for (const item of plan.programmes) {
      assert.ok(item.programmeNameZh?.includes(title!));
      assert.equal(item.classification, 'UNKNOWN'); assert.equal(item.assessment.eligible, false);
      assert.ok(item.evidenceSnapshot.every(source => source.sourceType === 'MOCK' && source.sourceUrl === ''));
    }
  });
}
test('missing and unsupported levels return no invented fallback', () => {
  for (const targetLevel of ['', 'DIPLOMA']) assert.deepEqual(demoPlan({ version: 1, facts: { targetLevel } }).programmes, []);
});
test('failed acceptance retries with the same key without duplicate messages or saved plans', async () => {
  const { demo, page } = await setup(); await profile(page);
  demo.failNextRun();
  const failed = await demo.api.sendMessage(page.data.sessionId, '生成方案', 'GENERATE', 'retry-key');
  assert.deepEqual(failed, { ok: false, error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' } });
  const accepted = await demo.api.sendMessage(page.data.sessionId, '生成方案', 'GENERATE', 'retry-key');
  assert.equal(accepted.ok, true); if (!accepted.ok) return;
  assert.deepEqual(await demo.api.sendMessage(page.data.sessionId, '生成方案', 'GENERATE', 'retry-key'), accepted);
  const current = await demo.api.getSession(page.data.sessionId); assert.ok(current.ok);
  if (current.ok) { assert.equal(current.value.messages.length, 1); assert.equal(current.value.runs.length, 1); }
  const saved = await demo.api.savePlan(page.data.sessionId, accepted.value.runId, true, 'save-key');
  assert.deepEqual(await demo.api.savePlan(page.data.sessionId, accepted.value.runId, true, 'save-key'), saved);
  const history = await demo.api.listPlans(); assert.ok(history.ok); if (history.ok) assert.equal(history.value.length, 1);
});
test('reset invalidates delayed work and clears armed failure', async () => {
  const demo = createPlanningDemo({ delayMs: 25 }); const { page } = await setup(demo); await profile(page);
  const pending = page.generate(); assert.equal(page.data.state, 'sending');
  page.onUnload(); demo.failNextRun(); await demo.reset(); await pending;
  assert.deepEqual(await demo.api.listPlans(), { ok: true, value: [] });
  assert.equal((await demo.api.getSession(page.data.sessionId)).ok, false);
  const fresh = await setup(demo); await profile(fresh.page); await fresh.page.generate();
  assert.equal(fresh.page.data.state, 'ready');
});
test('preview retains first typed question through consent and includes it once in generation', async () => {
  const { page, demo } = await setup(); attachDemoInputBridge(page);
  page.data.input = '想了解计算机硕士'; await page.send(); assert.equal(page.data.consentOpen, true);
  await profile(page); assert.equal(page.data.input, '想了解计算机硕士');
  await page.generate(); assert.equal(page.data.state, 'ready');
  const session = await demo.api.getSession(page.data.sessionId); assert.ok(session.ok);
  if (session.ok) assert.deepEqual(session.value.messages.map(message => message.text), ['想了解计算机硕士']);
});
// Catches a stale buffered first message replayed by Generate after the user sent it.
test('sending the retained question after confirmation consumes it before generation', async () => {
  const { page, demo } = await setup(); attachDemoInputBridge(page);
  page.data.input = '想了解计算机硕士'; await page.send();
  await profile(page); await page.send(); await page.generate();
  const session = await demo.api.getSession(page.data.sessionId); assert.ok(session.ok);
  if (session.ok) assert.deepEqual(session.value.messages.map(message => message.text), ['想了解计算机硕士', '生成方案']);
});
for (const [input, expected] of [['改为了解软件工程', '改为了解软件工程'], ['', '生成方案']]) {
  test(`generation respects the visible composer after editing it to ${JSON.stringify(input)}`, async () => {
    const { page, demo } = await setup(); attachDemoInputBridge(page);
    page.data.input = '想了解计算机硕士'; await page.send(); await profile(page);
    page.inputChanged({ detail: { value: input } }); await page.generate();
    const session = await demo.api.getSession(page.data.sessionId); assert.ok(session.ok);
    if (session.ok) assert.deepEqual(session.value.messages.map(message => message.text), [expected]);
  });
}
// Catches bypassed consent, snapshot mutation, stale preview selection, and forgotten memory on reset.
test('local save and simulated adviser confirmation require consent and reset removes all local records', async () => {
  const { page, demo } = await setup(); await profile(page); await page.generate();
  await page.save(); assert.equal(page.data.savedPlanId, '');
  page.data.saveConsent = true; await page.save(); const saved = page.data.savedPlanId;
  assert.ok(saved); const snapshot = await demo.api.getPlan(saved); assert.equal(snapshot.ok, true);
  await page.openShare(); assert.match(page.data.sharePreview.summary, /模拟交接.*不提交/);
  page.consultationChanged({ currentTarget: { dataset: { key: 'name' } }, detail: { value: '演示同学' } });
  page.consultationChanged({ currentTarget: { dataset: { key: 'contact' } }, detail: { value: 'demo@example.invalid' } });
  await page.handoff(); assert.equal(page.data.receipt, '');
  page.data.shareConsent = true; await page.handoff(); assert.ok(page.data.receipt);
  page.onUnload(); await demo.reset();
  assert.deepEqual(await demo.api.listPlans(), { ok: true, value: [] });
  assert.equal((await demo.api.getPlan(saved)).ok, false);
  const fresh = await setup(demo);
  assert.equal(fresh.page.data.consultation.contact, ''); assert.equal(fresh.page.data.privacyConsent, false);
  assert.equal(fresh.page.data.shareConsent, false); assert.equal(fresh.page.data.sessionId, '');
});
