import assert from 'node:assert/strict';
import test from 'node:test';
import { createMessagesPage } from '../miniprogram/pages/messages/index';
import { createInboxStore } from '../miniprogram/stores/inbox';
import type { InboxMessage } from '../miniprogram/services/messages';
import type { SessionSnapshot } from '../miniprogram/stores/session';
import type { AccountSummary } from '../miniprogram/services/auth';
import type { Result } from '../miniprogram/utils/result';

const item: InboxMessage = { id: '9007199254740993', category: 'SYSTEM', title: '系统通知', body: '<b>完整正文</b>', createdAt: '2026-10-09T08:00:00Z', readAt: null, targetType: 'NONE', targetId: null };
const tick = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
interface PageData extends Record<string, unknown> { detail: { body: string } | null; items: readonly unknown[]; state: string }
interface PageHarness { data: PageData; setData(value: Record<string, unknown>, callback?: () => void): void }
interface MessageDefinition {
  data: PageData;
  onLoad(this: PageHarness): void; onShow(this: PageHarness): void;
  onHide(this: PageHarness): void;
  retry(this: PageHarness): void; login(this: PageHarness): Promise<void>;
  openMessage(this: PageHarness, event: { currentTarget: { dataset: { id: string } } }): Promise<void>;
}
function fixture(message = item, initial = 'authenticated', loginResult?: Promise<Result<AccountSummary>>) {
  let auth: SessionSnapshot = initial === 'authenticated' ? { status: 'authenticated', account: { id: 1, displayName: '用户', avatarUrl: null, bindingStatus: 'LINKED' } } : { status: 'anonymous', account: null };
  const listeners = new Set<(value: SessionSnapshot) => void>(); let logins = 0; let reads = 0;
  const session = { getSnapshot: () => auth, subscribe: (listener: (value: SessionSnapshot) => void) => { listeners.add(listener); return () => listeners.delete(listener); }, login: async () => { logins++; return loginResult ?? { ok: false as const, error: { kind: 'unavailable' as const, code: 'WECHAT_LOGIN_UNAVAILABLE' } }; } };
  const store = createInboxStore({ session, setUnreadDot: () => {}, service: { list: async () => ({ ok: true, value: { items: [message], page: 1, pageSize: 20, totalItems: 1, totalPages: 1, unreadCount: 1 } }), unreadCount: async () => ({ ok: true, value: 1 }), markRead: async () => { reads++; return { ok: true, value: undefined }; } } });
  const routes: string[] = []; const errors: string[] = []; const scrolls: Array<string | null> = []; const rendered: Array<() => void> = [];
  const definition = createMessagesPage({ store, session, navigate: (route) => routes.push(route), toast: (value) => errors.push(value), scrollToDetail: () => scrolls.push(page.data.detail?.body ?? null) }) as unknown as MessageDefinition;
  const page: PageHarness = { ...definition, data: structuredClone(definition.data), setData(value, callback) { Object.assign(this.data, value); if (callback) rendered.push(callback); } };
  definition.onLoad.call(page); definition.onShow.call(page);
  return { definition, page, routes, errors, scrolls, rendered, reads: () => reads, logins: () => logins, logout() { auth = { status: 'anonymous', account: null }; listeners.forEach((listener) => listener(auth)); } };
}
const event = (id = item.id) => ({ currentTarget: { dataset: { id } } });

test('NONE opens full plain message inline after server read and logout clears detail', async () => {
  const f = fixture(); await tick(); await f.definition.openMessage.call(f.page, event());
  assert.equal(f.reads(), 1); assert.equal(f.page.data.detail?.body, '<b>完整正文</b>'); assert.deepEqual(f.routes, []);
  f.logout(); assert.equal(f.page.data.detail, null); assert.deepEqual(f.page.data.items, []);
});

test('opening NONE brings the full detail into view after its native render completes', async () => {
  const f = fixture(); await tick(); await f.definition.openMessage.call(f.page, event());
  assert.equal(f.reads(), 1); assert.deepEqual(f.scrolls, []);
  f.rendered.forEach((callback) => callback());
  assert.deepEqual(f.scrolls, ['<b>完整正文</b>']);
});

test('community messages navigate only to a validated registered community detail', async () => {
  const f = fixture({ ...item, category: 'COMMUNITY', targetType: 'COMMUNITY_POST', targetId: '9223372036854775807' }); await tick();
  await f.definition.openMessage.call(f.page, event('1&admin=1')); assert.equal(f.reads(), 0);
  await f.definition.openMessage.call(f.page, event()); assert.deepEqual(f.routes, ['/pages/circle-detail/index?id=9223372036854775807']);
  f.rendered.forEach((callback) => callback()); assert.deepEqual(f.scrolls, []);
  const unsafe = fixture({ ...item, category: 'COMMUNITY', targetType: 'COMMUNITY_POST', targetId: '1&admin=1' }); await tick(); await unsafe.definition.openMessage.call(unsafe.page, event()); assert.deepEqual(unsafe.routes, []);
});

test('unauthenticated show/retry never auto logs in; explicit login exposes login failure', async () => {
  const f = fixture(item, 'anonymous'); await tick(); f.definition.retry.call(f.page); await tick(); assert.equal(f.logins(), 0); assert.equal(f.page.data.state, 'unauthorized');
  await f.definition.login.call(f.page); assert.equal(f.logins(), 1); assert.equal(f.errors.length, 1); assert.equal(f.page.data.state, 'unauthorized');
});

test('login completed while hidden unlocks the login button when the cached tab returns', async () => {
  let finish!: (value: Result<AccountSummary>) => void;
  const pending = new Promise<Result<AccountSummary>>((resolve) => { finish = resolve; });
  const f = fixture(item, 'anonymous', pending); await tick();
  const login = f.definition.login.call(f.page); assert.equal(f.page.data.loggingIn, true);
  f.definition.onHide.call(f.page);
  finish({ ok: false, error: { kind: 'unavailable', code: 'WECHAT_LOGIN_UNAVAILABLE' } }); await login;
  f.definition.onShow.call(f.page); await tick(); assert.equal(f.page.data.loggingIn, false);
  assert.deepEqual(f.errors, []);
});

test('home university entry opens a regular page rather than calling native tab navigation', async () => {
  type HomeDefinition = { openFeature(event: { currentTarget: { dataset: { key: string } } }): void };
  let definition: HomeDefinition | undefined; const navigation: string[] = []; const switched: string[] = [];
  const host = globalThis as unknown as { Page?: (value: HomeDefinition) => void; wx?: { navigateTo(input: { url: string }): void; switchTab(input: { url: string }): void } };
  host.Page = (value) => { definition = value; };
  host.wx = { navigateTo: ({ url }) => navigation.push(url), switchTab: ({ url }) => switched.push(url) };
  await import('../miniprogram/pages/home/index');
  assert.ok(definition); definition.openFeature({ currentTarget: { dataset: { key: 'universities' } } });
  assert.deepEqual(navigation, ['/pages/universities/index']); assert.deepEqual(switched, []);
  delete host.Page; delete host.wx;
});
