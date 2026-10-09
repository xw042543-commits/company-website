import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCommunityService, createSubmissionKey, parsePostPage, parsePostDetail,
  parseCommentPage, parseReplyPage, parseCreationResponse, parseReportResponse,
  parseMyPostPage, parseMyCommentPage,
} from '../miniprogram/services/community.ts';
import { createHttpClient, type RequestOptions, type TransportOptions } from '../miniprogram/services/http.ts';
import { resolveRuntimeConfig } from '../miniprogram/config/runtime.ts';
import type { Result } from '../miniprogram/utils/result.ts';

const id = '9007199254740993';
const time = '2026-10-08T00:00:00.123456Z';
const cursor = `eyJhIjoxfQ.${'A'.repeat(43)}`;
const scope = 'test-scope';
const summary = { id, authorName: '微信用户', authorAvatarUrl: null, bodyPreview: '😀', commentCount: 0, likeCount: 1, publishedAt: time, likedByMe: false };
const detail = { id, authorName: '微信用户', authorAvatarUrl: 'https://example.test/avatar.png', body: '正文', commentCount: 0, likeCount: 1, publishedAt: time, likedByMe: false, ownedByMe: false };
const reply = { id: '2', authorName: '昵称', authorAvatarUrl: null, body: '回复', createdAt: time, likeCount: 0, likedByMe: true, ownedByMe: false, replies: [], repliesNextCursor: null };
const comment = { ...reply, id: '1', replies: [reply, { ...reply, id: '3' }, { ...reply, id: '4' }], repliesNextCursor: cursor };
const creation = { id, postId: null, parentCommentId: null, body: '正文', status: 'PUBLISHED', createdAt: time, publishedAt: time };
const report = { id, targetType: 'POST', targetId: id, status: 'OPEN', createdAt: time };
const mine = { id, body: '正文', status: 'HIDDEN', statusMessage: '内容暂不可公开展示', createdAt: time, publishedAt: null, commentCount: 0, likeCount: 1 };
const myComment = { id, postId: '1', parentCommentId: null, body: '正文', status: 'DELETED', statusMessage: '已删除', createdAt: time, likeCount: 0 };
const page = (item: unknown) => ({ items: [item], nextCursor: null });
const invalid = { ok: false, error: { kind: 'unexpected', code: 'INVALID_COMMUNITY_RESPONSE' } };
type Parser = (value: unknown) => Result<unknown>;

for (const [name, parse, fixture] of [['posts', parseMyPostPage, mine], ['comments', parseMyCommentPage, myComment]] as const) {
  test(`community personal ${name} only accepts each approved status and its exact safe label`, () => {
    const labels = [
      ['PUBLISHED', '已发布'], ['PENDING_REVIEW', '审核中'], ['HIDDEN', '内容暂不可公开展示'],
      ['DELETED', '已删除'], ['REJECTED', '内容未通过审核'],
    ] as const;
    for (const [status, statusMessage] of labels) {
      const value = page({ ...fixture, status, statusMessage });
      assert.deepEqual(parse(value), { ok: true, value });
      for (const bad of ['private moderation reason', `${statusMessage} `, ...labels.map(([, label]) => label).filter((label) => label !== statusMessage)])
        assert.deepEqual(parse(page({ ...fixture, status, statusMessage: bad })), invalid);
    }
  });
}

