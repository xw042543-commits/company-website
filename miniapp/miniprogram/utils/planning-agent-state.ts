import type { Plan, Programme } from '../services/planning-agent';
export type AgentViewState = 'idle' | 'sending' | 'polling' | 'ready' | 'failed';
const academicScaleAliases: Record<string, string> = { PERCENT: '100', GPA4: '4', GPA5: '5', GPA10: '10' };
/** Label aliases only: never convert a score or equate a language exam with its maximum. */
export function canonicalAcademicScale(field: string, value: string): string {
  return ['grade.scale', 'math.scale', 'science.scale'].includes(field) ? academicScaleAliases[value] ?? value : value;
}
export function canSave(state: AgentViewState, confirmed: boolean): boolean { return state === 'ready' && confirmed; }
export function createRequestAttempt(createKey: () => string) {
  let previous = ''; let requestKey = '';
  return { key(payload: string) { if (!requestKey || previous !== payload) { previous = payload; requestKey = createKey(); } return requestKey; },
    clear() { previous = ''; requestKey = ''; } };
}
export function createRunPoller<T>(deps: { now: () => number; schedule: (fn: () => void, delay: number) => number;
  cancel: (id: number) => void; read: () => Promise<T>; receive: (value: T) => boolean; expired: () => void }) {
  let timer: number | null = null; let generation = 0;
  const stop = () => { generation++; if (timer !== null) deps.cancel(timer); timer = null; };
  return { stop, start(deadline: number) {
    stop(); const epoch = generation; let delay = 2000;
    const next = () => {
      if (epoch !== generation) return;
      const remaining = deadline - deps.now();
      if (!Number.isFinite(remaining) || remaining <= 0) { stop(); deps.expired(); return; }
      timer = deps.schedule(() => {
        if (epoch !== generation) return;
        if (deps.now() >= deadline) { stop(); deps.expired(); return; }
        void deps.read().then(value => {
          if (epoch !== generation) return;
          if (deps.receive(value)) { delay = Math.min(5000, delay + 1000); next(); } else stop();
        });
      }, Math.min(delay, remaining));
    }; next();
  } };
}
export type Recovery = 'retry' | 'login' | 'profile' | 'new-session' | 'later' | 'refresh';
export function describeError(code: string): { text: string; action: Recovery; label: string } {
  if (['AUTH_REQUIRED', 'AUTHENTICATION_REQUIRED'].includes(code)) return { text: '登录已失效，请重新登录后继续。', action: 'login', label: '重新登录' };
  if (['STRUCTURED_INPUT_REQUIRED', 'INVALID_PROFILE', 'PROFILE_CONFIRMATION_REQUIRED', 'MODEL_INPUT_TOO_LARGE'].includes(code)) return { text: '请通过背景表单补充学历、成绩、语言与预算。个人叙述不能发送给 AI。', action: 'profile', label: '补充背景' };
  if (code === 'PRIVACY_CONSENT_REQUIRED') return { text: '隐私说明已更新，请阅读并确认后开始新对话。', action: 'new-session', label: '重新确认' };
  if (['MESSAGE_RATE_LIMIT', 'GENERATION_DAILY_LIMIT', 'GLOBAL_BUDGET_EXHAUSTED', 'MODEL_CALL_LIMIT', 'RATE_LIMITED'].includes(code)) return { text: '当前请求额度已用完，请稍后再试，或直接咨询顾问。', action: 'later', label: '查询专业' };
  if (['PROFILE_VERSION_CONFLICT', 'RUN_ACTIVE', 'SUCCESSFUL_PLAN_REQUIRED', 'IDEMPOTENCY_CONFLICT', 'RUN_NOT_ACTIVE'].includes(code)) return { text: '对话状态已变化，请重新读取后继续。', action: 'refresh', label: '更新状态' };
  if (['NOT_FOUND', 'AGE_RESTRICTED'].includes(code)) return { text: code === 'AGE_RESTRICTED' ? '此功能仅面向年满 14 周岁的用户。' : '对话或方案已不存在，请返回列表或开始新对话。', action: 'new-session', label: '返回开始' };
  if (['PLANNING_DISABLED', 'RUNNER_UNAVAILABLE', 'SERVICE_UNAVAILABLE'].includes(code)) return { text: 'AI 规划暂不可用，你仍可查询专业或咨询顾问。', action: 'later', label: '查询专业' };
  if (code === 'DEADLINE_EXCEEDED') return { text: '本次等待已结束。可查询最终状态，或稍后开始新的生成。', action: 'refresh', label: '查询最终状态' };
  return { text: '暂时未能完成操作，请检查网络后重试。尚未确认成功的操作不会显示为成功。', action: 'retry', label: '重试' };
}
export const fieldLabels: Record<string, string> = { targetLevel: '目标学历', education: '当前学历', qualification: '学历资格', curriculum: '课程体系', institution: '毕业院校', major: '专业', degreeAwarded: '学位授予', graduationStatus: '毕业状态', grade: '成绩', languageTest: '语言考试', languageTotal: '语言总分', languageListening: '听力', languageReading: '阅读', languageWriting: '写作', languageSpeaking: '口语', math: '数学', science: '科学', budget: '预算', intake: '入学时间', subject: '专业方向', city: '城市', researchPlanReady: '研究计划', transferCredits: '转学分', crossMajor: '跨专业', studyMode: '学习模式' };
export const questionLabels: Record<string, string> = { CONFIRM_PROFILE: '请核对并确认背景。', TARGET_LEVEL: '你计划申请哪个学历层次？', INTAKE: '计划什么时候入学？', EDUCATION: '请补充目前学历和成绩。', LANGUAGE: '请补充语言考试和成绩。', BUDGET: '请补充预算金额、币种与范围。' };
export const stepLabels: Record<string, string> = { PREPARE_DOCUMENTS: '准备学历、成绩等申请材料。', PREPARE_LANGUAGE: '准备语言考试与成绩证明。', CONFIRM_WITH_UNIVERSITY: '向院校核实最新招生条件和费用。' };
const missingLabel = (key: string) => ({ TUITION: '学费', TAX: '税费', LIVING: '生活费' }[key] ?? '费用范围或依据待核实');
export function safeSourceUrl(value: string): string {
  return /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:[/?#][^\s\\<>]*)?$/i.test(value) && !/%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value) ? value : '';
}
export function validPlan(value: unknown): value is Plan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Plan;
  return Number.isSafeInteger(plan.profileVersion) && plan.profileVersion > 0 && Array.isArray(plan.programmes) && plan.programmes.length <= 5
    && Array.isArray(plan.generalNextSteps) && plan.generalNextSteps.every(s => typeof s === 'string' && s in stepLabels)
    && plan.programmes.every(p => Number.isSafeInteger(p.programmeId) && ['ELIGIBLE', 'NOT_MET', 'UNKNOWN'].includes(p.classification)
      && [p.programmeNameZh, p.programmeNameEn, p.universityNameZh, p.universityNameEn].every(n => n === null || typeof n === 'string')
      && !!p.assessment && Array.isArray(p.assessment.alternatives) && p.assessment.alternatives.every(a => Array.isArray(a) && a.every(f => typeof f.field === 'string' && ['MET', 'NOT_MET', 'PROFILE_MISSING', 'EVIDENCE_MISSING'].includes(f.status)))
      && !!p.budget && !!p.budget.subtotals && Object.values(p.budget.subtotals).every(n => typeof n === 'number' && Number.isFinite(n)) && Array.isArray(p.budget.missing)
      && Array.isArray(p.evidenceSnapshot) && p.evidenceSnapshot.every(e => typeof e.sourceUrl === 'string' && typeof e.checkedAt === 'string' && (e.expiresAt === null || typeof e.expiresAt === 'string')));
}
export function parseReply(value: string | null): { type: string; questions: string[]; plan: Plan | null } | null {
  try { const data = JSON.parse(value ?? '') as { type: string; questions: string[]; plan: unknown };
    if (data.type === 'PLAN' && validPlan(data.plan)) return { type: 'PLAN', questions: [], plan: data.plan };
    if (data.type === 'QUESTIONS' && Array.isArray(data.questions) && data.questions.every(q => q in questionLabels)) return { type: 'QUESTIONS', questions: data.questions.map(q => questionLabels[q]!), plan: null };
  } catch { /* Malformed persisted output is never rendered as a successful plan. */ } return null;
}
export function programmeCards(plan: Plan) {
  return plan.programmes.map((p: Programme) => {
    const findings = p.assessment.alternatives.flat();
    const fields = (status: string) => [...new Set(findings.filter(f => f.status === status).map(f => fieldLabels[f.field] ?? f.field))].join('、');
    return { id: p.programmeId, title: p.programmeNameZh || p.programmeNameEn || '专业名称待核实', university: p.universityNameZh || p.universityNameEn || '院校名称待核实',
      classification: p.classification, recommended: p.classification === 'ELIGIBLE',
      imageUrl: typeof p.imageUrl === 'string' ? safeSourceUrl(p.imageUrl) : '', imageFailed: false,
      statusText: p.classification === 'ELIGIBLE' ? '已核验条件符合 · 不代表录取' : p.classification === 'NOT_MET' ? '存在不符合条件 · 不作为推荐' : '招生要求待核实',
      fees: Object.entries(p.budget.subtotals).map(([currency, amount]) => `${currency} ${amount}`).join(' · ') || '费用信息待核实',
      feeNote: p.budget.complete ? '已记录范围内的费用汇总，不代表最终总价' : '费用不完整，不能据此判断可负担性',
      missingFees: p.budget.missing.map(missingLabel).join('、'), profileMissing: fields('PROFILE_MISSING'), evidenceMissing: fields('EVIDENCE_MISSING'), notMet: fields('NOT_MET'),
      alternatives: p.assessment.alternatives.map((branch, index) => ({ label: `条件路径 ${index + 1}`, conditions: branch.map(f => {
        const status = { MET: '符合', NOT_MET: '不符合', PROFILE_MISSING: '背景待补充', EVIDENCE_MISSING: '依据待核实' }[f.status];
        const snapshot = p.ruleSnapshot as { alternatives?: Array<Array<{ field: string; operator: string; expected: string; scale: string | null; evidenceId: number }>> } | null;
        const rule = Array.isArray(snapshot?.alternatives?.[index]) ? snapshot.alternatives[index]!.find(r => r.field === f.field && r.evidenceId === f.evidenceId) : undefined;
        const requirement = f.status !== 'EVIDENCE_MISSING' && rule && ['EQ', 'GTE'].includes(rule.operator) && typeof rule.expected === 'string'
          ? ` · 要求${rule.operator === 'GTE' ? '至少' : '为'} ${rule.expected}${rule.scale ? `（${rule.scale}）` : ''}` : '';
        return `${fieldLabels[f.field] ?? f.field}：${status}${requirement}`;
      }) })),
      evidence: p.evidenceSnapshot.map(e => ({ ...e, safeUrl: safeSourceUrl(e.sourceUrl), checkedDate: e.checkedAt.slice(0, 10), expiresDate: e.expiresAt?.slice(0, 10) || '未注明' })), expanded: false,
    };
  });
}
export function warningText(code: string): string {
  if (code.startsWith('PROGRAMME_UNAVAILABLE:')) return '部分专业已不可用，请重新查询。';
  if (code.startsWith('EVIDENCE_REVIEW_REQUIRED:')) return '部分依据需要重新核验。';
  if (code === 'GENERATION_SOURCES_UNVERIFIED') return '生成时的来源无法完整核验，请向院校确认。';
  if (code === 'SOURCE_DATA_CHANGED') return '来源数据已变化，此处保留保存时的内容。';
  return '此方案需要重新核实。';
}
