import { sessionStore } from '../../stores/session';
import { getUserOverview, type UserOverview } from '../../services/miniapp-data';
import { communityMeRoute } from '../../utils/routes';
import { updateAvatar } from '../../services/avatar';
import { updateNickname } from '../../services/nickname';

type AccountDeps = { session: typeof sessionStore; saveNickname: typeof updateNickname; toast: (title: string) => void };
export function createAccountPage(overrides: Partial<AccountDeps> = {}) {
  const deps: AccountDeps = { session: sessionStore, saveNickname: updateNickname,
    toast: (title) => wx.showToast({ title, icon: 'success' }), ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: {
    session: deps.session.getSnapshot(),
    overview: { favorites: 0, plans: 0, consultations: 0, orders: 0 } as UserOverview,
    avatarUploading: false,
    nicknameOpen: false, nicknameDraft: '', nicknameSaving: false, nicknameError: '', nicknameCount: 0, nicknameKeyboardHeight: 0,
    menuItems: [
      { key: 'consultations', mark: '询', tone: 'mint', label: '申请意向与咨询', caption: '查看已提交的意向与顾问跟进状态' },
      { key: 'orders', mark: '申', tone: 'forest', label: '我的申请', caption: '查看已有申请、材料与办理进度' },
      { key: 'wallet', mark: '积', tone: 'amber', label: '会员积分', caption: '管理账户余额、积分与使用记录' },
      { key: 'settings', mark: '设', tone: 'stone', label: '设置', caption: '账号与隐私设置' },
      { key: 'about', mark: '洋', tone: 'mint', label: '关于我们', caption: '了解洋豆角' },
    ],
  },

  onLoad() {
    const page = this as typeof this & { unsubscribeSession?: () => void };
    page.unsubscribeSession = deps.session.subscribe((session) => this.setData({ session }));
  },

  onShow() {
    this.setData({ session: deps.session.getSnapshot() });
    if (deps.session.getSnapshot().status === 'authenticated') void this.loadOverview();
  },

  onUnload() {
    const page = this as typeof this & { unsubscribeSession?: () => void };
    page.unsubscribeSession?.();
  },

  async openIdentity() {
    if (deps.session.getSnapshot().status === 'authenticated') return;
    wx.showLoading({ title: '登录中', mask: true });
    const result = await deps.session.ensureAuthenticated();
    wx.hideLoading();
    if (!result.ok) wx.showToast({ title: '登录未完成，请重试', icon: 'none' });
    else void this.loadOverview();
  },

  noop() {},

  async editNickname() {
    if (deps.session.getSnapshot().status !== 'authenticated') { await this.openIdentity(); return; }
    if (this.data.avatarUploading) return;
    const nicknameDraft = deps.session.getSnapshot().account?.displayName ?? '';
    this.setData({ nicknameOpen: true, nicknameDraft, nicknameCount: Array.from(nicknameDraft).length, nicknameKeyboardHeight: 0, nicknameError: '' });
  },
  closeNickname() { if (!this.data.nicknameSaving) this.setData({ nicknameOpen: false, nicknameKeyboardHeight: 0, nicknameError: '' }); },
  nicknameInput(event: WechatMiniprogram.Input) { this.setData({ nicknameDraft: event.detail.value, nicknameCount: Array.from(event.detail.value).length, nicknameError: '' }); },
  nicknameKeyboard(event: WechatMiniprogram.CustomEvent<{ height: number }>) {
    if (this.data.nicknameOpen) this.setData({ nicknameKeyboardHeight: Math.max(0, event.detail.height || 0) });
  },
  async saveNickname(event: WechatMiniprogram.CustomEvent<{ value: { nickname?: string } }>) {
    if (this.data.nicknameSaving) return;
    const accountId = deps.session.getSnapshot().account?.id;
    if (!accountId) { this.setData({ nicknameError: '请先登录' }); return; }
    const value = event.detail.value.nickname ?? '';
    this.setData({ nicknameSaving: true, nicknameDraft: value, nicknameCount: Array.from(value).length, nicknameError: '' });
    const result = await deps.saveNickname(value);
    this.setData({ nicknameSaving: false });
    if (deps.session.getSnapshot().account?.id !== accountId) { this.setData({ nicknameOpen: false }); return; }
    if (!result.ok) {
      this.setData({ nicknameError: result.error.code === 'INVALID_NICKNAME' ? '请输入 1–32 个字符的昵称，不含换行'
        : result.error.code === 'NICKNAME_NOT_APPROVED' ? '昵称暂未通过校验，请修改后重试' : '保存失败，请稍后重试' });
      return;
    }
    deps.session.updateAccount(result.value);
    this.setData({ session: deps.session.getSnapshot(), nicknameOpen: false });
    deps.toast('昵称已更新');
  },

  async chooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl?: string }>) {
    const filePath = event.detail.avatarUrl;
    if (!filePath || this.data.avatarUploading || this.data.nicknameSaving) return;
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
    deps.session.updateAccount(result.value);
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
      consultations: '/pages/consultations/index',
      universityFavorites: '/pages/university-favorites/index',
      wallet: '/pages/wallet/index',
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
};
  return definition;
}
if (typeof Page === 'function') Page(createAccountPage());