test('community cursors reject nonzero payload pad bits in every page and reply preview without decoding contents', async () => {
  const signature = 'A'.repeat(43);
  const parsers = [parsePostPage, parseCommentPage, parseReplyPage, parseMyPostPage, parseMyCommentPage];
  const service = createCommunityService(async () => ({ ok: true, value: { items: [], nextCursor: null } }));
  for (const payload of ['AB', 'A_', 'AAB', 'AA_', 'A']) {
    const bad = `${payload}.${signature}`;
    for (const parse of parsers) assert.deepEqual(parse({ items: [], nextCursor: bad }), invalid);
    assert.deepEqual(parseCommentPage(page({ ...comment, repliesNextCursor: bad })), invalid);
    assert.deepEqual(await service.listPosts({ sort: 'latest', cursor: bad, requestScope: scope }), { ok: false, error: { kind: 'validation', code: 'INVALID_COMMUNITY_INPUT' } });
  }
  // Backend keyset fields and HMAC-SHA256 with the integration-test secret; contents remain opaque here.
  const backendCursor = 'eyJ0aW1lc3RhbXAiOiIyMDI2LTEwLTA4VDAwOjAwWiIsImlkIjoiMSIsInNvcnQiOiJsYXRlc3QiLCJleHBpcmVzQXQiOiIyMDI2LTEwLTA5VDAwOjAwWiJ9.hkbc3FEw7GCuPU3VgnskHne3Gom21gJTuLx7aecYKL8';
  for (const good of [cursor, backendCursor, ...['AA', 'AAA', 'AAAA', '_w', '__8'].map((payload) => `${payload}.${signature}`)]) {
    const value = { items: [], nextCursor: good };
    for (const parse of parsers) assert.deepEqual(parse(value), { ok: true, value });
    assert.equal((await service.listPosts({ sort: 'latest', cursor: good, requestScope: scope })).ok, true);
  }
  for (const badSignature of [signature.slice(1), signature + 'A', 'A'.repeat(42) + 'B'])
    assert.deepEqual(parsePostPage({ items: [], nextCursor: `AA.${badSignature}` }), invalid);
});

for (const finalStatus of [200, 401] as const) {
  test(`community authenticated public reads refresh once after 401 and retry with the new memory token before ${finalStatus}`, async () => {
    for (const route of ['feed', 'detail', 'comments', 'replies'] as const) {
      let token = 'expired';
      let refreshes = 0;
      const requests: TransportOptions[] = [];
      const value = route === 'detail' ? { ...detail, likedByMe: true } : { items: [], nextCursor: null };
      const client = createHttpClient(resolveRuntimeConfig('production'), (options) => {
        requests.push(options);
        options.success({ statusCode: requests.length === 1 ? 401 : finalStatus,
          data: requests.length === 1 || finalStatus === 401 ? { code: 'UNAUTHORIZED', message: 'private token reason', traceId: 'private' } : value,
          header: {}, cookies: [] });
        return { abort() {} };
      }, () => token, async () => { refreshes++; token = 'refreshed'; return true; });
      const service = createCommunityService(client.request, () => true);
      const result = route === 'feed' ? await service.listPosts({ sort: 'latest', requestScope: scope }) : route === 'detail' ? await service.loadPost(id, scope)
        : route === 'comments' ? await service.listComments({ postId: id, requestScope: scope }) : await service.listReplies({ postId: id, parentCommentId: '1', requestScope: scope });
      assert.deepEqual(result, finalStatus === 200 ? { ok: true, value } : { ok: false, error: { kind: 'unauthorized', code: 'AUTHENTICATION_REQUIRED' } });
      assert.equal(refreshes, 1, route);
      assert.equal(requests.length, 2, route);
      assert.deepEqual(requests.map((request) => request.header.Authorization), ['Bearer expired', 'Bearer refreshed']);
      assert.equal(requests[0]?.url, requests[1]?.url);
    }
  });
}

