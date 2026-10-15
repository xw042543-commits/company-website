import { request, type RequestOptions } from './http';
import type { Result } from '../utils/result';
import type { ConsultationDraft, ConsultationReceipt } from './consultations';

export interface Capability { enabled: boolean; available: boolean; privacyVersion: string | null }
export interface Profile { version: number; facts: Record<string, string> }
export interface Run { runId: string; status: string; deadline: string; result: string | null; errorCode: string | null }
export interface Session { id: string; profile: Profile; messages: Array<{ id: number; role: string; text: string; createdAt: string }>; runs: Run[] }
export interface Finding { field: string; status: 'MET' | 'NOT_MET' | 'PROFILE_MISSING' | 'EVIDENCE_MISSING'; evidenceId: number }
export interface Evidence { id: number; programmeId: number; factType: string; sourceUrl: string; sourceType: string; studentScope: string; intake: string; checkedAt: string; expiresAt: string | null }
export interface Programme {
  programmeId: number; classification: 'ELIGIBLE' | 'NOT_MET' | 'UNKNOWN';
  programmeNameZh: string | null; programmeNameEn: string | null; universityNameZh: string | null; universityNameEn: string | null;
  assessment: { eligible: boolean; alternatives: Finding[][] };
  budget: { subtotals: Record<string, number>; complete: boolean; missing: string[] };
  evidenceIds: number[]; ruleVersion: number | null; ruleSnapshot: unknown; evidenceSnapshot: Evidence[];
  imageUrl?: string | null;
}
export interface Plan { profileVersion: number; programmes: Programme[]; generalNextSteps: string[] }
export interface SavedPlan { planId: string; version: number }
export interface SavedView { snapshot: { profile: Profile; plan: Plan }; revalidationWarnings: string[] }
export type Intent = 'CHAT' | 'GENERATE';
type Sender = (options: RequestOptions) => Promise<Result<unknown>>;
const ROOT = '/api/v1/miniapp/me/planning-agent';
export const validAgentId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const invalid = (): Result<never> => ({ ok: false, error: { kind: 'validation', code: 'INVALID_PLAN_REQUEST' } });

export function createPlanningAgentGateway(send: Sender = request) {
  async function call<T>(method: RequestOptions['method'], suffix: string, data?: unknown): Promise<Result<T>> {
    const result = await send({ method, path: `${ROOT}${suffix}`, authenticated: true, ...(data === undefined ? {} : { data }) });
    if (!result.ok) return result;
    if (!validResponse(method, suffix, result.value)) return { ok: false, error: { kind: 'unexpected', code: 'INVALID_PLANNING_RESPONSE' } };
    return { ok: true, value: result.value as T };
  }
  return {
    capability: () => call<Capability>('GET', '/capability'),
    createSession(ageBand: string, privacyVersion: string) {
      if (!['AGE_14_17', 'AGE_18_PLUS'].includes(ageBand) || !privacyVersion || privacyVersion.length > 50) return Promise.resolve(invalid());
      return call<{ id: string }>('POST', '/sessions', { ageBand, privacyVersion });
    },
    getSession: (id: string) => validAgentId(id) ? call<Session>('GET', `/sessions/${id}`) : Promise.resolve(invalid()),
    deleteSession: (id: string) => validAgentId(id) ? call<void>('DELETE', `/sessions/${id}`) : Promise.resolve(invalid()),
    sendMessage(id: string, text: string, intent: Intent, requestKey: string) {
      if (!validAgentId(id) || !text.trim() || text.length > 4000 || !requestKey || requestKey.length > 100) return Promise.resolve(invalid());
      return call<Pick<Run, 'runId' | 'status' | 'deadline'>>('POST', `/sessions/${id}/messages`, { text, intent, requestKey });
    },
    getRun: (id: string, runId: string) => validAgentId(id) && validAgentId(runId) ? call<Run>('GET', `/sessions/${id}/runs/${runId}`) : Promise.resolve(invalid()),
    confirmProfile: (id: string, profile: Profile) => validAgentId(id) ? call<{ confirmedVersion: number }>('POST', `/sessions/${id}/profile-confirmation`, profile) : Promise.resolve(invalid()),
    savePlan(id: string, runId: string, confirmed: boolean, requestKey: string) {
      if (!validAgentId(id) || !validAgentId(runId) || !confirmed || !requestKey) return Promise.resolve(invalid());
      return call<SavedPlan>('POST', `/sessions/${id}/plans`, { runId, confirmed, requestKey });
    },
    listPlans: () => call<SavedPlan[]>('GET', '/plans'),
    getPlan: (id: string) => validAgentId(id) ? call<SavedView>('GET', `/plans/${id}`) : Promise.resolve(invalid()),
    deletePlan: (id: string) => validAgentId(id) ? call<void>('DELETE', `/plans/${id}`) : Promise.resolve(invalid()),
    handoff(id: string, draft: ConsultationDraft, confirmed: boolean, requestKey: string) {
      const name = draft.name.trim(); const contact = draft.contact.trim(); const notes = draft.notes.trim();
      if (!validAgentId(id) || !confirmed || !draft.privacyConsent || !name || name.length > 100 || !contact || contact.length > 100
        || draft.intendedSchool.length > 200 || draft.intendedCourse.length > 200 || notes.length > 1948
        || !['', 'foundation', 'bachelor', 'master', 'doctorate'].includes(draft.qualification) || !requestKey) return Promise.resolve(invalid());
      return call<ConsultationReceipt>('POST', `/plans/${id}/consultations`, { confirmed, requestKey, consultationRequest: {
        name, contact, intendedSchool: draft.intendedSchool.trim() || null, intendedCourse: draft.intendedCourse.trim() || null,
        qualification: draft.qualification || null, notes: notes || null, locale: 'zh', privacyConsent: true,
      } });
    },
  };
}
export const planningAgent = createPlanningAgentGateway();

