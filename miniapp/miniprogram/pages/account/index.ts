import { sessionStore } from '../../stores/session';
import { getUserOverview, type UserOverview } from '../../services/miniapp-data';
import { communityMeRoute } from '../../utils/routes';
import { updateAvatar } from '../../services/avatar';

Page({
  data: {
    session: sessionStore.getSnapshot(),
    overview: { favorites: 0, plans: 0, consultations: 0, orders: 0 } as UserOverview,
    avatarUploading: false,
    menuItems: [
      { key: 'orders', label: '我的订单', caption: '查看申请进度、材料与费用' },
      { key: 'wallet', label: '会员积分', caption: '管理账户余额、积分与使用记录' },
      { key: 'plans', label: '我的规划', caption: '管理留学目标、背景和预算' },
      { key: 'favorites', label: '专业收藏', caption: '查看已保存的专业' },
      { key: 'consultations', label: '咨询记录', caption: '查看已提交的咨询' },
      { key: 'community', label: '我的U圈', caption: '管理发布的帖子和评论' },
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
    if (sessionStore.getSnapshot().status === 'authenticated') void this.loadOverview();
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
    else void this.loadOverview();
  },

  noop() {},

  async chooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl?: string }>) {
    const filePath = event.detail.avatarUrl;
    if (!filePath || this.data.avatarUploading) return;
    this.setData({ avatarUploading: true });
    wx.showLoading({ title: '正在保存头像', mask: true });
    const result = await updateAvatar(filePath);
    wx.hideLoading();
    this.setData({ avatarUploading: false });
    if (!result.ok) {
      wx.showToast({
        title: result.error.code === 'AVATAR_TOO_LARGE' ? '头像不能超过1MB' : '头像保存失败，请重试',
        icon: 'none',
      });
      return;
    }
    sessionStore.updateAccount(result.value);
    wx.showToast({ title: '头像已更新', icon: 'success' });
  },

  openMenu(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    if (key === 'community') {
      const route = communityMeRoute();
      if (route.ok) wx.navigateTo({ url: route.value });
      return;
    }
    const routes: Record<string, string> = {
      orders: '/pages/orders/index', plans: '/pages/plans/index', favorites: '/pages/favorites/index',
      wallet: '/pages/wallet/index',
      consultations: '/pages/consultations/index',
    };
    const route = key ? routes[key] : undefined;
    if (route) { wx.navigateTo({ url: route }); return; }
    wx.showToast({ title: '功能建设中', icon: 'none' });
  },
  async loadOverview() {
    const result = await getUserOverview();
    if (result.ok) this.setData({ overview: result.value });
  },
});