for (const [name, parse, fixture] of [
  ['post page', parsePostPage, page(summary)], ['detail', parsePostDetail, detail],
  ['comments', parseCommentPage, page(comment)], ['replies', parseReplyPage, page(reply)],
  ['creation', parseCreationResponse, creation], ['report', parseReportResponse, report],
  ['my posts', parseMyPostPage, page(mine)], ['my comments', parseMyCommentPage, page(myComment)],
] as const) {
  test(`community ${name} preserves the actual DTO and exact large string IDs`, () => {
    assert.deepEqual(parse(fixture), { ok: true, value: fixture });
  });
  test(`community ${name} rejects every missing and extra field at every object level`, () => {
    const visit = (root: unknown, path: Array<string | number> = []) => {
      if (Array.isArray(root)) { root.forEach((child, i) => visit(child, [...path, i])); return; }
      if (root === null || typeof root !== 'object') return;
      const record = root as Record<string, unknown>;
      for (const field of [...Object.keys(record), 'privateAccountId']) {
        const mutated = structuredClone(fixture);
        let object = mutated as unknown;
        for (const key of path) object = (object as Record<string | number, unknown>)[key];
        const target = object as Record<string, unknown>;
        if (field === 'privateAccountId') target[field] = '123'; else delete target[field];
        assert.deepEqual((parse as Parser)(mutated), invalid, `${name}: ${path.join('.')}.${field}`);
      }
      Object.entries(record).forEach(([key, child]) => visit(child, [...path, key]));
    };
    visit(fixture);
    for (const bad of [null, [], 1, 'bad', true]) assert.deepEqual((parse as Parser)(bad), invalid);
  });
  test(`community ${name} rejects wrong JSON types throughout the DTO`, () => {
    const visit = (root: unknown, path: Array<string | number> = []) => {
      if (Array.isArray(root)) { root.forEach((child, i) => visit(child, [...path, i])); return; }
      if (root === null || typeof root !== 'object') return;
      for (const [field, value] of Object.entries(root)) {
        const wrong: unknown[] = typeof value === 'string' ? [false, 1, {}, []]
          : typeof value === 'number' ? [false, '1', null, -1, 1.1]
            : typeof value === 'boolean' ? [0, 'false', null] : [false, 1, {}, ''];
        for (const bad of wrong) {
          const mutated = structuredClone(fixture);
          let object = mutated as unknown;
          for (const key of path) object = (object as Record<string | number, unknown>)[key];
          (object as Record<string, unknown>)[field] = bad;
          assert.deepEqual((parse as Parser)(mutated), invalid, `${name}: wrong type at ${path.join('.')}.${field}`);
        }
        if (value !== null && typeof value === 'object') visit(value, [...path, field]);
      }
    };
    visit(fixture);
  });
}

test('community rejects noncanonical and out of range decimal IDs in all coordinate fields', () => {
  for (const bad of [1, 9007199254740992, '0', '-1', '+1', '01', ' 1', '1 ', '1.0', '1e3', '1/like', '１', '9223372036854775808']) {
    for (const fixture of [summary, detail, reply, creation, report, mine, myComment]) {
      const parse: Parser = fixture === summary ? (v) => parsePostPage(page(v)) : fixture === detail ? parsePostDetail
        : fixture === reply ? (v) => parseReplyPage(page(v)) : fixture === creation ? parseCreationResponse
          : fixture === report ? parseReportResponse : fixture === mine ? (v) => parseMyPostPage(page(v)) : (v) => parseMyCommentPage(page(v));
      assert.deepEqual(parse({ ...fixture, id: bad }), invalid);
    }
    assert.deepEqual(parseCreationResponse({ ...creation, postId: bad }), invalid);
    assert.deepEqual(parseCreationResponse({ ...creation, postId: '1', parentCommentId: bad }), invalid);
    assert.deepEqual(parseMyCommentPage(page({ ...myComment, postId: bad })), invalid);
    assert.deepEqual(parseMyCommentPage(page({ ...myComment, parentCommentId: bad })), invalid);
    assert.deepEqual(parseReportResponse({ ...report, targetId: bad }), invalid);
  }
});

