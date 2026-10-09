/* eslint-disable @typescript-eslint/no-explicit-any -- Native Page definitions are intentionally exercised through a dynamic lifecycle harness. */
import assert from 'node:assert/strict';
import test from 'node:test';

type Result<T> = { ok: true; value: T } | { ok: false; error: { kind: string; code: string } };
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const deferred = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; };
Object.defineProperty(globalThis, 'Page', { configurable: true, value: () => undefined });
Object.defineProperty(globalThis, 'wx', { configurable: true, value: {
  showToast: () => undefined, stopPullDownRefresh: () => undefined, showLoading: () => undefined, hideLoading: () => undefined,
  navigateTo: () => undefined, redirectTo: () => undefined, reLaunch: () => undefined,
} });

function context(definition: any, data = {}) {
  const value: any = { ...definition, data: { ...definition.data, ...data }, setData(update: any, done?: () => void) { Object.assign(this.data, update); done?.(); } };
  return value;
}

test('feed lifecycle refreshes once after authentication and invalidates unloaded requests', async () => {
  const module = await import('../miniprogram/pages/circle/index.ts');
  const requests: Array<ReturnType<typeof deferred<Result<any>>>> = [];
  let listener: ((value: any) => void) | undefined;
  let unsubscribed = false;
  const definition: any = module.createCirclePage({
    listPosts: () => { const request = deferred<Result<any>>(); requests.push(request); return request.promise; },
    session: { getSnapshot: () => ({ status: 'anonymous', account: null }), subscribe: (next: any) => { listener = next; return () => { unsubscribed = true; }; }, ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition);
  definition.onLoad.call(page);
  assert.equal(requests.length, 1);
  definition.onShow.call(page);
  assert.equal(requests.length, 1);
  listener?.({ status: 'authenticated', account: { id: '1' } });
  assert.equal(requests.length, 2);
  listener?.({ status: 'authenticated', account: { id: '1' } });
  assert.equal(requests.length, 2);
  definition.onUnload.call(page);
  assert.equal(unsubscribed, true);
  requests[1]!.resolve(ok({ items: [{ id: '2' }], nextCursor: null }));
  await requests[1]!.promise;
  await Promise.resolve();
  assert.deepEqual(page.data.posts, []);
});

test('detail instances isolate ids, refresh state, ownership and idempotency fingerprints', async () => {
  const module = await import('../miniprogram/pages/circle-detail/index.ts');
  const postIds: string[] = [];
  const commentCalls: any[] = [];
  const created: any[] = [];
  const reports: any[] = [];
  const definition: any = module.createCircleDetailPage({
    loadPost: async (id: string) => { postIds.push(id); return ok({ id, authorName: '用户', authorAvatarUrl: null, body: '正文', commentCount: 0, likeCount: 0, publishedAt: '2026-10-08T00:00:00Z', likedByMe: false, ownedByMe: id === '1' }); },
    listComments: async (input: any) => { commentCalls.push(input); return ok({ items: [], nextCursor: null }); },
    createComment: async (input: any) => { created.push(input); return { ok: false, error: { kind: 'unavailable', code: 'OFFLINE' } }; },
    report: async (input: any) => { reports.push(input); return { ok: false, error: { kind: 'unavailable', code: 'OFFLINE' } }; },
    session: { getSnapshot: () => ({ status: 'authenticated', account: { id: 'a' } }), subscribe: () => () => {}, ensureAuthenticated: async () => ok({}) },
    createKey: (() => { let n = 0; return () => `key-${++n}`; })(),
  } as any);
  const first = context(definition); const second = context(definition);
  definition.onLoad.call(first, { id: '1' }); definition.onLoad.call(second, { id: '2' });
  await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(postIds.sort(), ['1', '2']);
  assert.equal(first.data.ownerPost, true); assert.equal(second.data.ownerPost, false);
  first.data.commentBody = '第一版'; first.data.replyParentId = null;
  await definition.submitComment.call(first);
  first.data.commentBody = '第二版';
  await definition.submitComment.call(first);
  assert.notEqual(created[0].idempotencyKey, created[1].idempotencyKey);
  await definition.submitComment.call(first);
  assert.equal(created[1].idempotencyKey, created[2].idempotencyKey);
  first.data.replyParentId = '8';
  await definition.submitComment.call(first);
  assert.notEqual(created[2].idempotencyKey, created[3].idempotencyKey);
  assert.equal(created[0].postId, '1'); assert.equal(created[1].postId, '1');
  definition.openReport.call(first, { currentTarget: { dataset: { id: '1', type: 'POST' } } });
  await definition.submitReport.call(first);
  definition.chooseReportReason.call(first, { currentTarget: { dataset: { reason: 'SCAM' } } });
  await definition.submitReport.call(first);
  assert.notEqual(reports[0].idempotencyKey, reports[1].idempotencyKey);
});

test('detail refreshes personalized ownership once when the session becomes authenticated', async () => {
  const module = await import('../miniprogram/pages/circle-detail/index.ts');
  let listener: ((value: any) => void) | undefined;
  let postCalls = 0; let commentCalls = 0; let unsubscribed = false;
  const definition: any = module.createCircleDetailPage({
    loadPost: async (id: string) => { postCalls++; return ok({ id, authorName: '用户', authorAvatarUrl: null, body: '正文', commentCount: 0, likeCount: 0, publishedAt: '2026-10-08T00:00:00Z', likedByMe: postCalls > 1, ownedByMe: postCalls > 1 }); },
    listComments: async () => { commentCalls++; return ok({ items: [], nextCursor: null }); },
    session: { getSnapshot: () => ({ status: 'anonymous', account: null }), subscribe: (next: any) => { listener = next; return () => { unsubscribed = true; }; }, ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition);
  definition.onLoad.call(page, { id: '1' });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(postCalls, 1); assert.equal(commentCalls, 1); assert.equal(page.data.ownerPost, false);
  listener?.({ status: 'authenticated', account: { id: 'viewer' } });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(postCalls, 2); assert.equal(commentCalls, 2); assert.equal(page.data.ownerPost, true);
  listener?.({ status: 'authenticated', account: { id: 'viewer' } });
  assert.equal(postCalls, 2); assert.equal(commentCalls, 2);
  definition.onUnload.call(page);
  assert.equal(unsubscribed, true);
});

test('reply continuation preserves DTO ownership and ignores a response after unload', async () => {
  const module = await import('../miniprogram/pages/circle-detail/index.ts');
  const pending = deferred<Result<any>>();
  const root = { id: '10', authorName: '用户', authorAvatarUrl: null, body: '根评论', createdAt: '2026-10-08T00:00:00Z', likeCount: 0, likedByMe: false, ownedByMe: false, replies: [], repliesNextCursor: 'reply.cursor' };
  const definition: any = module.createCircleDetailPage({
    loadPost: async (id: string) => ok({ id, authorName: '用户', authorAvatarUrl: null, body: '正文', commentCount: 1, likeCount: 0, publishedAt: '2026-10-08T00:00:00Z', likedByMe: false, ownedByMe: false }),
    listComments: async () => ok({ items: [root], nextCursor: null }),
    listReplies: () => pending.promise,
    session: { getSnapshot: () => ({ status: 'anonymous', account: null }), subscribe: () => () => {}, ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition); definition.onLoad.call(page, { id: '1' });
  await Promise.resolve(); await Promise.resolve();
  void definition.loadMoreReplies.call(page, { currentTarget: { dataset: { parent: '10' } } });
  definition.onUnload.call(page);
  pending.resolve(ok({ items: [{ ...root, id: '11', body: '回复', ownedByMe: true, replies: [], repliesNextCursor: null }], nextCursor: null }));
  await pending.promise; await Promise.resolve();
  assert.deepEqual(page.data.comments[0].replies, []);
});

test('hot expiry restarts from page one and applies only the restarted result', async () => {
  const module = await import('../miniprogram/pages/circle/index.ts');
  const calls: any[] = [];
  let hotFirst = true;
  const definition: any = module.createCirclePage({
    listPosts: async (input: any) => {
      calls.push(input);
      if (input.sort === 'latest') return ok({ items: [], nextCursor: null });
      if (input.cursor) return { ok: false, error: { kind: 'unexpected', code: 'COMMUNITY_HOT_SNAPSHOT_EXPIRED' } };
      if (hotFirst) { hotFirst = false; return ok({ items: [{ id: '1' }], nextCursor: 'signed.cursor' }); }
      return ok({ items: [{ id: '2' }], nextCursor: null });
    },
    session: { getSnapshot: () => ({ status: 'anonymous', account: null }), subscribe: () => () => {}, ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition);
  definition.onLoad.call(page); await Promise.resolve(); await Promise.resolve();
  definition.switchSort.call(page, { currentTarget: { dataset: { sort: 'hot' } } });
  await Promise.resolve(); await Promise.resolve();
  definition.onReachBottom.call(page);
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(page.data.posts, [{ id: '2' }]);
  assert.equal(calls.filter((call) => call.sort === 'hot' && call.cursor === null).length, 2);
});

test('detail refresh clears the cursor immediately and stale continuation cannot replace page one', async () => {
  const module = await import('../miniprogram/pages/circle-detail/index.ts');
  const pending: Array<ReturnType<typeof deferred<Result<any>>>> = [];
  let calls = 0;
  const definition: any = module.createCircleDetailPage({
    loadPost: async (id: string) => ok({ id, authorName: '用户', authorAvatarUrl: null, body: '正文', commentCount: 0, likeCount: 0, publishedAt: '2026-10-08T00:00:00Z', likedByMe: false, ownedByMe: false }),
    listComments: () => { calls++; if (calls === 1) return Promise.resolve(ok({ items: [], nextCursor: null })); const item = deferred<Result<any>>(); pending.push(item); return item.promise; },
    session: { getSnapshot: () => ({ status: 'anonymous', account: null }), subscribe: () => () => {}, ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition); definition.onLoad.call(page, { id: '1' });
  await Promise.resolve(); await Promise.resolve();
  Object.assign(page.data, { commentsState: 'ready', commentsCursor: 'old.cursor', comments: [{ id: 'old' }], loadingMoreComments: false });
  void definition.loadComments.call(page, false);
  definition.onPullDownRefresh.call(page);
  assert.equal(page.data.commentsCursor, null);
  definition.onReachBottom.call(page);
  assert.equal(calls, 3);
  pending[1]!.resolve(ok({ items: [{ id: 'new', authorName: '用户', authorAvatarUrl: null, body: '新', createdAt: '2026-10-08T00:00:00Z', likeCount: 0, likedByMe: false, ownedByMe: false, replies: [], repliesNextCursor: null }], nextCursor: null }));
  await pending[1]!.promise; await Promise.resolve();
  pending[0]!.resolve(ok({ items: [{ id: 'stale' }], nextCursor: null }));
  await pending[0]!.promise; await Promise.resolve();
  assert.equal(page.data.comments[0].id, 'new');
});

test('personal tab switch executes the matching service and resets paging', async () => {
  const module = await import('../miniprogram/pages/circle-me/index.ts');
  let postCalls = 0; let commentCalls = 0;
  const definition: any = module.createCircleMePage({
    listPosts: async () => { postCalls++; return ok({ items: [], nextCursor: null }); },
    listComments: async () => { commentCalls++; return ok({ items: [], nextCursor: null }); },
    session: { getSnapshot: () => ({ status: 'authenticated', account: {} }), ensureAuthenticated: async () => ok({}) },
  } as any);
  const page = context(definition); definition.onLoad.call(page); await Promise.resolve(); await Promise.resolve();
  definition.switchTab.call(page, { currentTarget: { dataset: { tab: 'comments' } } });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(postCalls, 1); assert.equal(commentCalls, 1); assert.equal(page.data.tab, 'comments');
});

test('personal nonpublic content does not navigate to a public detail', async () => {
  const module = await import('../miniprogram/pages/circle-me/index.ts');
  const navigated: string[] = [];
  const definition: any = module.createCircleMePage({ navigate: (url: string) => navigated.push(url) });
  const page = context(definition, { tab: 'posts', posts: [{ id: '9', status: 'HIDDEN' }] });
  definition.openItem.call(page, { currentTarget: { dataset: { id: '9', status: 'HIDDEN' } } });
  assert.deepEqual(navigated, []);
  definition.openItem.call(page, { currentTarget: { dataset: { id: '9', status: 'PUBLISHED' } } });
  assert.equal(navigated.length, 1);
});
