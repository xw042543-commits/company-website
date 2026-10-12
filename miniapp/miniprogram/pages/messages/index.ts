import { inboxStore, type InboxSnapshot } from '../../stores/inbox';
import { sessionStore } from '../../stores/session';
import { isInboxCategory, type InboxMessage, type MessageCategory } from '../../services/messages';
import { communityPostRoute } from '../../utils/routes';
import { errorCopy, formatCommunityTime } from '../../utils/community-ui';

const labels: Readonly<Record<MessageCategory, string>> = { COMMUNITY: 'U圈', SYSTEM: '系统', APPLICATION: '申请' };
type MessageView = InboxMessage & { displayTime: string; categoryLabel: string };
type MessageDeps = { store: typeof inboxStore; session: Pick<typeof sessionStore, 'login' | 'getSnapshot'>; navigate: (url: string) => void; toast: (text: string) => void; scrollToDetail: () => void };
const defaults: MessageDeps = { store: inboxStore, session: sessionStore, navigate: (url) => wx.navigateTo({ url }), toast: (title) => wx.showToast({ title, icon: 'none' }), scrollToDetail: () => wx.pageScrollTo({ scrollTop: 0, duration: 200 }) };
interface MessageRuntime { active: boolean; generation: number; unsubscribe: () => void; category: string; loggingIn: boolean }
type MessagePage = WechatMiniprogram.Page.TrivialInstance & { _inboxRuntime: MessageRuntime };
const runtime = (page: WechatMiniprogram.Page.TrivialInstance) => (page as MessagePage)._inboxRuntime;
const view = (item: InboxMessage): MessageView => ({ ...item, displayTime: formatCommunityTime(item.createdAt), categoryLabel: labels[item.category] });

export function createMessagesPage(overrides: Partial<MessageDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...defaults, ...overrides };
  return {
    data: { ...deps.store.getSnapshot(), items: [] as MessageView[], detail: null as MessageView | null, loggingIn: false,
      filters: [{ key: 'ALL', label: '全部' }, { key: 'COMMUNITY', label: 'U圈' }, { key: 'SYSTEM', label: '系统' }, { key: 'APPLICATION', label: '申请' }] },
    onLoad() {
      const state: MessageRuntime = { active: true, generation: 0, unsubscribe: () => {}, category: this.data.category, loggingIn: false };
      (this as MessagePage)._inboxRuntime = state;
      const render = (snapshot: InboxSnapshot) => {
        if (snapshot.category !== state.category || snapshot.state === 'loading' || snapshot.state === 'unauthorized') state.generation++;
        state.category = snapshot.category;
        const detail = this.data.detail as MessageView | null;
        const retained = detail ? snapshot.items.find((item) => item.id === detail.id) : undefined;
        this.setData({ ...snapshot, items: snapshot.items.map(view), detail: retained ? view(retained) : null });
      };
      state.unsubscribe = deps.store.subscribe(render);
      render(deps.store.getSnapshot());
    },
    onShow() { runtime(this).active = true; this.setData({ loggingIn: runtime(this).loggingIn }); void deps.store.show(); },
    onHide() { runtime(this).active = false; runtime(this).generation++; deps.store.hide(); },
    onUnload() { const state = runtime(this); state.active = false; state.generation++; state.unsubscribe(); deps.store.hide(); },
    onPullDownRefresh() { void deps.store.refresh().finally(() => wx.stopPullDownRefresh()); },
    onReachBottom() { void deps.store.loadMore(); },
    retry() { void deps.store.refresh(); },
    loadMore() { void deps.store.loadMore(); },
    selectCategory(event: WechatMiniprogram.BaseEvent) {
      const category = event.currentTarget.dataset.category;
      if (isInboxCategory(category)) { this.setData({ detail: null }); void deps.store.selectCategory(category); }
    },
    closeDetail() { this.setData({ detail: null }); },
    async login() {
      const state = runtime(this);
      if (state.loggingIn) return;
      state.loggingIn = true;
      this.setData({ loggingIn: true });
      let result: Awaited<ReturnType<MessageDeps['session']['login']>>;
      try { result = await deps.session.login(); }
      catch { result = { ok: false, error: { kind: 'unavailable', code: 'WECHAT_LOGIN_UNAVAILABLE' } }; }
      state.loggingIn = false;
      if (!runtime(this).active) return;
      this.setData({ loggingIn: false });
      if (!result.ok) { deps.toast(errorCopy(result.error)); return; }
      await deps.store.show();
    },
    async openMessage(event: WechatMiniprogram.BaseEvent) {
      const id = event.currentTarget.dataset.id;
      const message = deps.store.getSnapshot().items.find((item) => item.id === id);
      if (!message || this.data.readingId || !runtime(this).active) return;
      const generation = runtime(this).generation;
      const result = await deps.store.markRead(message.id);
      if (!runtime(this).active || generation !== runtime(this).generation) return;
      if (!result.ok) { if (result.error.code !== 'REQUEST_SUPERSEDED') deps.toast(errorCopy(result.error)); return; }
      const current = deps.store.getSnapshot().items.find((item) => item.id === message.id);
      if (!current) return;
      if (current.targetType === 'COMMUNITY_POST' && current.targetId) {
        const route = communityPostRoute(current.targetId);
        if (route.ok) deps.navigate(route.value); else deps.toast('消息关联的内容暂时无法打开。');
      } else if (current.targetType === 'NONE') this.setData({ detail: view(current) }, () => {
        if (runtime(this).active && generation === runtime(this).generation && this.data.detail?.id === current.id) deps.scrollToDetail();
      });
    },
  };
}
if (typeof Page !== 'undefined') Page(createMessagesPage());