test('community rejects invalid ISO dates, coerced counters, wrong booleans and malicious avatars', () => {
  for (const bad of [null, 1, '2026-10-08', '2026-02-30T00:00:00Z', '2026-13-01T00:00:00Z', '2026-10-08T24:00:00Z', '2026-10-08T00:00:00', '2026-10-08T00:00:00+25:00', 'invalid']) {
    assert.deepEqual(parsePostDetail({ ...detail, publishedAt: bad }), invalid);
    assert.deepEqual(parseCommentPage(page({ ...reply, createdAt: bad })), invalid);
    assert.deepEqual(parseCreationResponse({ ...creation, createdAt: bad }), invalid);
    assert.deepEqual(parseReportResponse({ ...report, createdAt: bad }), invalid);
    assert.deepEqual(parseMyPostPage(page({ ...mine, createdAt: bad })), invalid);
  }
  for (const field of ['likeCount', 'commentCount']) for (const bad of ['1', -1, 1.1, NaN, Infinity, 2147483648, null])
    assert.deepEqual(parsePostDetail({ ...detail, [field]: bad }), invalid);
  for (const bad of [null, 'false', 0]) assert.deepEqual(parsePostDetail({ ...detail, likedByMe: bad }), invalid);
  for (const bad of ['http://example.test/a', 'javascript:alert(1)', '//example.test/a', '/assets/fake.png', 'https://a.test@evil.test/a', 'https://a.test\\evil.test/a', 'https://a.test/%0aX', 'https://a.test/<script>', 'https://a.test\n/a', 'https:///a', 'https://a.test:99999/a', 'https://a.test/' + 'a'.repeat(2048), 1]) {
    assert.deepEqual(parsePostDetail({ ...detail, authorAvatarUrl: bad }), invalid);
    assert.deepEqual(parseCommentPage(page({ ...reply, authorAvatarUrl: bad })), invalid);
  }
  assert.equal(parsePostDetail({ ...detail, authorAvatarUrl: null }).ok, true);
  assert.equal(parsePostDetail({ ...detail, publishedAt: '2026-10-08T08:00:00+08:00' }).ok, true);
});

test('community rejects oversized pages, malformed cursors, nested replies, text and wrong enums', () => {
  for (const parse of [parsePostPage, parseCommentPage, parseReplyPage, parseMyPostPage, parseMyCommentPage]) {
    const item = parse === parsePostPage ? summary : parse === parseMyPostPage ? mine : parse === parseMyCommentPage ? myComment : reply;
    assert.deepEqual(parse({ items: Array.from({ length: 51 }, () => item), nextCursor: null }), invalid);
    for (const bad of [1, '', 'bad', 'a'.repeat(4097), cursor + '!']) assert.deepEqual(parse({ ...page(item), nextCursor: bad }), invalid);
  }
  assert.deepEqual(parseCommentPage(page({ ...comment, replies: [reply, reply, reply, reply] })), invalid);
  assert.deepEqual(parseReplyPage(page(comment)), invalid);
  assert.deepEqual(parseCommentPage(page({ ...comment, replies: [{ ...reply, replies: [reply] }] })), invalid);
  assert.deepEqual(parseCommentPage(page({ ...reply, repliesNextCursor: cursor })), invalid);
  for (const bad of [null, 1, '', '😀'.repeat(201)]) assert.deepEqual(parsePostPage(page({ ...summary, bodyPreview: bad })), invalid);
  assert.deepEqual(parsePostDetail({ ...detail, body: '😀'.repeat(2001) }), invalid);
  assert.deepEqual(parseCommentPage(page({ ...reply, body: '😀'.repeat(1001) })), invalid);
  assert.deepEqual(parsePostDetail({ ...detail, authorName: '' }), invalid);
  for (const bad of ['published', 'UNKNOWN', 1, null]) {
    assert.deepEqual(parseCreationResponse({ ...creation, status: bad }), invalid);
    assert.deepEqual(parseMyPostPage(page({ ...mine, status: bad })), invalid);
    assert.deepEqual(parseMyCommentPage(page({ ...myComment, status: bad })), invalid);
  }
  for (const bad of ['post', 0, null]) assert.deepEqual(parseReportResponse({ ...report, targetType: bad }), invalid);
  for (const bad of ['RESOLVED', 0, null]) assert.deepEqual(parseReportResponse({ ...report, status: bad }), invalid);
  assert.deepEqual(parseCreationResponse({ ...creation, parentCommentId: '1' }), invalid);
  assert.deepEqual(parseCreationResponse({ ...creation, postId: '1' }), invalid); // comments have null publishedAt
  assert.equal(parseCreationResponse({ ...creation, status: 'PENDING_REVIEW', publishedAt: null }).ok, true);
});

