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
      { key: 'orders', mark: '申', tone: 'forest', label: '我的申请', caption: '查看未支付、材料与申请进度' },
      { key: 'wallet', mark: '积', tone: 'amber', label: '会员积分', caption: '管理账户余额、积分与使用记录' },
      { key: 'consultations', mark: '询', tone: 'amber', label: '咨询记录', caption: '查看已提交的咨询' },
      { key: 'settings', mark: '设', tone: 'stone', label: '设置', caption: '账号与隐私设置' },
      { key: 'about', mark: '洋', tone: 'mint', label: '关于我们', caption: '了解洋豆角' },
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
    if (key === 'favorites' || key === 'universityFavorites') {
      wx.switchTab({ url: '/pages/favorites-cart/index' });
      return;
    }
    if (key === 'community') {
      const route = communityMeRoute();
      if (route.ok) wx.navigateTo({ url: route.value });
      return;
    }
    if (key === 'adviser') { wx.navigateTo({ url: '/pages/consultation/index' }); return; }
    const routes: Record<string, string> = {
      orders: '/pages/orders/index', favorites: '/pages/favorites/index',
      universityFavorites: '/pages/university-favorites/index',
      wallet: '/pages/wallet/index',
      consultations: '/pages/consultations/index',
      settings: '/pages/settings/index',
      about: '/pages/about/index',
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
