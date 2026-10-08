import { deleteStudyPlan, getStudyPlans, type StudyPlan } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
type State = 'loading' | 'ready' | 'empty' | 'failed';
Page({
  data: { state: 'loading' as State, plans: [] as StudyPlan[] },
  onShow() { void this.load(); }, retry() { void this.load(); },
  create() { wx.navigateTo({ url: '/pages/planning/index' }); },
  async remove(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget.dataset.id); const result = await deleteStudyPlan(id);
    if (!result.ok) { wx.showToast({ title: '删除失败，请重试', icon: 'none' }); return; }
    wx.showToast({ title: '已删除', icon: 'none' }); void this.load();
  },
  async load() {
    this.setData({ state: 'loading' as State });
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { this.setData({ state: 'failed' as State }); return; }
    const result = await getStudyPlans();
    if (!result.ok) { this.setData({ state: 'failed' as State }); return; }
    this.setData({ plans: result.value, state: result.value.length ? 'ready' as State : 'empty' as State });
  },
});