test('community service uses real paths, stable per-sort keys and independent detail/comment/reply scopes', async () => {
  const options: RequestOptions[] = [];
  const service = createCommunityService(async (input) => {
    options.push(input);
    return { ok: true, value: input.path.endsWith(`/${id}`) ? detail : { items: [], nextCursor: null } };
  }, () => true);
  await service.listPosts({ sort: 'latest', cursor: null, size: 20, requestScope: scope });
  await service.listPosts({ sort: 'latest', cursor, size: 20, requestScope: scope });
  await service.listPosts({ sort: 'hot', cursor: null, size: 20, requestScope: scope });
  await service.loadPost(id, scope);
  await service.loadPost('2', scope);
  await service.listComments({ postId: id, cursor, size: 20, requestScope: scope });
  await service.listReplies({ postId: id, parentCommentId: '2', cursor: null, size: 50, requestScope: scope });
  await service.listMyPosts({ cursor: null, size: 20, requestScope: scope });
  await service.listMyComments({ cursor: null, size: 20, requestScope: scope });
  assert.deepEqual(options.map((o) => o.path), [
    '/api/v1/community/posts?sort=latest&size=20', `/api/v1/community/posts?sort=latest&size=20&cursor=${encodeURIComponent(cursor)}`,
    '/api/v1/community/posts?sort=hot&size=20', `/api/v1/community/posts/${id}`, '/api/v1/community/posts/2',
    `/api/v1/community/posts/${id}/comments?size=20&cursor=${encodeURIComponent(cursor)}`,
    `/api/v1/community/posts/${id}/comments/2/replies?size=50`, '/api/v1/community/me/posts?size=20', '/api/v1/community/me/comments?size=20',
  ]);
  assert.equal(options[0]?.requestKey, `community-feed:${scope}:latest`);
  assert.equal(options[1]?.requestKey, `community-feed:${scope}:latest`);
  assert.equal(options[2]?.requestKey, `community-feed:${scope}:hot`);
  assert.equal(new Set(options.slice(3).map((o) => o.requestKey)).size, 6);
  assert.ok(options.every((o) => o.authenticated === true)); // optional reads use shared login refresh for likedByMe
});

test('community read request keys isolate page scopes while remaining stable within one page', async () => {
  const options: RequestOptions[] = [];
  const service = createCommunityService(async (input) => {
    options.push(input);
    return { ok: true, value: input.path.endsWith(`/${id}`) ? detail : { items: [], nextCursor: null } };
  });
  await service.listPosts({ sort: 'latest', requestScope: 'feed-a' });
  await service.listPosts({ sort: 'latest', requestScope: 'feed-b' });
  await service.listPosts({ sort: 'latest', requestScope: 'feed-a', cursor });
  await service.loadPost(id, 'detail-a');
  await service.loadPost(id, 'detail-b');
  await service.listComments({ postId: id, requestScope: 'detail-a' });
  await service.listReplies({ postId: id, parentCommentId: '1', requestScope: 'detail-a' });
  assert.deepEqual(options.map((value) => value.requestKey), [
    'community-feed:feed-a:latest', 'community-feed:feed-b:latest', 'community-feed:feed-a:latest',
    `community-detail:detail-a:${id}`, `community-detail:detail-b:${id}`,
    `community-comments:detail-a:${id}`, `community-replies:detail-a:${id}:1`,
  ]);
});

test('community read inputs reject missing or unsafe page scopes before transport', async () => {
  let sent = 0;
  const service = createCommunityService(async () => { sent++; return { ok: true, value: { items: [], nextCursor: null } }; });
  for (const bad of [undefined, '', 'contains:colon', 'has space', '../escape', 'x'.repeat(65)]) {
    assert.equal((await service.listPosts({ sort: 'latest', requestScope: bad as string })).ok, false);
    assert.equal((await service.loadPost(id, bad as string)).ok, false);
    assert.equal((await service.listComments({ postId: id, requestScope: bad as string })).ok, false);
    assert.equal((await service.listReplies({ postId: id, parentCommentId: '1', requestScope: bad as string })).ok, false);
  }
  assert.equal(sent, 0);
});

