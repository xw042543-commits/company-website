/* eslint-disable @typescript-eslint/no-explicit-any -- Exercise the actual native Page controller in the browser demo boundary. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlanningDemo } from '../scripts/planning-agent-demo';
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
