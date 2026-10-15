import { createPlanningAgentGateway, type Plan, type Profile, type Session, type SavedView, type Run, type Programme } from '../miniprogram/services/planning-agent';
import type { Result } from '../miniprogram/utils/result';
import { createSessionStore } from '../miniprogram/stores/session';

export const demoFacts: Record<string, string> = { targetLevel: 'BACHELOR', intake: '2027', education: 'HIGH_SCHOOL', qualification: 'HIGH_SCHOOL', graduationStatus: 'EXPECTED', grade: '82', 'grade.scale': '100', languageTest: 'IELTS', languageTotal: '6', budget: '150000', budgetCurrency: 'MYR', budgetPeriod: 'TOTAL', budgetIncludesLiving: 'true', subject: '计算机', city: '演示城', studyMode: 'FULL_TIME' };

/** Deterministic fictional catalog. Nothing here is an institution, verified fact, or AI output. */
export function demoPlan(profile: Profile): Plan {
  const programmes: Programme[] = [
    { id: 101, school: '青屿科技学院（虚构）', course: '计算机科学学士（演示项目）', tuition: 84000, living: 36000, tax: 6000 },
    { id: 102, school: '云湾应用大学（虚构）', course: '软件工程学士（演示项目）', tuition: 66000, living: 30000, tax: 4000 },
  ].map(item => {
    const total = item.tuition + item.living + item.tax;
    const facts = profile.facts;
    const comparable = facts.budgetCurrency === 'MYR' && facts.budgetPeriod === 'TOTAL' && facts.budgetIncludesLiving === 'true' && Number(facts.budget) > 0;
    return { programmeId: item.id, programmeNameZh: item.course, programmeNameEn: 'Fictional demo programme', universityNameZh: item.school, universityNameEn: 'Fictional demo institution',
      classification: 'UNKNOWN', assessment: { eligible: false, alternatives: [[{ field: 'grade', status: facts.grade ? 'EVIDENCE_MISSING' : 'PROFILE_MISSING', evidenceId: item.id }]] },
      budget: { subtotals: { MYR: total }, complete: true, missing: [], categories: ['TUITION', 'LIVING', 'TAX'], calculationScope: 'WHOLE_STUDY', preference: comparable ? (Number(facts.budget) >= total ? 'WITHIN' : 'OVER') : 'UNKNOWN', comparisonReason: facts.budgetCurrency !== 'MYR' ? 'CURRENCY_NOT_COMPARABLE' : facts.budgetPeriod !== 'TOTAL' ? 'PERIOD_NOT_COMPARABLE' : 'INCOMPLETE',
        lineItems: [['TUITION', item.tuition], ['LIVING', item.living], ['TAX', item.tax]].map(([category, amount], index) => ({ id: item.id * 10 + index, programmeId: item.id, amount: Number(amount), currency: 'MYR', period: 'TOTAL', units: 1, evidenceId: item.id, includedIn: null, category: String(category), coverageComplete: true })) },
      evidenceIds: [item.id], ruleVersion: null, ruleSnapshot: null,
      evidenceSnapshot: [{ id: item.id, programmeId: item.id, factType: '模拟条件与费用（非官方）', sourceUrl: '', sourceType: 'MOCK', studentScope: '模拟来源 · 虚构数据，仅演示交互，不可用于申请或费用决策', intake: facts.intake || '演示批次', checkedAt: '2026-10-15T00:00:00Z', expiresAt: null }],
    };
  });
  return { profileVersion: profile.version, programmes, generalNextSteps: ['PREPARE_DOCUMENTS', 'CONFIRM_WITH_UNIVERSITY'] };
}

