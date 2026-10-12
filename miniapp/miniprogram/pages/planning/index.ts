import { getStudyPlans, saveStudyPlan, type StudyPlanForm } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
import { clearPlanningDraft, loadPlanningDraft, savePlanningDraft } from '../../stores/planning-draft';

Page({
  data: {
    step: 1, saving: false, planId: 0, loading: false, loadFailed: false,
    selectedSubjects: {} as Record<string, boolean>, subjectsText: '未限定',
    studyGoals: ['本科', '硕士', '博士', '语言课程'],
    subjectOptions: ['计算机', '商科', '工程', '设计', '医学', '教育', '传媒'],
    form: { goal: '', subjects: [] as string[], country: '', intake: '', education: '', grade: '', language: '', budget: '' },
  },
  onLoad(options: Record<string, string | undefined>) {
    const planId = Number(options.planId ?? 0);
    if (Number.isSafeInteger(planId) && planId > 0) { this.setData({ planId }); void this.loadPlan(planId); return; }
    const draft = loadPlanningDraft(); if (draft) this.setForm(draft);
  },
  onHide() { this.persistDraft(); },
  onUnload() { this.persistDraft(); },
  setForm(form: StudyPlanForm) {
    this.setData({ form, selectedSubjects: Object.fromEntries(form.subjects.map((subject) => [subject, true])), subjectsText: form.subjects.join('、') || '未限定' });
  },
  retry() { void this.loadPlan(this.data.planId); },
  selectGoal(event: WechatMiniprogram.BaseEvent) { this.patch('goal', String(event.currentTarget.dataset.value ?? '')); },
  toggleSubject(event: WechatMiniprogram.BaseEvent) {
    const value = String(event.currentTarget.dataset.value ?? '');
    const subjects = this.data.form.subjects.includes(value)
      ? this.data.form.subjects.filter((item) => item !== value) : [...this.data.form.subjects, value];
    this.patch('subjects', subjects);
  },
  updateField(event: WechatMiniprogram.Input) { this.patch(String(event.currentTarget.dataset.field ?? ''), event.detail.value); },
  patch(field: string, value: string | string[]) {
    if (this.data.saving || this.data.loading || this.data.loadFailed || !Object.prototype.hasOwnProperty.call(this.data.form, field)) return;
    if (field === 'subjects' && Array.isArray(value)) {
      this.setData({ 'form.subjects': value, selectedSubjects: Object.fromEntries(value.map((subject) => [subject, true])), subjectsText: value.join('、') || '未限定' });
    } else {
      this.setData({ [`form.${field}`]: value });
    }
  },
  previous() { if (this.data.step > 1) this.setData({ step: this.data.step - 1 }); },
  next() {
    if (this.data.step === 1 && (!this.data.form.goal || !this.data.form.country.trim())) {
      wx.showToast({ title: '请填写留学目标和国家地区', icon: 'none' }); return;
    }
    if (this.data.step === 2 && !this.data.form.education.trim()) {
      wx.showToast({ title: '请填写目前学历', icon: 'none' }); return;
    }
    this.setData({ step: Math.min(3, this.data.step + 1) }); this.persistDraft();
  },
  async submit() {
    if (this.data.saving || this.data.loading || this.data.loadFailed) return;
    if (!this.data.form.goal.trim() || !this.data.form.country.trim() || !this.data.form.education.trim()) return;
    this.setData({ saving: true });
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { this.setData({ saving: false, loading: false, loadFailed: this.data.planId > 0 }); wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return; }
    const result = this.data.planId ? await saveStudyPlan(this.data.form as StudyPlanForm, this.data.planId)
      : await saveStudyPlan(this.data.form as StudyPlanForm);
    this.setData({ saving: false });
    if (!result.ok) { wx.showToast({ title: '保存失败，请检查后重试', icon: 'none' }); return; }
    this.setData({ planId: result.value.id }); clearPlanningDraft(); wx.showToast({ title: '规划已保存', icon: 'success' });
    setTimeout(() => wx.redirectTo({ url: '/pages/plans/index' }), 450);
  },
  async loadPlan(planId: number) {
    this.setData({ loading: true, loadFailed: false });
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { this.setData({ saving: false, loading: false, loadFailed: this.data.planId > 0 }); wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return; }
    const result = await getStudyPlans(); const plan = result.ok ? result.value.find((item) => item.id === planId) : null;
    this.setData({ loading: false, loadFailed: !plan });
    if (!plan) { wx.showToast({ title: '规划资料加载失败', icon: 'none' }); return; }
    this.setForm(plan.form);
  },
  persistDraft() { if (!this.data.planId) savePlanningDraft(this.data.form as StudyPlanForm); },
});
