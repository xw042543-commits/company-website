import assert from 'node:assert/strict'; import test from 'node:test';
import { clearPlanningDraft, loadPlanningDraft, savePlanningDraft, type PlanningDraftStorage } from '../miniprogram/stores/planning-draft.ts';
test('recovers a complete unfinished planning form and clears it after save', () => {
  let value: unknown; const storage: PlanningDraftStorage = { get: () => value, set: (_key, next) => { value = next; }, remove: () => { value = undefined; } };
  const form = { goal: '本科', subjects: ['计算机'], country: '马来西亚', intake: '', education: '', grade: '', language: '', budget: '' };
  savePlanningDraft(form, storage); assert.deepEqual(loadPlanningDraft(storage), form); clearPlanningDraft(storage); assert.equal(loadPlanningDraft(storage), null);
});
test('rejects incomplete or malformed local planning drafts', () => {
  const storage: PlanningDraftStorage = { get: () => ({ goal: '本科', subjects: '计算机' }), set: () => {}, remove: () => {} };
  assert.equal(loadPlanningDraft(storage), null);
});
