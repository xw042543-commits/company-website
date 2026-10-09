import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  applyFeedPage,
  canDeleteOwnedContent,
  canUseCommunityWrite,
  codePointLength,
  createSubmissionState,
  editSubmission,
  finishSubmission,
  prepareSubmission,
  mergeCommunityItems,
  restrictionCopy,
  shouldRestartHotFeed,
  statusCopy,
  unwrapCommunityRoute,
} from '../miniprogram/utils/community-ui.ts';

const root = new URL('../miniprogram/', import.meta.url);

test('registers all community pages while keeping U圈 as the third tab', async () => {
  const app = JSON.parse(await readFile(new URL('app.json', root), 'utf8')) as {
    pages: string[]; tabBar: { list: Array<{ pagePath: string }> };
  };
  assert.ok(app.pages.includes('pages/circle-detail/index'));
  assert.ok(app.pages.includes('pages/circle-compose/index'));
  assert.ok(app.pages.includes('pages/circle-me/index'));
  assert.equal(app.tabBar.list[2]?.pagePath, 'pages/circle/index');
});

test('feed ignores stale results, deduplicates append and guards a concurrent load-more', () => {
  const current = [{ id: '1' }, { id: '2' }];
  assert.deepEqual(applyFeedPage({ activeRequest: 4, resultRequest: 3, current, incoming: [{ id: '3' }], reset: false }), {
    applied: false, items: current,
  });
  assert.deepEqual(applyFeedPage({ activeRequest: 4, resultRequest: 4, current, incoming: [{ id: '2' }, { id: '3' }], reset: false }), {
    applied: true, items: [{ id: '1' }, { id: '2' }, { id: '3' }],
  });
  assert.deepEqual(applyFeedPage({ activeRequest: 4, resultRequest: 4, current, incoming: [{ id: '4' }], reset: false, loadingMore: true }), {
    applied: false, items: current,
  });
});

test('hot snapshot expiry restarts only a cursor continuation from the first page', () => {
  const expired = { kind: 'unexpected' as const, code: 'COMMUNITY_HOT_SNAPSHOT_EXPIRED' };
  assert.equal(shouldRestartHotFeed('hot', 'signed.cursor', expired), true);
  assert.equal(shouldRestartHotFeed('hot', null, expired), false);
  assert.equal(shouldRestartHotFeed('latest', 'signed.cursor', expired), false);
  assert.equal(shouldRestartHotFeed('hot', 'signed.cursor', { ...expired, code: 'IDEMPOTENCY_CONFLICT' }), false);
});

test('submission key survives uncertain and authentication retries and resets only after a completed edit', () => {
  let state = createSubmissionState('原文');
  state = prepareSubmission(state, () => 'stable-key');
  assert.equal(state.key, 'stable-key');
  state = finishSubmission(state, 'uncertain');
  assert.equal(prepareSubmission(state, () => 'replacement').key, 'stable-key');
  state = finishSubmission(state, 'authentication');
  assert.equal(prepareSubmission(state, () => 'replacement').key, 'stable-key');
  state = finishSubmission(state, 'completed');
  assert.equal(editSubmission(state, '原文').key, 'stable-key');
  assert.equal(editSubmission(state, '修改后').key, null);
});

test('a changed request fingerprint always receives a new key after an uncertain attempt', () => {
  let state = prepareSubmission(editSubmission(createSubmissionState(), 'post:one'), () => 'first-key');
  state = finishSubmission(state, 'uncertain');
  assert.equal(prepareSubmission(editSubmission(state, 'post:one'), () => 'unused').key, 'first-key');
  state = editSubmission(state, 'post:two');
  assert.equal(prepareSubmission(state, () => 'second-key').key, 'second-key');

  let report = prepareSubmission(editSubmission(createSubmissionState(), 'POST:7:SPAM:'), () => 'report-one');
  report = finishSubmission(report, 'uncertain');
  report = editSubmission(report, 'POST:7:SCAM:');
  assert.equal(prepareSubmission(report, () => 'report-two').key, 'report-two');
});

test('community text limits count Unicode code points rather than UTF-16 units', () => {
  assert.equal(codePointLength('A😀B'), 3);
  assert.equal(codePointLength('😀'.repeat(2000)), 2000);
  assert.equal(codePointLength('😀'.repeat(2001)), 2001);
});

test('anonymous reads remain possible while every write boundary requires an authenticated session', () => {
  assert.equal(canUseCommunityWrite('anonymous'), false);
  assert.equal(canUseCommunityWrite('unknown'), false);
  assert.equal(canUseCommunityWrite('authenticated'), true);
});

test('reply continuation deduplicates by ID and personal deletion needs API-proven ownership', () => {
  assert.deepEqual(mergeCommunityItems([{ id: '1', body: 'old' }], [{ id: '1', body: 'new' }, { id: '2', body: 'next' }]), [
    { id: '1', body: 'new' }, { id: '2', body: 'next' },
  ]);
  const owned = new Set(['2']);
  assert.equal(canDeleteOwnedContent('1', owned), false);
  assert.equal(canDeleteOwnedContent('2', owned), true);
});

test('navigation consumes Result values and never navigates with an invalid route', () => {
  assert.equal(unwrapCommunityRoute({ ok: true, value: '/pages/circle/index' }), '/pages/circle/index');
  assert.equal(unwrapCommunityRoute({ ok: false, error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' } }), null);
});

test('restriction and personal status copy are fixed and never use backend text', () => {
  assert.equal(restrictionCopy({ restrictionKind: 'BAN', endsAt: null }), '你的账号已被永久限制参与U圈互动。');
  assert.match(restrictionCopy({ restrictionKind: 'MUTE', endsAt: '2026-10-09T10:00:00Z' }), /^你暂时无法参与U圈互动，限制至/);
  assert.equal(restrictionCopy(null), '暂时无法完成此操作，请稍后重试。');
  assert.deepEqual(['PUBLISHED', 'PENDING_REVIEW', 'HIDDEN', 'DELETED', 'REJECTED'].map(statusCopy), [
    '已发布', '审核中', '内容暂不可公开展示', '已删除', '内容未通过审核',
  ]);
});

test('community pages expose required state, reply continuation and safe report contracts', async () => {
  const [feed, feedView, detail, detailView, compose, personal] = await Promise.all([
    readFile(new URL('pages/circle/index.ts', root), 'utf8'),
    readFile(new URL('pages/circle/index.wxml', root), 'utf8'),
    readFile(new URL('pages/circle-detail/index.ts', root), 'utf8'),
    readFile(new URL('pages/circle-detail/index.wxml', root), 'utf8'),
    readFile(new URL('pages/circle-compose/index.ts', root), 'utf8'),
    readFile(new URL('pages/circle-me/index.ts', root), 'utf8'),
  ]);
  assert.match(feed, /REQUEST_SUPERSEDED/);
  assert.match(feed, /shouldRestartHotFeed/);
  for (const state of ['loading', 'empty', 'offline', 'failed']) assert.match(feedView, new RegExp(`state === '${state}'`));
  assert.match(detail, /listCommunityReplies/);
  assert.match(detailView, /加载更多回复/);
  assert.doesNotMatch(detail, /listMyCommunityComments|listMyCommunityPosts/);
  assert.match(compose, /communityPostRoute\(result\.value\.id\)/);
  assert.match(personal, /deleteCommunityPost/);
  assert.match(personal, /deleteCommunityComment/);
  assert.doesNotMatch(feed + detail + compose + personal, /error\.message|reasonCode.*setData/);
});
