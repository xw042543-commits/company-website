// Run from miniapp after Maven CommunityPostReaderContractTest (requires server output).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePostPage, parsePostDetail, parseMyPostPage } from '../miniapp/miniprogram/services/community.ts';
import { loadCommunityModerationQueue, loadCommunityModerationDetail } from '../frontend/src/lib/adviser-community-api.ts';

const cases = JSON.parse(readFileSync(new URL('../backend/target/community-reader-contract.json', import.meta.url), 'utf8'));
// Frozen v1 exact-key gates from 1d5b99c. Value validators are unchanged for these legacy fields.
const legacyKeys = {
  legacyFeed: ['id', 'authorName', 'authorAvatarUrl', 'bodyPreview', 'commentCount', 'likeCount', 'publishedAt', 'likedByMe'],
  legacyDetail: ['id', 'authorName', 'authorAvatarUrl', 'body', 'commentCount', 'likeCount', 'publishedAt', 'likedByMe', 'ownedByMe'],
  legacyPersonal: ['id', 'body', 'status', 'statusMessage', 'createdAt', 'publishedAt', 'commentCount', 'likeCount'],
};
for (const row of cases) {
  for (const [key, keys] of Object.entries(legacyKeys)) {
    const root = row[key];
    const item = key === 'legacyDetail' ? root : root.items[0];
    assert.deepEqual(Object.keys(item).sort(), [...keys].sort(), `${key}: installed v1 reader field gate`);
  }
  assert.equal(parsePostPage(row.legacyFeed).ok, true);
  assert.equal(parsePostDetail(row.legacyDetail).ok, true);
  assert.equal(parseMyPostPage(row.legacyPersonal).ok, true);
  const feed = parsePostPage(row.campusFeed);
  const detail = parsePostDetail(row.campusDetail);
  const personal = parseMyPostPage(row.campusPersonal);
  assert.equal(feed.ok, true);
  assert.equal(detail.ok, true);
  assert.equal(personal.ok, true);
  if (feed.ok && detail.ok && personal.ok) {
    assert.equal(feed.value.items[0]?.title, row.expectedTitle);
    assert.equal(detail.value.title, row.expectedTitle);
    assert.equal(personal.value.items[0]?.title, row.expectedTitle);
    assert.equal(detail.value.category, 'STUDY');
  }
  const sendQueue = async () => Response.json(row.adviserQueue);
  const sendDetail = async () => Response.json(row.adviserDetail);
  assert.equal((await loadCommunityModerationQueue('https://example.test', {}, sendQueue)).status, 'ready');
  assert.equal((await loadCommunityModerationDetail('https://example.test', 'POST', '42', {}, sendDetail)).status, 'ready');
}
console.log(`${cases.length} serialized server cases passed across legacy, campus and adviser readers`);
