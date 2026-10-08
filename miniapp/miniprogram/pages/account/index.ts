import { sessionStore } from '../../stores/session';

Page({
  data: {
    session: sessionStore.getSnapshot(),
    menuItems: [
      { key: 'orders', label: '我的订单', caption: '申请业务接入后开放' },
      { key: 'points', label: '会员积分', caption: '积分规则确认后开放' },
      { key: 'consultations', label: '咨询记录', caption: '查看已提交的咨询' },
      { key: 'settings', label: '设置', caption: '账号与隐私设置' },
      { key: 'about', label: '关于我们', caption: '了解洋豆角' },
    ],
  },

  onLoad() {
    const page = this as typeof this & { unsubscribeSession?: () => void };
    page.unsubscribeSession = sessionStore.subscribe((session) => this.setData({ session }));
  },

  onShow() {
    this.setData({ session: sessionStore.getSnapshot() });
  },

  onUnload() {
    const page = this as typeof this & { unsubscribeSession?: () => void };
    page.unsubscribeSession?.();
  },

  async openIdentity() {
    if (sessionStore.getSnapshot().status === 'authenticated') return;
    wx.showLoading({ title: '登录中', mask: true });
    const result = await sessionStore.ensureAuthenticated();
    wx.hideLoading();
    if (!result.ok) wx.showToast({ title: '登录未完成，请重试', icon: 'none' });
  },

  openMenu(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    const title = key === 'consultations' || key === 'settings' || key === 'about'
      ? '功能建设中'
      : '等待真实业务数据';
    wx.showToast({ title, icon: 'none' });
  },
});