// Preview-only boundary; intentionally never uses the default HTTP sender.
export function createPlanningDemo() {
  const sessions = new Map<string, Session>(); const plans = new Map<string, SavedView>(); const memory = new Map<string, string>();
  const attempts = new Map<string, unknown>(); let sequence = 1;
  const id = () => `00000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;
  const ok = <T>(value: T): Result<T> => ({ ok: true, value: structuredClone(value) });
  const fail = (code: string): Result<never> => ({ ok: false, error: { kind: 'validation', code } });
  const storage = { get: (key: string) => memory.get(key) ?? '', set: (key: string, value: string) => { memory.set(key, value); }, remove: (key: string) => { memory.delete(key); } };
  // Reuse the app's gateway validation and real auth store with a memory-only fake identity.
  const identity = async () => ok({ account: { id: 900001, displayName: '虚构演示用户', avatarUrl: null, bindingStatus: 'UNLINKED' as const }, accessToken: 'local-demo-only', refreshToken: 'local-demo-only', accessExpiresAt: '2099-01-01T00:00:00Z', refreshExpiresAt: '2099-01-01T00:00:00Z' });
  const session = createSessionStore({ login: identity, refresh: identity, logout: async () => {} }, storage);
  const api = createPlanningAgentGateway(async options => {
    const path = options.path.replace('/api/v1/miniapp/me/planning-agent', '');
    const parts = path.split('/'); const data = (options.data ?? {}) as Record<string, unknown>;
    if (path === '/capability') return ok({ enabled: true, available: true, privacyVersion: 'demo-only-v1' });
    if (path === '/sessions' && options.method === 'POST') {
      if (data.privacyVersion !== 'demo-only-v1') return fail('PRIVACY_CONSENT_REQUIRED');
      const value: Session = { id: id(), profile: { version: 0, facts: {} }, messages: [], runs: [] }; sessions.set(value.id, value); return ok({ id: value.id });
    }
    if (path.startsWith('/sessions/')) {
      const value = sessions.get(parts[2]!); if (!value) return fail('NOT_FOUND');
      if (parts.length === 3) { if (options.method === 'DELETE') { sessions.delete(value.id); return ok(undefined); } return ok(value); }
      if (parts[3] === 'profile-confirmation') {
        if (data.version !== value.profile.version) return fail('PROFILE_VERSION_CONFLICT');
        value.profile = { version: value.profile.version + 1, facts: structuredClone(data.facts as Record<string, string>) }; return ok({ confirmedVersion: value.profile.version });
      }
      if (parts[3] === 'messages') {
        const key = `${path}:${data.requestKey}`; if (attempts.has(key)) return ok(attempts.get(key));
        if (!value.profile.version) return fail('PROFILE_CONFIRMATION_REQUIRED');
        const now = new Date().toISOString();
        value.messages.push({ id: value.messages.length + 1, role: 'USER', text: String(data.text), createdAt: now });
        const run: Run = { runId: id(), status: 'SUCCEEDED', deadline: new Date(Date.now() + 60000).toISOString(), errorCode: null,
          result: JSON.stringify(data.intent === 'GENERATE' ? { type: 'PLAN', plan: demoPlan(value.profile) } : { type: 'QUESTIONS', questions: ['CONFIRM_PROFILE'] }) };
        value.runs.push(run); const accepted = { runId: run.runId, status: run.status, deadline: run.deadline }; attempts.set(key, accepted); return ok(accepted);
      }
      if (parts[3] === 'runs') { const run = value.runs.find(run => run.runId === parts[4]); return run ? ok(run) : fail('NOT_FOUND'); }
      if (parts[3] === 'plans') {
        const key = `${path}:${data.requestKey}`; if (attempts.has(key)) return ok(attempts.get(key));
        const run = value.runs.find(run => run.runId === data.runId); const plan = run?.result ? JSON.parse(run.result).plan as Plan | undefined : undefined;
        if (!plan || plan.profileVersion !== value.profile.version) return fail('SUCCESSFUL_PLAN_REQUIRED');
        const saved = { planId: id(), version: 1 }; plans.set(saved.planId, structuredClone({ snapshot: { profile: value.profile, plan }, revalidationWarnings: [] })); attempts.set(key, saved); return ok(saved);
      }
    }
    if (path === '/plans') return ok([...plans.keys()].map(planId => ({ planId, version: 1 })));
    if (parts[1] === 'plans') {
      const saved = plans.get(parts[2]!); if (!saved) return fail('NOT_FOUND');
      if (parts.length === 3) { if (options.method === 'DELETE') { plans.delete(parts[2]!); return ok(undefined); } return ok(saved); }
      const programmeId = Number(new URLSearchParams(path.split('?')[1]).get('programmeId') ?? data.programmeId);
      const programme = saved.snapshot.plan.programmes.find(item => item.programmeId === programmeId); if (!programme) return fail('INVALID_PLAN_REQUEST');
      const fingerprint = programmeId.toString(16).padStart(64, '0');
      if (parts[3]?.startsWith('consultation-preview')) return ok({ programmeId, fingerprint, summary: `模拟交接 · 不提交咨询\n${programme.universityNameZh} · ${programme.programmeNameZh}\n目标：${saved.snapshot.profile.facts.targetLevel}；入学：${saved.snapshot.profile.facts.intake}；预算：${saved.snapshot.profile.facts.budgetCurrency} ${saved.snapshot.profile.facts.budget}\n来源与费用均为虚构，仅在本页演示。` });
      if (parts[3] === 'consultations') {
        if (data.previewFingerprint !== fingerprint) return fail('CONSULTATION_PREVIEW_CHANGED');
        const key = `${path}:${data.requestKey}`; if (attempts.has(key)) return ok(attempts.get(key));
        const receipt = { referenceCode: id(), submittedAt: new Date().toISOString() }; attempts.set(key, receipt); return ok(receipt);
      }
    }
    return fail('NOT_FOUND');
  });
  return { api, session, storage, async reset() { await session.logout(); sessions.clear(); plans.clear(); memory.clear(); attempts.clear(); } };
}
