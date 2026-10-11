import { removeAvatar } from '../../services/avatar';
import { sessionStore } from '../../stores/session';

Page({
  data: {
    session: sessionStore.getSnapshot(),
    removingAvatar: false,
    loggingOut: false,
  },

  onShow() { this.setData({ session: sessionStore.getSnapshot() }); },

  async removeAvatar() {
    if (this.data.removingAvatar || !this.data.session.account?.avatarUrl) return;
    const confirmed = await confirm('移除头像', '移除后将恢复默认头像，U圈中的头像也会同步更新。');
    if (!confirmed) return;
    this.setData({ removingAvatar: true });
    wx.showLoading({ title: '正在移除', mask: true });
    const result = await removeAvatar();
    wx.hideLoading();
    this.setData({ removingAvatar: false });
    if (!result.ok) {
      wx.showToast({ title: '移除失败，请重试', icon: 'none' });
      return;
    }
    sessionStore.updateAccount(result.value);
    this.setData({ session: sessionStore.getSnapshot() });
    wx.showToast({ title: '头像已移除', icon: 'success' });
  },

  async logout() {
    if (this.data.loggingOut || this.data.session.status !== 'authenticated') return;
    const confirmed = await confirm('退出登录', '退出后，本机将清除登录状态。你的收藏和申请资料会保留在账号中。');
    if (!confirmed) return;
    this.setData({ loggingOut: true });
    await sessionStore.logout();
    this.setData({ loggingOut: false, session: sessionStore.getSnapshot() });
    wx.showToast({ title: '已退出登录', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 500);
  },
});

function confirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => wx.showModal({
    title, content, confirmColor: '#087a4e', success: ({ confirm: accepted }) => resolve(accepted),
    fail: () => resolve(false),
  }));
}
