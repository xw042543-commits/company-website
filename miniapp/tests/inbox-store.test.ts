import assert from 'node:assert/strict';
import test from 'node:test';
import { createInboxStore } from '../miniprogram/stores/inbox';
import type { SessionSnapshot } from '../miniprogram/stores/session';
import type { InboxMessage, InboxPage, MessagesService } from '../miniprogram/services/messages';
import type { Result } from '../miniprogram/utils/result';

function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const message = (id = '1', category: InboxMessage['category'] = 'SYSTEM'): InboxMessage => ({ id, category, title: '通知', body: '正文', createdAt: '2026-10-09T08:00:00Z', readAt: null, targetType: 'NONE', targetId: null });
const page = (items = [message()], pageNumber = 1, pages = 1): InboxPage => ({ items, page: pageNumber, pageSize: 20, totalItems: items.length, totalPages: pages, unreadCount: 1 });
function session(authenticated = true) {
  let snapshot: SessionSnapshot = authenticated ? account(1) : { status: 'anonymous', account: null };
  const listeners = new Set<(value: SessionSnapshot) => void>();
  return { getSnapshot: () => snapshot, subscribe: (listener: (value: SessionSnapshot) => void) => { listeners.add(listener); return () => listeners.delete(listener); }, publish(value: SessionSnapshot) { snapshot = value; listeners.forEach((listener) => listener(value)); } };
}
function account(id: number): SessionSnapshot { return { status: 'authenticated', account: { id, displayName: '用户', avatarUrl: null, bindingStatus: 'LINKED' } }; }
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function fixture(overrides: Partial<MessagesService> = {}, authenticated = true) {
  const auth = session(authenticated); const dots: boolean[] = [];
  const service: MessagesService = { list: async () => ok(page()), unreadCount: async () => ok(1), markRead: async () => ok(undefined), ...overrides };
  const store = createInboxStore({ session: auth, service, setUnreadDot: (visible) => { dots.push(visible); } });
  store.start(); return { store, auth, dots };
}

test('anonymous inbox requests no private data and prompts login rather than auto login', async () => {
  let calls = 0; const { store } = fixture({ list: async () => { calls++; return ok(page()); } }, false);
  await store.show(); assert.equal(calls, 0); assert.equal(store.getSnapshot().state, 'unauthorized'); assert.deepEqual(store.getSnapshot().items, []);
});

test('latest filter wins when the earlier category completes late', async () => {
  const pending = [deferred<Result<InboxPage>>(), deferred<Result<InboxPage>>()]; let calls = 0;
  const { store } = fixture({ list: () => pending[calls++]!.promise });
  const first = store.show(); const second = store.selectCategory('APPLICATION');
  pending[1]!.resolve(ok(page([message('2', 'APPLICATION')]))); await second;
  pending[0]!.resolve(ok(page([message('1')]))); await first;
  assert.equal(store.getSnapshot().category, 'APPLICATION'); assert.deepEqual(store.getSnapshot().items.map((item) => item.id), ['2']);
});

test('loadmore deduplicates items and maintains server chronological order', async () => {
  const { store } = fixture({ list: async ({ page: number }) => ok(number === 1 ? page([message('3'), message('2')], 1, 2) : page([message('2'), message('1')], 2, 2)) });
  await store.show(); await store.loadMore(); assert.deepEqual(store.getSnapshot().items.map((item) => item.id), ['3', '2', '1']); assert.equal(store.getSnapshot().hasMore, false);
});

test('account switch clears rows/details immediately and discards old list/count/read responses', async () => {
  const oldList = deferred<Result<InboxPage>>(), newList = deferred<Result<InboxPage>>();
  const oldCount = deferred<Result<number>>(), newCount = deferred<Result<number>>();
  const read = deferred<Result<void>>(); let listCalls = 0, countCalls = 0;
  const { store, auth, dots } = fixture({ list: async () => ++listCalls === 1 ? ok(page()) : listCalls === 2 ? oldList.promise : newList.promise,
    unreadCount: () => ++countCalls < 4 ? oldCount.promise : newCount.promise, markRead: () => read.promise });
  await store.show(); const reading = store.markRead('1'); const refreshing = store.refresh();
  auth.publish(account(2)); assert.deepEqual(store.getSnapshot().items, []); assert.equal(store.getSnapshot().unreadCount, null);
  oldList.resolve(ok(page([message('7')]))); oldCount.resolve(ok(99)); read.resolve(ok(undefined)); await reading; await refreshing; await tick();
  assert.deepEqual(store.getSnapshot().items, []); assert.equal(store.getSnapshot().unreadCount, null);
  newList.resolve(ok(page([message('8')]))); newCount.resolve(ok(2)); await tick();
  assert.deepEqual(store.getSnapshot().items.map((item) => item.id), ['8']); assert.equal(store.getSnapshot().items[0]?.readAt, null); assert.equal(store.getSnapshot().unreadCount, 2);
  auth.publish({ status: 'anonymous', account: null }); assert.deepEqual(store.getSnapshot().items, []); assert.equal(dots.at(-1), false);
});