test('community writes retain caller submission key across network and auth retry; reactions and deletes need none', async () => {
  const options: RequestOptions[] = [];
  const key = createSubmissionKey();
  assert.match(key, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.notEqual(key, createSubmissionKey());
  const service = createCommunityService(async (input) => {
    options.push(input);
    if (options.length === 1) return { ok: false, error: { kind: 'unavailable', code: 'NETWORK_UNAVAILABLE' } };
    return { ok: true, value: input.path.endsWith('/reports') ? report : input.method === 'POST' ? { ...creation, ...(input.path.endsWith('/comments') ? { postId: id, publishedAt: null } : {}) } : undefined };
  });
  const submission = { body: '正文', idempotencyKey: key };
  assert.equal((await service.createPost(submission)).ok, false);
  assert.equal((await service.createPost(submission)).ok, true);
  assert.equal((await service.createComment({ ...submission, postId: id, parentCommentId: null })).ok, true);
  assert.equal((await service.reportTarget({ targetType: 'POST', targetId: id, reasonCode: 'SPAM', idempotencyKey: key })).ok, true);
  await service.deletePost(id); await service.deleteComment('2');
  await service.setReaction({ targetType: 'POST', targetId: id, liked: true });
  await service.setReaction({ targetType: 'COMMENT', targetId: '2', liked: false });
  assert.ok(options.slice(0, 4).every((o) => o.idempotencyKey === key));
  assert.ok(options.slice(4).every((o) => o.idempotencyKey === undefined));
  assert.deepEqual(options.slice(4).map((o) => [o.method, o.path]), [['DELETE', `/api/v1/community/posts/${id}`], ['DELETE', '/api/v1/community/comments/2'], ['PUT', `/api/v1/community/posts/${id}/like`], ['DELETE', '/api/v1/community/comments/2/like']]);
  const headers: Record<string, string>[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (o) => {
    headers.push(o.header); o.success({ statusCode: headers.length === 1 ? 401 : 201, data: creation, header: {}, cookies: [] }); return { abort() {} };
  }, () => 'token', async () => true);
  assert.equal((await createCommunityService(client.request).createPost(submission)).ok, true);
  assert.deepEqual(headers.map((h) => h['Idempotency-Key']), [key, key]);
});

test('community rejects malformed request inputs before transport and never creates replacement keys', async () => {
  let sent = 0;
  const service = createCommunityService(async () => { sent++; return { ok: true, value: creation }; });
  const key = createSubmissionKey();
  for (const bad of ['01', '1/like', '9223372036854775808', 1]) {
    assert.equal((await service.loadPost(bad as string, scope)).ok, false);
    assert.equal((await service.deletePost(bad as string)).ok, false);
    assert.equal((await service.listComments({ postId: bad as string, requestScope: scope })).ok, false);
    assert.equal((await service.setReaction({ targetType: 'POST', targetId: bad as string, liked: true })).ok, false);
  }
  for (const bad of ['', 'a'.repeat(65), 'key\r\nX:yes', undefined])
    assert.equal((await service.createPost({ body: '正文', idempotencyKey: bad as string })).ok, false);
  for (const bad of [0, 51, 1.5, NaN]) assert.equal((await service.listPosts({ sort: 'latest', size: bad, requestScope: scope })).ok, false);
  assert.equal((await service.listPosts({ sort: 'latest', cursor: 'x&size=50', requestScope: scope })).ok, false);
  assert.equal((await service.listPosts({ sort: 'unknown' as 'latest', requestScope: scope })).ok, false);
  assert.equal((await service.createPost({ body: '', idempotencyKey: key })).ok, false);
  assert.equal((await service.createComment({ body: 'a'.repeat(1001), postId: id, idempotencyKey: key })).ok, false);
  assert.equal((await service.reportTarget({ targetType: 'POST', targetId: id, reasonCode: 'bad' as 'SPAM', idempotencyKey: key })).ok, false);
  assert.equal((await service.reportTarget({ targetType: 'POST', targetId: id, reasonCode: 'SPAM', note: '😀'.repeat(501), idempotencyKey: key })).ok, false);
  assert.equal(sent, 0);
});

test('community maps safe backend errors including hot expiry while hiding raw messages and propagating superseded', async () => {
  for (const [statusCode, code, kind] of [[409, 'COMMUNITY_HOT_SNAPSHOT_EXPIRED', 'unexpected'], [409, 'IDEMPOTENCY_CONFLICT', 'unexpected'], [404, 'COMMUNITY_POST_NOT_FOUND', 'unexpected'], [403, 'COMMUNITY_USER_RESTRICTED', 'forbidden'], [503, 'COMMUNITY_WRITE_UNAVAILABLE', 'unavailable'], [400, 'INVALID_COMMUNITY_CURSOR', 'validation'], [400, 'COMMUNITY_CONTENT_REJECTED', 'validation'], [429, 'COMMUNITY_RATE_LIMITED', 'rate-limited']] as const) {
    const client = createHttpClient(resolveRuntimeConfig('production'), (o) => { o.success({ statusCode, data: { code, message: 'private internal reason', fieldErrors: {}, traceId: 'private' }, header: {}, cookies: [] }); return { abort() {} }; }, () => 'token');
    assert.deepEqual(await createCommunityService(client.request, () => true).listPosts({ sort: 'hot', requestScope: scope }), { ok: false, error: { kind, code } });
  }
  const superseded: Result<unknown> = { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } };
  assert.deepEqual(await createCommunityService(async () => superseded).loadPost(id, scope), superseded);
  assert.deepEqual(await createCommunityService(async () => ({ ok: true, value: { items: [], nextCursor: 3 } })).listPosts({ sort: 'latest', requestScope: scope }), invalid);
});

