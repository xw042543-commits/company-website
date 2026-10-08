import type { StudyPlanForm } from '../services/miniapp-data';

export const PLANNING_DRAFT_KEY = 'udajo.miniapp.planning-draft.v1';
export interface PlanningDraftStorage { get(key: string): unknown; set(key: string, value: StudyPlanForm): unknown; remove(key: string): unknown }

export function loadPlanningDraft(storage: PlanningDraftStorage = wechatStorage): StudyPlanForm | null {
  try { return normalize(storage.get(PLANNING_DRAFT_KEY)); } catch { return null; }
}
export function savePlanningDraft(form: StudyPlanForm, storage: PlanningDraftStorage = wechatStorage): void {
  try { storage.set(PLANNING_DRAFT_KEY, form); } catch { /* Draft recovery is best effort. */ }
}
export function clearPlanningDraft(storage: PlanningDraftStorage = wechatStorage): void {
  try { storage.remove(PLANNING_DRAFT_KEY); } catch { /* A missing draft is already cleared. */ }
}
const wechatStorage: PlanningDraftStorage = {
  get: (key) => wx.getStorageSync<unknown>(key), set: (key, value) => wx.setStorageSync(key, value),
  remove: (key) => wx.removeStorageSync(key),
};
function normalize(value: unknown): StudyPlanForm | null {
  if (!object(value) || !text(value.goal) || !Array.isArray(value.subjects) || !value.subjects.every(text)
    || !text(value.country) || typeof value.intake !== 'string' || typeof value.education !== 'string'
    || typeof value.grade !== 'string' || typeof value.language !== 'string' || typeof value.budget !== 'string') return null;
  return { goal: value.goal, subjects: [...value.subjects], country: value.country, intake: value.intake,
    education: value.education, grade: value.grade, language: value.language, budget: value.budget };
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
