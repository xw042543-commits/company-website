import { planningAgent, validAgentId, type Plan, type Run, type Intent, type ConsultationPreview } from '../../services/planning-agent';
import type { ConsultationDraft } from '../../services/consultations';
import { sessionStore } from '../../stores/session';
import { canSave, canonicalAcademicScale, createRequestAttempt, createRunPoller, describeError, parseReply, programmeCards, safeSourceUrl, stepLabels, validPlan, warningText, type AgentViewState } from '../../utils/planning-agent-state';

const levels = ['FOUNDATION', 'BACHELOR', 'MASTER', 'DOCTOR'];
const levelNames = ['预科', '本科', '硕士', '博士'];
interface Field { key: string; label: string; value: string; options: string[]; labels: string[]; display: string; numeric: boolean }
const selectField = (key: string, label: string, options: string[], labels = options): Field => ({ key, label, value: '', options: ['', ...options], labels: ['未提供', ...labels], display: '未提供', numeric: false });
const textField = (key: string, label: string, numeric = false): Field => ({ key, label, value: '', options: [], labels: [], display: '', numeric });
export function profileFields(): Field[] { return [
  selectField('targetLevel', '目标学历', levels, levelNames), textField('intake', '入学时间（例如 2027 或 2027-09）'),
  selectField('education', '当前学历', ['HIGH_SCHOOL', 'FOUNDATION', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTOR'], ['高中', '预科', '大专', '本科', '硕士', '博士']),
  selectField('qualification', '学历资格', ['HIGH_SCHOOL', 'FOUNDATION', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTOR', 'STPM', 'A_LEVEL', 'UEC', 'IB'], ['高中', '预科', '大专', '本科', '硕士', '博士', 'STPM', 'A Level', 'UEC', 'IB']),
  selectField('graduationStatus', '毕业状态', ['GRADUATED', 'CURRENT', 'EXPECTED'], ['已毕业', '在读', '预计毕业']),
  textField('grade', '平均成绩', true), selectField('grade.scale', '成绩计分制', ['100', '4', '5', '10'], ['百分制', '4 分制', '5 分制', '10 分制']),
  selectField('languageTest', '语言考试', ['NONE', 'IELTS', 'TOEFL', 'PTE', 'MUET'], ['尚未考试', 'IELTS', 'TOEFL', 'PTE', 'MUET']), textField('languageTotal', '语言总分', true),
  textField('subject', '专业方向（仅用于目录查询）'), textField('city', '意向城市（可选）'),
  textField('budget', '预算金额', true), selectField('budgetCurrency', '预算币种', ['MYR', 'CNY', 'USD', 'GBP', 'EUR', 'SGD']),
  selectField('budgetPeriod', '预算范围', ['YEAR', 'SEMESTER', 'TOTAL'], ['每年', '每学期', '全程']),
  selectField('budgetIncludesLiving', '预算是否含生活费', ['true', 'false'], ['包含', '不包含']),
  selectField('studyMode', '学习模式', ['FULL_TIME', 'PART_TIME', 'COURSEWORK', 'RESEARCH', 'MIXED'], ['全日制', '非全日制', '授课型', '研究型', '混合型']),
  ...['Listening', 'Reading', 'Writing', 'Speaking'].map((skill, i) => textField(`language${skill}`, `语言${['听力', '阅读', '写作', '口语'][i]}成绩`, true)),
  textField('math', '数学成绩', true), selectField('math.scale', '数学计分制', ['100', '4', '5', '10'], ['百分制', '4 分制', '5 分制', '10 分制']),
  textField('science', '科学成绩', true), selectField('science.scale', '科学计分制', ['100', '4', '5', '10'], ['百分制', '4 分制', '5 分制', '10 分制']),
  selectField('curriculum', '课程体系', ['A_LEVEL', 'IB', 'STPM', 'UEC', 'GAOKAO', 'AP']),
  selectField('degreeAwarded', '是否已获学位', ['true', 'false'], ['是', '否']),
  selectField('researchPlanReady', '是否已备研究计划', ['true', 'false'], ['是', '否']),
  selectField('crossMajor', '是否跨专业', ['true', 'false'], ['是', '否']), textField('transferCredits', '转学分数量', true),
]; }
export const profileSteps = [
  { title: '你计划读什么，什么时候出发？', hint: '先确定学历和入学时间，其他背景可以慢慢补充。', keys: ['targetLevel', 'intake'], label: '目标与时间' },
  { title: '目前读到哪个阶段了？', hint: '还不确定的项目可以先留空。', keys: ['education', 'qualification'], label: '学历背景' },
  { title: '方便说说你的成绩吗？', hint: '分数和计分制放在一起，才能准确核对条件。', keys: ['grade', 'grade.scale'], label: '学业成绩' },
  { title: '语言准备得怎么样？', hint: '还没考试也没关系，选择“尚未考试”即可。', keys: ['languageTest', 'languageTotal'], label: '语言情况' },
  { title: '你想把预算控制在多少？', hint: '保留原币金额，不会自动换算或替你判断是否够用。', keys: ['budget', 'budgetCurrency'], label: '预算金额' },
  { title: '这笔预算覆盖哪些费用？', hint: '时间范围和生活费会影响费用比较。', keys: ['budgetPeriod', 'budgetIncludesLiving'], label: '预算范围' },
  { title: '有感兴趣的方向或城市吗？', hint: '用于查询目录，不需要填写个人经历。', keys: ['subject', 'city'], label: '方向与城市' },
  { title: '再补充一下目前的学习状态。', hint: '按需要填写，暂时不清楚可以留空。', keys: ['graduationStatus', 'studyMode'], label: '毕业与学习模式' },
  { title: '语言听力和阅读分别是多少？', hint: '请填写已选择考试对应的单项分数。', keys: ['languageListening', 'languageReading'], label: '听力与阅读' },
  { title: '写作和口语分别是多少？', hint: '没有成绩时留空，结果会标记待补充。', keys: ['languageWriting', 'languageSpeaking'], label: '写作与口语' },
  { title: '补充数学成绩与计分制。', hint: '只有相关专业需要时再填写。', keys: ['math', 'math.scale'], label: '数学成绩' },
  { title: '补充科学成绩与计分制。', hint: '只有相关专业需要时再填写。', keys: ['science', 'science.scale'], label: '科学成绩' },
  { title: '你的课程体系和学位情况是？', hint: '按实际情况选择，不确定可以保留为空。', keys: ['curriculum', 'degreeAwarded'], label: '课程与学位' },
  { title: '研究方向有准备了吗？', hint: '这里只确认研究计划和跨专业情况，不填写个人叙述。', keys: ['researchPlanReady', 'crossMajor'], label: '研究与跨专业' },
  { title: '需要转学分吗？', hint: '如有已确认的可转学分，在这里填写数量。', keys: ['transferCredits'], label: '转学分' },
];
const coreStepCount = 7;
type NativePage = WechatMiniprogram.Page.TrivialInstance;
interface Deps {
  api: typeof planningAgent; session: typeof sessionStore; now: () => number; createKey: () => string;
  storage: { get: (key: string) => string; set: (key: string, value: string) => void; remove: (key: string) => void };
  schedule: (fn: () => void, delay: number) => number; cancel: (id: number) => void; navigate: (url: string) => void;
}
const defaults: Deps = { api: planningAgent, session: sessionStore, now: Date.now,
  createKey: () => `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  storage: { get: key => String(wx.getStorageSync(key) || ''), set: (key, value) => wx.setStorageSync(key, value), remove: key => wx.removeStorageSync(key) },
  schedule: (fn, delay) => setTimeout(fn, delay) as unknown as number, cancel: id => clearTimeout(id), navigate: url => wx.navigateTo({ url }) };
export function createPlanningAgentPage(overrides: Partial<Deps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...defaults, ...overrides };
  const runtimes = new WeakMap<NativePage, { active: boolean; epoch: number; owner: number | null; storageKey: string; routePlan: string;
    lastAction: string; pendingIntent: Intent; pendingText: string; attempt: ReturnType<typeof createRequestAttempt>; saveAttempt: ReturnType<typeof createRequestAttempt>;
    shareAttempt: ReturnType<typeof createRequestAttempt>; poller: ReturnType<typeof createRunPoller> }>();
  const runtime = (page: NativePage) => runtimes.get(page)!;
  const alive = (page: NativePage, epoch: number) => runtime(page).active && runtime(page).epoch === epoch;
  const fail = (page: NativePage, code: string) => {
    if (['AUTH_REQUIRED', 'AUTHENTICATION_REQUIRED'].includes(code)) { runtime(page).epoch++; resetIdentity(page); }
    if (['CONSULTATION_PREVIEW_REQUIRED', 'CONSULTATION_PREVIEW_CHANGED'].includes(code)) page.setData({ sharePreview: null, shareConsent: false });
    page.setData({ state: 'failed', busy: false, loading: false, error: describeError(code) });
    if (code === 'STRUCTURED_INPUT_REQUIRED') page.openBackgroundForText(runtime(page).pendingText);
  };
  const initialData = () => ({ state: 'idle' as AgentViewState, loading: true, available: false, privacyVersion: '', sessionId: '', runId: '', savedPlanId: '',
      profileVersion: 0, confirmedFacts: {} as Record<string, string>, backgroundSummary: '先确认你的学习背景', fields: profileFields(), formOpen: false,
      profileStep: 0, profileReview: false, stepTitle: '', stepHint: '', stepFields: [] as Field[], summaryRows: [] as Array<{ label: string; value: string }>,
      moreGroups: profileSteps.map((step, index) => ({ label: step.label, step: index })), moreOpen: false, consentOpen: false, menuOpen: false, saveOpen: false,
      ageBand: '', ageLabels: ['请选择年龄段', '14–17 周岁', '18 周岁及以上'], ageIndex: 0, privacyConsent: false, profileConsent: false,
      saveConsent: false, shareConsent: false, busy: false, error: null, notice: '', input: '', messages: [] as Array<{ id: number; text: string }>,
      questions: [] as string[], plan: null as Plan | null, cards: [] as ReturnType<typeof programmeCards>, steps: [] as string[], warnings: [] as string[],
      isSnapshot: false, shareOpen: false, consultationDetails: false, receipt: '', keyboardHeight: 0,
      shareProgrammeIndex: 0, selectedProgrammeId: 0, sharePreview: null as ConsultationPreview | null,
      consultation: { name: '', contact: '', intendedSchool: '', intendedCourse: '', qualification: '', notes: '', privacyConsent: false } as ConsultationDraft,
      qualificationLabels: ['未选择', '预科', '本科', '硕士', '博士'], qualificationIndex: 0,
    });
  const resetIdentity = (page: NativePage) => {
    const state = runtime(page);
    state.poller.stop(); state.owner = null; state.storageKey = ''; state.routePlan = '';
    state.lastAction = 'load'; state.pendingIntent = 'CHAT'; state.pendingText = '';
    state.attempt.clear(); state.saveAttempt.clear(); state.shareAttempt.clear();
    // Reset the whole view, including derived steps/summaries and every consent/draft.
    // The caller invalidates prior async work; retain its current epoch/active flag.
    page.setData(initialData()); page.syncProfileStep();
  };
  return {
    data: initialData(),
    onLoad(options: Record<string, string | undefined> = {}) {
      const poller = createRunPoller({ now: deps.now, schedule: deps.schedule, cancel: deps.cancel,
        read: () => deps.api.getRun(this.data.sessionId, this.data.runId),
        receive: result => { if (!result.ok) { fail(this, result.error.code); return false; } return this.applyRun(result.value); },
        expired: () => fail(this, 'DEADLINE_EXCEEDED') });
      runtimes.set(this, { active: true, epoch: 0, owner: null, storageKey: '', routePlan: validAgentId(options.planId ?? '') ? options.planId! : '',
        lastAction: 'load', pendingIntent: 'CHAT', pendingText: '', attempt: createRequestAttempt(deps.createKey), saveAttempt: createRequestAttempt(deps.createKey), shareAttempt: createRequestAttempt(deps.createKey), poller });
      this.syncProfileStep();
    },
    onShow() { runtime(this).active = true; void this.load(); },
    onHide() { const state = runtime(this); state.active = false; state.epoch++; state.poller.stop(); this.setData({ keyboardHeight: 0 }); },
    onUnload() { const state = runtime(this); state.active = false; state.epoch++; state.poller.stop(); },
    async load() {
      const state = runtime(this); state.poller.stop(); const epoch = ++state.epoch; state.lastAction = 'load';
      this.setData({ loading: true, error: null, busy: false });
      const auth = await deps.session.ensureAuthenticated(); if (!alive(this, epoch)) return;
      if (!auth.ok) { resetIdentity(this); this.setData({ loading: false }); fail(this, auth.error.code); return; }
      if (state.owner !== null && state.owner !== auth.value.id) {
        resetIdentity(this);
      }
      state.owner = auth.value.id; state.storageKey = `udajo.planning-agent.session.${auth.value.id}`;
      const capability = await deps.api.capability(); if (!alive(this, epoch)) return;
      if (!capability.ok && ['AUTH_REQUIRED', 'AUTHENTICATION_REQUIRED'].includes(capability.error.code)) { fail(this, capability.error.code); return; }
      this.setData({ loading: false, available: capability.ok && capability.value.enabled && capability.value.available,
        privacyVersion: capability.ok ? capability.value.privacyVersion ?? '' : '' });
      // Saved snapshots remain accessible even when generation is unavailable.
      if (state.routePlan) { await this.loadSaved(state.routePlan); return; }
      if (!capability.ok) { fail(this, capability.error.code); return; }
      if (!this.data.available) { this.setData({ state: 'idle' }); return; }
      const sessionId = this.data.sessionId || deps.storage.get(state.storageKey);
      if (!validAgentId(sessionId)) { this.setData({ state: 'idle' }); return; }
      const result = await deps.api.getSession(sessionId); if (!alive(this, epoch)) return;
      if (!result.ok) { if (result.error.code === 'NOT_FOUND') deps.storage.remove(state.storageKey); fail(this, result.error.code); return; }
      const session = result.value;
      this.setData({ sessionId, profileVersion: session.profile.version, confirmedFacts: session.profile.facts,
        messages: session.messages.filter(m => m.role === 'USER').map(m => ({ id: m.id, text: m.text })), isSnapshot: false, state: 'idle', plan: null, cards: [], questions: [] });
      this.showProfile(session.profile.facts);
      const latest = session.runs[session.runs.length - 1];
      if (latest) { this.setData({ runId: latest.runId }); if (this.applyRun(latest)) state.poller.start(Date.parse(latest.deadline)); }
    },
    showProfile(facts: Record<string, string>) {
      const fields = profileFields().map(f => { const value = canonicalAcademicScale(f.key, facts[f.key] ?? ''); return { ...f, value, display: f.options.length ? f.labels[f.options.indexOf(value)] ?? '未提供' : value }; });
      const level = levelNames[levels.indexOf(facts.targetLevel ?? '')] ?? '学历待补充';
      this.setData({ fields, backgroundSummary: `${level}${facts.subject ? ` · ${facts.subject}` : ''}${facts.intake ? ` · ${facts.intake} 入学` : ''}` });
      this.syncProfileStep();
    },
    async start() {
      if (this.data.busy || !this.data.available) return;
      if (!this.data.ageBand || !this.data.privacyConsent || !this.data.privacyVersion) { this.setData({ notice: '请先选择年龄段，并阅读同意本次 AI 规划说明。' }); return; }
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'start'; this.setData({ busy: true, notice: '', error: null });
      const result = await deps.api.createSession(this.data.ageBand, this.data.privacyVersion);
      if (!alive(this, epoch)) return;
      this.setData({ busy: false }); if (!result.ok) { fail(this, result.error.code); return; }
      deps.storage.set(state.storageKey, result.value.id);
      this.setData({ sessionId: result.value.id, state: 'idle', formOpen: true, profileStep: 0, profileReview: false, consentOpen: false, profileVersion: 0, fields: profileFields(), confirmedFacts: {}, messages: [], cards: [], plan: null, savedPlanId: '' }); this.syncProfileStep();
    },
    ageChanged(event: WechatMiniprogram.PickerChange) { const index = Number(event.detail.value); this.setData({ ageIndex: index, ageBand: ['', 'AGE_14_17', 'AGE_18_PLUS'][index] ?? '' }); },
    consentChanged(event: WechatMiniprogram.CheckboxGroupChange) {
      const field = event.currentTarget.dataset.field;
      if (['privacyConsent', 'profileConsent', 'saveConsent', 'shareConsent'].includes(field)) this.setData({ [field]: event.detail.value.length > 0 });
    },
    beginPlanning() { if (this.data.sessionId) this.editProfile(); else this.setData({ consentOpen: true, menuOpen: false }); },
    closeConsent() { if (!this.data.busy) this.setData({ consentOpen: false }); },
    toggleMenu() { this.setData({ menuOpen: !this.data.menuOpen }); },
    editProfile() { if (this.data.busy || this.data.state === 'polling' || this.data.state === 'sending' || this.data.isSnapshot) return; this.setData({ formOpen: true, profileStep: 0, profileReview: false, profileConsent: false, moreOpen: false, error: null, notice: '' }); this.syncProfileStep(); },
    closeProfile() { if (!this.data.busy) this.setData({ formOpen: false }); },
    syncProfileStep() {
      const step = profileSteps[this.data.profileStep] ?? profileSteps[0]!;
      const fields = this.data.fields as Field[];
      this.setData({ stepTitle: step.title, stepHint: step.hint, stepFields: step.keys.map(key => fields.find(field => field.key === key)!).filter(Boolean)
        .map(field => ({ ...field, choices: field.options.map((value, index) => ({ value, label: field.labels[index] })) })),
        summaryRows: fields.filter(field => field.value.trim()).map(field => ({ label: field.label, value: field.options.length ? field.display : field.value })) });
    },
    chooseField(event: WechatMiniprogram.BaseEvent) {
      if (this.data.busy) return; const { key, value } = event.currentTarget.dataset;
      const fields = (this.data.fields as Field[]).map(field => field.key === key && field.options.includes(value)
        ? { ...field, value, display: field.labels[field.options.indexOf(value)] ?? '未提供' } : field);
      this.setData({ fields, profileConsent: false, notice: '' }); this.syncProfileStep();
    },
    nextProfileStep() {
      if (this.data.busy) return;
      const fields = this.data.fields as Field[]; const value = (key: string) => fields.find(field => field.key === key)?.value.trim() ?? '';
      if (this.data.profileStep === 0 && (!value('targetLevel') || !/^20\d{2}(?:[-/](?:0?[1-9]|1[0-2]))?$/.test(value('intake')))) { this.setData({ notice: '先选一个目标学历，再填写入学年份或年月。' }); return; }
      if (this.data.profileStep >= coreStepCount - 1) { this.reviewProfile(); return; }
      this.setData({ profileStep: this.data.profileStep + 1, notice: '' }); this.syncProfileStep();
    },
    previousProfileStep() { if (this.data.busy) return; this.setData({ profileReview: false, profileStep: Math.max(0, this.data.profileStep - 1), notice: '' }); this.syncProfileStep(); },
    reviewProfile() { this.setData({ profileReview: true, moreOpen: false, profileConsent: false, notice: '' }); this.syncProfileStep(); },
    toggleMoreBackground() { this.setData({ moreOpen: !this.data.moreOpen }); },
    openProfileGroup(event: WechatMiniprogram.BaseEvent) {
      const step = Number(event.currentTarget.dataset.step); if (!Number.isInteger(step) || step < 0 || step >= profileSteps.length) return;
      this.setData({ profileStep: step, profileReview: false, moreOpen: false, formOpen: true, notice: '' }); this.syncProfileStep();
    },
    openBackgroundForText(text: string) {
      // Navigation hints only. No facts are inferred or claimed to have been understood.
      const profileStep = /预算|费用|钱/.test(text) ? 4 : /语言|雅思|托福|英语/.test(text) ? 3 : /成绩|绩点|分数/.test(text) ? 2 : /专业|城市|方向/.test(text) ? 6 : 0;
      this.setData({ formOpen: true, profileReview: false, profileStep, profileConsent: false, notice: '这段文字还没有转成背景信息。请在下面确认相关项目。' }); this.syncProfileStep();
    },
    fieldChanged(event: WechatMiniprogram.Input | WechatMiniprogram.PickerChange) {
      if (this.data.busy) return;
      const key = event.currentTarget.dataset.key; const fields = (this.data.fields as Field[]).map(field => {
        if (field.key !== key) return field;
        const value = field.options.length ? field.options[Number(event.detail.value)] ?? '' : String(event.detail.value);
        return { ...field, value, display: field.options.length ? field.labels[field.options.indexOf(value)] ?? '未提供' : value };
      }); this.setData({ fields, profileConsent: false }); this.syncProfileStep();
    },
    async confirmProfile() {
      if (this.data.busy || this.data.state === 'polling') return;
      if (!this.data.profileConsent) { this.setData({ notice: '请核对背景并勾选确认。' }); return; }
      const fields = this.data.fields as Field[]; const facts: Record<string, string> = {};
      for (const f of fields) { const value = f.value.trim(); if (!value) continue;
        if (value.length > 500 || (f.numeric && !/^\d{1,9}(\.\d{1,4})?$/.test(value))) { this.setData({ notice: `请检查${f.label}的格式。` }); return; } facts[f.key] = value; }
      if (!facts.targetLevel || !/^20\d{2}(?:[-/](?:0?[1-9]|1[0-2]))?$/.test(facts.intake ?? '')) { this.setData({ notice: '请选择目标学历，填写入学年份或年月。' }); return; }
      if (facts.grade && !facts['grade.scale']) { this.setData({ notice: '请为成绩选择计分制。' }); return; }
      for (const key of ['languageTotal', 'languageListening', 'languageReading', 'languageWriting', 'languageSpeaking']) {
        if (facts[key]) { if (!facts.languageTest || facts.languageTest === 'NONE') { this.setData({ notice: '请为语言成绩选择考试类型。' }); return; } facts[`${key}.scale`] = facts.languageTest; }
      }
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'confirmProfile'; this.setData({ busy: true, notice: '', error: null });
      const result = await deps.api.confirmProfile(this.data.sessionId, { version: this.data.profileVersion, facts }); if (!alive(this, epoch)) return;
      this.setData({ busy: false }); if (!result.ok) { fail(this, result.error.code); return; }
      state.attempt.clear(); state.saveAttempt.clear(); this.showProfile(facts);
      this.setData({ profileVersion: result.value.confirmedVersion, confirmedFacts: facts, formOpen: false, plan: null, cards: [], savedPlanId: '', state: 'idle', notice: '背景已确认，可以生成方案。', saveConsent: false });
    },
    inputChanged(event: WechatMiniprogram.Input) { this.setData({ input: event.detail.value }); },
    keyboardChanged(event: WechatMiniprogram.InputKeyboardHeightChange) { this.setData({ keyboardHeight: Math.max(0, event.detail.height) }); },
    keyboardBlur() { this.setData({ keyboardHeight: 0 }); },
    send() { if (!this.data.sessionId) { this.beginPlanning(); return; } return this.submitMessage('CHAT', this.data.input.trim()); },
    generate() { if (!this.data.profileVersion) { this.beginPlanning(); return; } return this.submitMessage('GENERATE', '生成方案'); },
    async submitMessage(intent: Intent, text: string) {
      if (!text || !this.data.available || !this.data.sessionId || this.data.busy || ['sending', 'polling'].includes(this.data.state)) return;
      if (intent === 'GENERATE' && !this.data.profileVersion) { this.editProfile(); return; }
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'message'; state.pendingIntent = intent; state.pendingText = text;
      const requestKey = state.attempt.key(`${this.data.sessionId}:${intent}:${text}`);
      this.setData({ state: 'sending', error: null, notice: '', plan: null, cards: [], savedPlanId: '', saveConsent: false, questions: [] });
      const result = await deps.api.sendMessage(this.data.sessionId, text, intent, requestKey); if (!alive(this, epoch)) return;
      if (!result.ok) { fail(this, result.error.code); return; }
      this.setData({ runId: result.value.runId, input: '', state: 'polling' });
      // Reload authoritative messages/results, including idempotent retries that already finished.
      await this.load();
    },
    applyRun(run: Run): boolean {
      if (['QUEUED', 'RUNNING'].includes(run.status)) { this.setData({ state: 'polling', error: null, runId: run.runId }); return true; }
      runtime(this).attempt.clear();
      if (run.status !== 'SUCCEEDED') { fail(this, run.errorCode || 'DEADLINE_EXCEEDED'); return false; }
      const reply = parseReply(run.result); if (!reply) { fail(this, 'INVALID_RESPONSE'); return false; }
      if (reply.plan && reply.plan.profileVersion !== this.data.profileVersion) { this.setData({ state: 'idle', notice: '背景已更新，请按新背景重新生成方案。', plan: null, cards: [] }); return false; }
      this.setData({ state: reply.plan ? 'ready' : 'idle', plan: reply.plan, cards: reply.plan ? programmeCards(reply.plan) : [], questions: reply.questions,
        steps: reply.plan?.generalNextSteps.map(s => stepLabels[s]) ?? [], error: null, runId: run.runId }); return false;
    },
    async save() {
      if (this.data.busy || !this.data.plan || this.data.isSnapshot || this.data.savedPlanId || !canSave(this.data.state, this.data.saveConsent)) return;
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'save'; this.setData({ busy: true, error: null });
      const result = await deps.api.savePlan(this.data.sessionId, this.data.runId, true, state.saveAttempt.key(this.data.runId)); if (!alive(this, epoch)) return;
      this.setData({ busy: false }); if (!result.ok) { fail(this, result.error.code); return; }
      this.setData({ state: 'ready', savedPlanId: result.value.planId, notice: '方案已保存，可在“我的方案”查看。' });
    },
    async loadSaved(id: string) {
      const state = runtime(this); const epoch = state.epoch; this.setData({ loading: true, isSnapshot: true });
      const result = await deps.api.getPlan(id); if (!alive(this, epoch)) return; this.setData({ loading: false });
      if (!result.ok) { fail(this, result.error.code); return; }
      if (!validPlan(result.value.snapshot.plan)) { fail(this, 'INVALID_RESPONSE'); return; }
      const { profile, plan } = result.value.snapshot; this.showProfile(profile.facts);
      this.setData({ savedPlanId: id, profileVersion: profile.version, state: 'ready', plan, cards: programmeCards(plan),
        steps: plan.generalNextSteps.map(s => stepLabels[s]), warnings: result.value.revalidationWarnings.map(warningText), error: null });
    },
    expandEvidence(event: WechatMiniprogram.BaseEvent) { this.setData({ cards: (this.data.cards as ReturnType<typeof programmeCards>).map(card => card.id === Number(event.currentTarget.dataset.id) ? { ...card, expanded: !card.expanded } : card) }); },
    imageError(event: WechatMiniprogram.BaseEvent) { this.setData({ cards: (this.data.cards as ReturnType<typeof programmeCards>).map(card => card.id === Number(event.currentTarget.dataset.id) ? { ...card, imageFailed: true } : card) }); },
    copySource(event: WechatMiniprogram.BaseEvent) { const url = safeSourceUrl(String(event.currentTarget.dataset.url ?? '')); if (url) wx.setClipboardData({ data: url }); },
    async openShare() {
      if (!this.data.savedPlanId || this.data.busy) return;
      if (!this.data.cards.length) { this.setData({ notice: '此方案没有候选项目，可通过顾问咨询入口直接联系。' }); return; }
      this.setData({ shareOpen: true, shareConsent: false, sharePreview: null, receipt: '', error: null, shareProgrammeIndex: 0, selectedProgrammeId: this.data.cards[0].id });
      await this.loadSharePreview();
    },
    async selectShareProgramme(event: WechatMiniprogram.PickerChange) {
      if (this.data.busy) return;
      const index = Number(event.detail.value); const card = this.data.cards[index]; if (!card) return;
      this.setData({ shareProgrammeIndex: index, selectedProgrammeId: card.id, shareConsent: false, sharePreview: null, receipt: '' });
      await this.loadSharePreview();
    },
    async loadSharePreview() {
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'loadSharePreview';
      this.setData({ busy: true, shareConsent: false, sharePreview: null, error: null });
      const result = await deps.api.consultationPreview(this.data.savedPlanId, this.data.selectedProgrammeId);
      if (!alive(this, epoch)) return; this.setData({ busy: false });
      if (!result.ok) { fail(this, result.error.code); return; }
      if (result.value.programmeId !== this.data.selectedProgrammeId) { fail(this, 'INVALID_RESPONSE'); return; }
      this.setData({ sharePreview: result.value });
    },
    openSave() { this.setData({ saveOpen: true, saveConsent: false }); },
    closeSave() { if (!this.data.busy) this.setData({ saveOpen: false }); },
    closeShare() { if (!this.data.busy) this.setData({ shareOpen: false }); },
    toggleConsultationDetails() { this.setData({ consultationDetails: !this.data.consultationDetails }); },
    consultationChanged(event: WechatMiniprogram.Input) { if (this.data.busy) return; const key = event.currentTarget.dataset.key;
      if (['name', 'contact', 'intendedSchool', 'intendedCourse', 'notes'].includes(key)) this.setData({ consultation: { ...this.data.consultation, [key]: event.detail.value }, shareConsent: false }); },
    qualificationChanged(event: WechatMiniprogram.PickerChange) { if (this.data.busy) return; const index = Number(event.detail.value); this.setData({ qualificationIndex: index, consultation: { ...this.data.consultation, qualification: ['', 'foundation', 'bachelor', 'master', 'doctorate'][index] ?? '' }, shareConsent: false }); },
    async handoff() {
      if (this.data.busy || this.data.receipt || !this.data.savedPlanId || !this.data.shareConsent || !this.data.sharePreview) return;
      const draft = { ...this.data.consultation, privacyConsent: true } as ConsultationDraft;
      if (!draft.name.trim() || !draft.contact.trim()) { this.setData({ notice: '请填写称呼和联系方式。' }); return; }
      const state = runtime(this); const epoch = state.epoch; state.lastAction = 'handoff'; this.setData({ busy: true, error: null, notice: '' });
      const preview = this.data.sharePreview as ConsultationPreview;
      const result = await deps.api.handoff(this.data.savedPlanId, draft, true, state.shareAttempt.key(`${this.data.savedPlanId}:${preview.programmeId}:${preview.fingerprint}:${JSON.stringify(draft)}`), preview.programmeId, preview.fingerprint); if (!alive(this, epoch)) return;
      this.setData({ busy: false }); if (!result.ok) { fail(this, result.error.code); return; }
      this.setData({ receipt: result.value.referenceCode, notice: '咨询已提交，顾问将通过你填写的方式联系。', state: 'ready' });
    },
    recover() {
      const action = this.data.error?.action;
      if (action === 'login') { void this.loginAgain(); return; }
      if (action === 'preview') { void this.loadSharePreview(); return; }
      if (action === 'adviser') { this.adviser(); return; }
      if (action === 'profile') { this.openBackgroundForText(runtime(this).pendingText); this.setData({ error: null }); return; }
      if (action === 'new-session') { this.newSession(); return; }
      if (action === 'later') { this.catalogue(); return; }
      const state = runtime(this);
      if (action === 'retry' && state.lastAction === 'message') { void this.submitMessage(state.pendingIntent, state.pendingText); return; }
      if (action === 'retry' && state.lastAction === 'save') { this.setData({ state: 'ready' }); void this.save(); return; }
      if (action === 'retry' && ['start', 'confirmProfile', 'handoff', 'removeSession', 'loadSharePreview'].includes(state.lastAction)) { void this[state.lastAction](); return; }
      void this.load();
    },
    async loginAgain() {
      const state = runtime(this); const epoch = state.epoch; this.setData({ busy: true });
      const result = await deps.session.login(); if (!alive(this, epoch)) return;
      this.setData({ busy: false }); if (!result.ok) { fail(this, result.error.code); return; }
      await this.load();
    },
    newSession() { if (this.data.busy || ['sending', 'polling'].includes(this.data.state)) return;
      const state = runtime(this); state.routePlan = ''; state.poller.stop(); state.attempt.clear(); state.saveAttempt.clear(); state.shareAttempt.clear();
      if (state.storageKey) deps.storage.remove(state.storageKey);
      this.setData({ sessionId: '', savedPlanId: '', runId: '', profileVersion: 0, isSnapshot: false, formOpen: false, shareOpen: false, sharePreview: null, shareConsent: false, selectedProgrammeId: 0, consentOpen: false, menuOpen: false, saveOpen: false, privacyConsent: false, plan: null, cards: [], messages: [], questions: [], steps: [], warnings: [], notice: '', error: null, state: 'idle', fields: profileFields() }); void this.load();
    },
    deleteSession() { if (this.data.busy || !this.data.sessionId) return;
      wx.showModal({ title: '删除这次对话？', content: '对话与背景将删除。已保存的方案和已提交的咨询保留。', success: result => { if (result.confirm) void this.removeSession(); } });
    },
    async removeSession() { const state = runtime(this); const epoch = state.epoch; state.lastAction = 'removeSession'; this.setData({ busy: true }); state.poller.stop();
      const result = await deps.api.deleteSession(this.data.sessionId); if (!alive(this, epoch)) return; this.setData({ busy: false });
      if (!result.ok) { fail(this, result.error.code); return; } this.setData({ state: 'idle' }); this.newSession();
    },
    catalogue() { deps.navigate('/pages/planning-discovery/index'); }, adviser() { deps.navigate('/pages/consultation/index'); }, myPlans() { deps.navigate('/pages/plans/index'); },
  };
}
Page(createPlanningAgentPage());