test('community error mapping only accepts public code/status pairs and never leaks server text', async () => {
  for (const data of [{ code: 'PRIVATE_INTERNAL_REASON', message: 'secret' }, { code: 'COMMUNITY_HOT_SNAPSHOT_EXPIRED' }, { code: 400 }, null]) {
    const client = createHttpClient(resolveRuntimeConfig('production'), (o) => {
      o.success({ statusCode: 400, data, header: {}, cookies: [] }); return { abort() {} };
    }, () => 'token');
    assert.deepEqual(await createCommunityService(client.request, () => true).listPosts({ sort: 'hot', requestScope: scope }), { ok: false, error: { kind: 'validation', code: 'REQUEST_REJECTED' } });
  }
});

test('post detail preserves safe hidden deleted and missing codes without leaking error content', async () => {
  for (const code of ['COMMUNITY_POST_HIDDEN', 'COMMUNITY_POST_DELETED', 'COMMUNITY_POST_NOT_FOUND']) {
    for (const statusCode of [404, 400]) {
      const client = createHttpClient(resolveRuntimeConfig('production'), (o) => {
        o.success({ statusCode, data: { code, message: 'private hidden body', fieldErrors: { reason: 'internal rule' },
          traceId: 'private', details: { body: 'private hidden body', reasonCode: 'internal rule' } }, header: {}, cookies: [] });
        return { abort() {} };
      });
      assert.deepEqual(await createCommunityService(client.request, () => false).loadPost(id, scope), statusCode === 404
        ? { ok: false, error: { kind: 'unexpected', code } }
        : { ok: false, error: { kind: 'validation', code: 'REQUEST_REJECTED' } });
    }
  }
});

test('community feed cancellation is isolated per page scope and supersedes only the same page and sort', async () => {
  const pending: TransportOptions[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (o) => { pending.push(o); return { abort() {} }; }, () => 'token');
  const service = createCommunityService(client.request, () => true);
  const first = service.listPosts({ sort: 'latest', requestScope: `${scope}-one` });
  const otherPage = service.listPosts({ sort: 'latest', requestScope: `${scope}-two` });
  const hot = service.listPosts({ sort: 'hot', requestScope: `${scope}-one` });
  const second = service.listPosts({ sort: 'latest', requestScope: `${scope}-one` });
  assert.deepEqual(await first, { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } });
  for (const o of pending) o.success({ statusCode: 200, data: { items: [], nextCursor: null }, header: {}, cookies: [] });
  assert.equal((await otherPage).ok, true); assert.equal((await hot).ok, true); assert.equal((await second).ok, true);
});

test('same post detail reads in different page scopes do not cancel each other', async () => {
  const pending: TransportOptions[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (o) => { pending.push(o); return { abort() {} }; }, () => 'token');
  const service = createCommunityService(client.request, () => true);
  const first = service.loadPost(id, `${scope}-one`);
  const second = service.loadPost(id, `${scope}-two`);
  pending.forEach((o) => o.success({ statusCode: 200, data: detail, header: {}, cookies: [] }));
  assert.ok((await first).ok); assert.ok((await second).ok);
});

