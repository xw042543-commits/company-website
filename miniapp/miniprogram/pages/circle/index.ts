import { sessionStore } from '../../stores/session';

Page({
  data: {
    session: sessionStore.getSnapshot(),
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

  async enterCircle() {
    wx.showLoading({ title: '登录中', mask: true });
    const result = await sessionStore.ensureAuthenticated();
    wx.hideLoading();
    if (!result.ok) wx.showToast({ title: '登录未完成，请重试', icon: 'none' });
  },
});