test('a late loadmore cannot overwrite a successfully read row with its old unread copy', async () => {
  const more = deferred<Result<InboxPage>>(); let calls = 0;
  const { store } = fixture({ list: async () => ++calls === 1 ? ok(page([message()], 1, 2)) : more.promise });
  await store.show(); const continuation = store.loadMore(); await store.markRead('1');
  more.resolve(ok(page([message()], 2, 2))); await continuation;
  assert.notEqual(store.getSnapshot().items[0]?.readAt, null); assert.equal(store.getSnapshot().loadingMore, false);
});

test('reset refresh completes even when an earlier pending read settles during loading', async () => {
  const reading = deferred<Result<void>>(), reset = deferred<Result<InboxPage>>(); let calls = 0;
  const { store } = fixture({ list: async () => ++calls === 1 ? ok(page()) : reset.promise, markRead: () => reading.promise });
  await store.show(); const read = store.markRead('1'); const refresh = store.refresh();
  reading.resolve(ok(undefined)); await read;
  reset.resolve(ok(page([message('2')]))); await refresh;
  assert.equal(store.getSnapshot().state, 'ready'); assert.deepEqual(store.getSnapshot().items.map((item) => item.id), ['2']);
});

test('a stale reset response for the same ID cannot revert a server-confirmed read', async () => {
  const reading = deferred<Result<void>>(), reset = deferred<Result<InboxPage>>(); let calls = 0;
  const { store } = fixture({ list: async () => ++calls === 1 ? ok(page()) : reset.promise,
    markRead: () => reading.promise, unreadCount: async () => ok(0) });
  await store.show(); const read = store.markRead('1'); const refresh = store.refresh();
  reading.resolve(ok(undefined)); await read;
  reset.resolve(ok(page([message('1')]))); await refresh;
  assert.equal(store.getSnapshot().state, 'ready'); assert.equal(store.getSnapshot().unreadCount, 0);
  assert.notEqual(store.getSnapshot().items[0]?.readAt, null);
});

test('unauthorized count refresh clears private rows and badge instead of preserving cached content', async () => {
  let denied = false;
  const { store, dots } = fixture({ unreadCount: async () => denied ? { ok: false, error: { kind: 'unauthorized', code: 'AUTHENTICATION_REQUIRED' } } : ok(1) });
  await store.show(); denied = true; await store.refreshCount();
  assert.equal(store.getSnapshot().state, 'unauthorized'); assert.deepEqual(store.getSnapshot().items, []); assert.equal(dots.at(-1), false);
});

test('server read persists before local read state and refreshes authoritative count', async () => {
  let counts = 0; const read = deferred<Result<void>>();
  const { store, dots } = fixture({ markRead: () => read.promise, unreadCount: async () => ok(++counts < 3 ? 1 : 0) });
  await store.show(); const reading = store.markRead('1'); assert.equal(store.getSnapshot().items[0]?.readAt, null);
  read.resolve(ok(undefined)); await reading; assert.notEqual(store.getSnapshot().items[0]?.readAt, null); assert.equal(store.getSnapshot().unreadCount, 0); assert.equal(dots.at(-1), false);
});

test('read/count failures retain unread state instead of fabricating success', async () => {
  const failure: Result<never> = { ok: false, error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' } };
  const { store, dots } = fixture({ markRead: async () => failure });
  await store.show(); assert.equal((await store.markRead('1')).ok, false); assert.equal(store.getSnapshot().items[0]?.readAt, null); assert.equal(dots.at(-1), true);
  const another = fixture({ unreadCount: async () => failure }); await another.store.show();
  assert.equal(another.store.getSnapshot().countError?.kind, 'unavailable'); assert.equal(another.store.getSnapshot().unreadCount, 1); // list count remains authoritative
});

test('list auth and network failures have distinct states from a successful empty inbox', async () => {
  for (const [kind, expected] of [['unauthorized', 'unauthorized'], ['unavailable', 'offline'], ['unexpected', 'failed']] as const) {
    const { store } = fixture({ list: async () => ({ ok: false, error: { kind, code: 'ERROR' } }) }); await store.show(); assert.equal(store.getSnapshot().state, expected);
  }
  const { store } = fixture({ list: async () => ok({ ...page([]), totalItems: 0, totalPages: 0, unreadCount: 0 }) }); await store.show(); assert.equal(store.getSnapshot().state, 'empty');
});

test('late count before a read cannot restore the obsolete unread badge', async () => {
  const stale = deferred<Result<number>>(); let calls = 0;
  const { store, dots } = fixture({ unreadCount: async () => ++calls === 1 ? stale.promise : ok(0) });
  await store.show(); await store.markRead('1'); stale.resolve(ok(9)); await tick(); assert.equal(store.getSnapshot().unreadCount, 0); assert.equal(dots.at(-1), false);
});
