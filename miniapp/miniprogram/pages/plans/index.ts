import { deleteStudyPlan, getStudyPlans, type StudyPlan } from '../../services/miniapp-data';
import { planningAgent, validAgentId, type SavedPlan } from '../../services/planning-agent';
import { sessionStore } from '../../stores/session';
type State = 'loading' | 'ready' | 'empty' | 'failed';
const defaults = { api: planningAgent, auth: () => sessionStore.ensureAuthenticated(), listLegacy: getStudyPlans,
  navigate: (url: string): void => { wx.navigateTo({ url }); } };
export function createPlansPage(overrides: Partial<typeof defaults> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...defaults, ...overrides }; let epoch = 0;
  return {
    data: { state: 'loading' as State, plans: [] as StudyPlan[], agentState: 'loading' as State, agentPlans: [] as SavedPlan[], removing: '' },
    onShow() { void this.load(); }, onHide() { epoch++; }, onUnload() { epoch++; }, retry() { void this.load(); },
    create() { deps.navigate('/pages/planning/index'); },
    edit(event: WechatMiniprogram.BaseEvent) { deps.navigate(`/pages/planning/index?planId=${Number(event.currentTarget.dataset.id)}`); },
    openAgent(event: WechatMiniprogram.BaseEvent) { const id = String(event.currentTarget.dataset.id); if (validAgentId(id)) deps.navigate(`/pages/planning-agent/index?planId=${id}`); },
    async remove(event: WechatMiniprogram.BaseEvent) {
      if (this.data.removing) return;
      const id = Number(event.currentTarget.dataset.id); this.setData({ removing: `legacy-${id}` }); const generation = epoch;
      const result = await deleteStudyPlan(id); if (generation !== epoch) return; this.setData({ removing: '' });
      if (!result.ok) { wx.showToast({ title: '删除失败，请重试', icon: 'none' }); return; }
      wx.showToast({ title: '已删除', icon: 'none' }); void this.load();
    },
    removeAgent(event: WechatMiniprogram.BaseEvent) {
      const id = String(event.currentTarget.dataset.id); if (this.data.removing || !validAgentId(id)) return;
      wx.showModal({ title: '删除此 AI 方案？', content: '已提交给顾问的咨询有独立处理周期，不随方案删除。', success: result => { if (result.confirm) void this.confirmRemoveAgent(id); } });
    },
    async confirmRemoveAgent(id: string) {
      if (this.data.removing) return; this.setData({ removing: id }); const generation = epoch;
      const result = await deps.api.deletePlan(id); if (generation !== epoch) return; this.setData({ removing: '' });
      if (!result.ok) { wx.showToast({ title: '删除失败，请重新登录或重试', icon: 'none' }); return; }
      wx.showToast({ title: '方案已删除', icon: 'none' }); void this.load();
    },
    async load() {
      const generation = ++epoch; this.setData({ state: 'loading', agentState: 'loading', removing: '' });
      const auth = await deps.auth(); if (generation !== epoch) return;
      if (!auth.ok) { this.setData({ state: 'failed', agentState: 'failed', plans: [], agentPlans: [] }); return; }
      const [legacy, agent] = await Promise.all([deps.listLegacy(), deps.api.listPlans()]); if (generation !== epoch) return;
      this.setData({ plans: legacy.ok ? legacy.value : [], state: legacy.ok ? legacy.value.length ? 'ready' : 'empty' : 'failed',
        agentPlans: agent.ok ? agent.value : [], agentState: agent.ok ? agent.value.length ? 'ready' : 'empty' : 'failed' });
    },
  };
}
Page(createPlansPage());
