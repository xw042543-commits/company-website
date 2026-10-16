import { deleteStudyPlan, getStudyPlans, type StudyPlan } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
type State = 'loading' | 'ready' | 'empty' | 'failed';
const defaults = { auth: () => sessionStore.ensureAuthenticated(), listLegacy: getStudyPlans,
  navigate: (url: string): void => { wx.navigateTo({ url }); } };
export function createPlansPage(overrides: Partial<typeof defaults> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...defaults, ...overrides }; let epoch = 0;
  return {
    data: { state: 'loading' as State, plans: [] as StudyPlan[], removing: '' },
    onShow() { void this.load(); }, onHide() { epoch++; }, onUnload() { epoch++; }, retry() { void this.load(); },
    create() { deps.navigate('/pages/planning/index'); },
    edit(event: WechatMiniprogram.BaseEvent) { deps.navigate(`/pages/planning/index?planId=${Number(event.currentTarget.dataset.id)}`); },
    async remove(event: WechatMiniprogram.BaseEvent) {
      if (this.data.removing) return;
      const id = Number(event.currentTarget.dataset.id); this.setData({ removing: `legacy-${id}` }); const generation = epoch;
      const result = await deleteStudyPlan(id); if (generation !== epoch) return; this.setData({ removing: '' });
      if (!result.ok) { wx.showToast({ title: '删除失败，请重试', icon: 'none' }); return; }
      wx.showToast({ title: '已删除', icon: 'none' }); void this.load();
    },
    async load() {
      const generation = ++epoch; this.setData({ state: 'loading', removing: '' });
      const auth = await deps.auth(); if (generation !== epoch) return;
      if (!auth.ok) { this.setData({ state: 'failed', plans: [] }); return; }
      const legacy = await deps.listLegacy(); if (generation !== epoch) return;
      this.setData({ plans: legacy.ok ? legacy.value : [], state: legacy.ok ? legacy.value.length ? 'ready' : 'empty' : 'failed' });
    },
  };
}
Page(createPlansPage());