test('community detail, comment pages and reply roots never cancel unrelated in-flight reads', async () => {
  const pending: TransportOptions[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (o) => { pending.push(o); return { abort() {} }; }, () => 'token');
  const service = createCommunityService(client.request, () => true);
  const requests = [service.loadPost(id, `${scope}-one`), service.loadPost('2', `${scope}-two`),
    service.listComments({ postId: id, cursor: null, requestScope: `${scope}-comments-one` }), service.listComments({ postId: id, cursor, requestScope: `${scope}-comments-two` }),
    service.listReplies({ postId: id, parentCommentId: '1', requestScope: `${scope}-reply-one` }), service.listReplies({ postId: id, parentCommentId: '2', requestScope: `${scope}-reply-two` })];
  pending.forEach((o, i) => o.success({ statusCode: 200, data: i < 2 ? { ...detail, id: i === 0 ? id : '2' } : { items: [], nextCursor: null }, header: {}, cookies: [] }));
  assert.ok((await Promise.all(requests)).every((r) => r.ok));
});

test('community rejects a valid DTO for the wrong requested target and pages larger than requested', async () => {
  const service = createCommunityService(async (o) => ({ ok: true, value: o.path.includes('?') ? { items: [summary, summary], nextCursor: null } : detail }));
  assert.deepEqual(await service.loadPost('2', scope), invalid);
  assert.deepEqual(await service.listPosts({ sort: 'latest', size: 1, requestScope: scope }), invalid);
});

test('community public reads work anonymously and attach bearer only for shared authenticated session', async () => {
  const headers: Record<string, string>[] = [];
  const client = createHttpClient(resolveRuntimeConfig('production'), (o) => {
    headers.push(o.header); o.success({ statusCode: 200, data: { items: [], nextCursor: null }, header: {}, cookies: [] }); return { abort() {} };
  }, () => 'token');
  let loggedIn = false;
  const service = createCommunityService(client.request, () => loggedIn);
  assert.equal((await service.listPosts({ sort: 'latest', requestScope: scope })).ok, true);
  assert.equal(headers[0]?.Authorization, undefined);
  loggedIn = true;
  assert.equal((await service.listPosts({ sort: 'latest', requestScope: scope })).ok, true);
  assert.equal(headers[1]?.Authorization, 'Bearer token');
});

test('community restriction errors strictly preserve safe mute expiry and permanent ban details', async () => {
  const error = async (details: unknown) => {
    const client = createHttpClient(resolveRuntimeConfig('production'), (o) => {
      o.success({ statusCode: 403, data: { code: 'COMMUNITY_USER_RESTRICTED', message: 'private reason', fieldErrors: {}, traceId: 'private', details }, header: {}, cookies: [] }); return { abort() {} };
    }, () => 'token');
    return createCommunityService(client.request).createPost({ body: 'text', idempotencyKey: 'stable-key' });
  };
  for (const details of [{ restrictionKind: 'MUTE', endsAt: time }, { restrictionKind: 'MUTE', endsAt: null }, { restrictionKind: 'BAN', endsAt: null }])
    assert.deepEqual(await error(details), { ok: false, error: { kind: 'forbidden', code: 'COMMUNITY_USER_RESTRICTED', details } });
  for (const details of [null, [], { restrictionKind: 'MUTE' }, { endsAt: time }, { restrictionKind: 'MUTED', endsAt: time },
    { restrictionKind: 'BAN', endsAt: time }, { restrictionKind: 'MUTE', endsAt: '2026-02-30T00:00:00Z' },
    { restrictionKind: 'MUTE', endsAt: 1 }, { restrictionKind: 'BAN', endsAt: null, reasonCode: 'private' },
    { restrictionKind: 'BAN', endsAt: null, accountId: '1' }])
    assert.deepEqual(await error(details), { ok: false, error: { kind: 'forbidden', code: 'COMMUNITY_USER_RESTRICTED' } });
});
