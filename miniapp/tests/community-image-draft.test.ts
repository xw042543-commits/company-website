import test from 'node:test';
import assert from 'node:assert/strict';
import { createImageDraftStore } from '../miniprogram/utils/community-image-draft';

test('drafts persist per account and never accept another account file path', () => {
  const values = new Map<string, unknown>(); const removed: string[] = [];
  const store = createImageDraftStore('/private', { get: (key) => values.get(key), set: (key, value) => { values.set(key, value); }, remove: (key) => { values.delete(key); } }, (path) => { removed.push(path); });
  const draft = { title: '标题', body: '正文', category: 'GENERAL', universityId: null, universityName: '', images: [{ path: '/private/community-drafts/1/a.jpg' }], submission: { body: 'fingerprint', key: 'stable-retry', completed: false } };
  store.save(1, draft);
  assert.deepEqual(store.load(1), draft); assert.equal(store.load(2), null);
  assert.throws(() => store.save(1, { ...draft, submission: { body: 'fingerprint', key: 'bad key', completed: false } }));
  assert.throws(() => store.save(2, draft));
  store.clear(1); assert.deepEqual(removed, ['/private/community-drafts/1/a.jpg']); assert.equal(store.load(1), null);
});
test('malformed stored drafts cannot cause arbitrary file deletion', () => {
  const removed: string[] = [];
  const store = createImageDraftStore('/private', { get: () => ({ title: 'a', body: 'b', category: 'GENERAL', universityId: null, universityName: '', images: [{ path: '/private/other-secret' }] }), set: () => undefined, remove: () => undefined }, (path) => { removed.push(path); });
  assert.equal(store.load(1), null); store.clear(1); assert.deepEqual(removed, []);
});
