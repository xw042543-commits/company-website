import { getApplicationOrder, type ApplicationOrderDetail } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';

type PageState = 'loading' | 'ready' | 'failed';
type DetailTab = 'progress' | 'materials' | 'fees' | 'history';

Page({
  data: {
    state: 'loading' as PageState,
    referenceCode: '',
    activeTab: 'progress' as DetailTab,
    detail: null as ApplicationOrderDetail | null,
    tabs: [
      { key: 'progress', label: '申请进度' },
      { key: 'materials', label: '申请材料' },
      { key: 'fees', label: '申请费用' },
      { key: 'history', label: '进度记录' },
    ],
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({ referenceCode: options.referenceCode || '' });
    void this.load();
  },

  retry() { void this.load(); },
  switchTab(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as DetailTab | undefined;
    if (key) this.setData({ activeTab: key });
  },
  supplement() {
    wx.showModal({ title: '补充材料', content: '顾问会根据院校要求通知具体材料。请在咨询记录中确认联系方式并等待顾问联系。', showCancel: false });
  },
  showReview() {
    wx.showModal({ title: '当前进度说明', content: this.data.detail?.currentMessage || '暂无审核意见。', showCancel: false });
  },

  async load() {
    this.setData({ state: 'loading' as PageState });
    const authenticated = await sessionStore.ensureAuthenticated();
    if (!authenticated.ok || !this.data.referenceCode) { this.setData({ state: 'failed' as PageState }); return; }
    const result = await getApplicationOrder(this.data.referenceCode);
    this.setData(result.ok ? { detail: result.value, state: 'ready' as PageState }
      : { detail: null, state: 'failed' as PageState });
  },
});
