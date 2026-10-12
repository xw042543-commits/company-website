import { messagesService, type InboxCategory, type InboxMessage, type MessagesService, isInboxCategory } from '../services/messages';
import { sessionStore, type SessionSnapshot } from './session';
import type { AppError, Result } from '../utils/result';

export interface InboxSnapshot {
  readonly category: InboxCategory; readonly state: 'loading' | 'ready' | 'empty' | 'unauthorized' | 'offline' | 'failed';
  readonly items: readonly InboxMessage[]; readonly page: number; readonly hasMore: boolean; readonly loadingMore: boolean;
  readonly unreadCount: number | null; readonly countError: AppError | null; readonly loadMoreError: AppError | null;
  readonly readingId: string | null;
}
interface InboxDeps {
  readonly session: Pick<typeof sessionStore, 'getSnapshot' | 'subscribe'>;
  readonly service: MessagesService; readonly setUnreadDot: (visible: boolean) => void;
}
export function createInboxStore(deps: InboxDeps) {
  let snapshot = initial('loading');
  let started = false, visible = false;
  let identity = '', sessionVersion = 0, listVersion = 0, countVersion = 0, readVersion = 0;
  const listeners = new Set<(value: InboxSnapshot) => void>();
  const confirmedReads = new Map<string, string>();
  const publish = (patch: Partial<InboxSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener(snapshot));
  };
  const authenticated = () => deps.session.getSnapshot().status === 'authenticated';
  const badge = (count: number) => { try { deps.setUnreadDot(count > 0); } catch { /* Native tab bar may not be ready during launch. */ } };
  const acceptCount = (count: number, clearError = true) => { publish({ unreadCount: count, ...(clearError ? { countError: null } : {}) }); badge(count); };
  const rejectAuthentication = () => {
    sessionVersion++; listVersion++; countVersion++; readVersion++;
    confirmedReads.clear();
    snapshot = { ...initial('unauthorized'), category: snapshot.category };
    publish({}); badge(0);
  };
  const current = (version: number) => version === sessionVersion && authenticated();
  const syncSession = (session: SessionSnapshot) => {
    const next = `${session.status}:${session.account?.id ?? ''}`;
    if (next === identity) return;
    identity = next; sessionVersion++; listVersion++; countVersion++; readVersion++;
    confirmedReads.clear();
    snapshot = { ...initial(session.status === 'unknown' ? 'loading' : 'unauthorized'), category: snapshot.category };
    publish({}); badge(0);
    if (session.status === 'authenticated') {
      void refreshCount();
      if (visible) void load(true);
    }
  };
  async function refreshCount(): Promise<void> {
    if (!authenticated()) return;
    const session = sessionVersion, request = ++countVersion;
    const result = await deps.service.unreadCount();
    if (!current(session) || request !== countVersion) return;
    if (result.ok) { countVersion++; acceptCount(result.value); }
    else if (result.error.kind === 'unauthorized') rejectAuthentication();
    else publish({ countError: result.error });
  }
  async function load(reset: boolean): Promise<void> {
    if (!authenticated()) return;
    if (!reset && (snapshot.loadingMore || !snapshot.hasMore || snapshot.state !== 'ready')) return;
    const session = sessionVersion, request = ++listVersion, countAtStart = countVersion;
    const category = snapshot.category, page = reset ? 1 : snapshot.page + 1;
    if (reset) { readVersion++; publish({ state: 'loading', items: [], page: 0, hasMore: false, loadingMore: false, loadMoreError: null, readingId: null }); }
    else publish({ loadingMore: true, loadMoreError: null });
    const result = await deps.service.list({ category, page, size: 20 });
    if (!current(session) || request !== listVersion || category !== snapshot.category) return;
    if (!result.ok) {
      if (result.error.kind === 'unauthorized') {
        rejectAuthentication();
        return;
      }
      if (!reset) publish({ loadingMore: false, loadMoreError: result.error });
      else publish({ state: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMore: false });
      return;
    }
    const items = new Map((reset ? [] : snapshot.items).map((item) => [item.id, item]));
    result.value.items.forEach((item) => {
      const confirmedAt = confirmedReads.get(item.id);
      items.set(item.id, item.readAt === null && confirmedAt ? { ...item, readAt: confirmedAt } : item);
    });
    const ordered = [...items.values()].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
      || right.id.length - left.id.length || (right.id > left.id ? 1 : right.id < left.id ? -1 : 0));
    publish({ items: ordered, page: result.value.page, hasMore: result.value.page < result.value.totalPages,
      state: ordered.length ? 'ready' : 'empty', loadingMore: false });
    // A read or newer count refresh started while the list was loading supersedes its embedded count.
    if (countAtStart === countVersion) acceptCount(result.value.unreadCount, false);
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: (value: InboxSnapshot) => void) { listeners.add(listener); return () => listeners.delete(listener); },
    start() { if (started) return; started = true; deps.session.subscribe(syncSession); syncSession(deps.session.getSnapshot()); },
    async show() { this.start(); visible = true; syncSession(deps.session.getSnapshot()); void refreshCount(); await load(true); },
    hide() { visible = false; },
    refresh: () => { void refreshCount(); return load(true); },
    refreshCount,
    async selectCategory(category: InboxCategory) {
      if (!isInboxCategory(category) || category === snapshot.category) return;
      listVersion++; readVersion++;
      publish({ category, items: [], page: 0, hasMore: false, loadingMore: false, readingId: null, loadMoreError: null });
      await load(true);
    },
    loadMore: () => load(false),
    async markRead(id: string): Promise<Result<void>> {
      const item = snapshot.items.find((value) => value.id === id);
      if (!authenticated() || !item) return { ok: false, error: { kind: 'unauthorized', code: 'AUTHENTICATION_REQUIRED' } };
      if (item.readAt) return { ok: true, value: undefined };
      if (snapshot.readingId) return { ok: false, error: { kind: 'unexpected', code: 'INBOX_READ_BUSY' } };
      const session = sessionVersion, request = ++readVersion;
      countVersion++;
      publish({ readingId: id });
      const result = await deps.service.markRead(id);
      if (!current(session)) return { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } };
      if (result.ok) {
        const confirmedAt = confirmedReads.get(id) ?? new Date().toISOString();
        confirmedReads.set(id, confirmedAt);
        // The server read is monotonic even if a reset/filter invalidated the original action's view.
        publish({ items: snapshot.items.map((value) => value.id === id && !value.readAt ? { ...value, readAt: confirmedAt } : value) });
      }
      if (request !== readVersion) {
        if (result.ok) await refreshCount();
        return { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } };
      }
      publish({ readingId: null });
      if (!result.ok) { if (result.error.kind === 'unauthorized') rejectAuthentication(); return result; }
      listVersion++;
      // Local confirmed timestamps only render success; the server retains its first readAt.
      publish({ loadingMore: false });
      await refreshCount();
      if (!current(session) || request !== readVersion) return { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } };
      return result;
    },
  };
}
function initial(state: InboxSnapshot['state']): InboxSnapshot {
  return { category: 'ALL', state, items: [], page: 0, hasMore: false, loadingMore: false,
    unreadCount: null, countError: null, loadMoreError: null, readingId: null };
}
export const inboxStore = createInboxStore({ session: sessionStore, service: messagesService,
  setUnreadDot: (visible) => { if (visible) wx.showTabBarRedDot({ index: 2 }); else wx.hideTabBarRedDot({ index: 2 }); } });
