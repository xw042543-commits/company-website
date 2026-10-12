import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const root = new URL('../miniprogram/', import.meta.url);

test('community feed retains accessible navigation, recovery and core actions', () => {
  const page = readFileSync(new URL('pages/circle/index.wxml', root), 'utf8');
  const card = readFileSync(new URL('components/community-post-card/index.wxml', root), 'utf8');

  assert.match(page, /class="channel-switch"[^>]*role="tablist"/);
  assert.match(page, /class="editorial-state editorial-state--offline"/);
  assert.match(page, /class="editorial-state editorial-state--failed"/);
  assert.match(page, /class="compose-button"[^>]*bindtap="openCompose"[^>]*aria-label="发布U圈帖子"/);
  assert.match(page, /class="state-retry"[^>]*bindtap="retry"/);

  assert.match(card, /bindtap="open"/);
  assert.match(card, /bindtap="react"/);
  assert.match(card, /bindtap="report"/);
});


test('community composer keeps publishing actionable and applies native input limits', () => {
  const page = readFileSync(new URL('pages/circle-compose/index.wxml', root), 'utf8');

  assert.match(page, /id="post-title"[^>]*maxlength="60"/);
  assert.match(page, /id="post-body"[^>]*maxlength="2000"/);
  assert.match(page, /class="publish-button"[^>]*disabled="{{submitting}}"/);
  assert.doesNotMatch(page, /disabled="{{[^"]*!title/);
  assert.match(page, /帖子标题（必填）/);
  assert.match(page, /帖子正文（必填）/);
});

test('community detail keeps comment submission actionable with native limits', () => {
  const page = readFileSync(new URL('pages/circle-detail/index.wxml', root), 'utf8');

  assert.match(page, /value="{{commentBody}}"[^>]*maxlength="1000"/);
  assert.match(page, /class="submit-button"[^>]*disabled="{{submittingComment}}"[^>]*bindtap="submitComment"/);
  assert.doesNotMatch(page, /disabled="{{[^"]*!commentBody/);
  assert.match(page, /value="{{reportNote}}"[^>]*maxlength="500"/);
});