function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function profile(value: unknown): boolean { return object(value) && Number.isSafeInteger(value.version) && Number(value.version) >= 0 && object(value.facts) && Object.values(value.facts).every(v => typeof v === 'string'); }
function saved(value: unknown): boolean { return object(value) && typeof value.planId === 'string' && validAgentId(value.planId) && Number.isSafeInteger(value.version) && Number(value.version) > 0; }
function run(value: unknown, accepted = false): boolean {
  return object(value) && typeof value.runId === 'string' && validAgentId(value.runId)
    && ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT'].includes(String(value.status))
    && typeof value.deadline === 'string' && Number.isFinite(Date.parse(value.deadline))
    && (accepted || ((value.result === null || typeof value.result === 'string') && (value.errorCode === null || typeof value.errorCode === 'string')));
}
function validResponse(method: RequestOptions['method'], suffix: string, value: unknown): boolean {
  if (method === 'DELETE') return true;
  if (suffix === '/capability') return object(value) && typeof value.enabled === 'boolean' && typeof value.available === 'boolean'
    && (value.privacyVersion === null || typeof value.privacyVersion === 'string');
  if (suffix === '/sessions') return object(value) && typeof value.id === 'string' && validAgentId(value.id);
  if (suffix.endsWith('/messages')) return run(value, true);
  if (suffix.includes('/runs/')) return run(value);
  if (suffix.endsWith('/profile-confirmation')) return object(value) && Number.isSafeInteger(value.confirmedVersion) && Number(value.confirmedVersion) > 0;
  if (suffix.endsWith('/consultations')) return object(value) && typeof value.referenceCode === 'string' && validAgentId(value.referenceCode) && typeof value.submittedAt === 'string' && Number.isFinite(Date.parse(value.submittedAt));
  if (suffix === '/plans') return Array.isArray(value) && value.every(saved);
  if (suffix.endsWith('/plans')) return saved(value);
  if (suffix.startsWith('/plans/')) return object(value) && object(value.snapshot) && profile(value.snapshot.profile) && object(value.snapshot.plan) && Array.isArray(value.revalidationWarnings) && value.revalidationWarnings.every(v => typeof v === 'string');
  return object(value) && typeof value.id === 'string' && validAgentId(value.id) && profile(value.profile) && Array.isArray(value.runs) && value.runs.every(v => run(v))
    && Array.isArray(value.messages) && value.messages.every(m => object(m) && Number.isSafeInteger(m.id) && ['USER', 'ASSISTANT'].includes(String(m.role)) && typeof m.text === 'string');
}
