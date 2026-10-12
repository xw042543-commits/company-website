import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const miniappRoot = new URL('../miniprogram/', import.meta.url);
const source = (path: string) => readFileSync(new URL(path, miniappRoot), 'utf8');

test('messages presents notifications as an editorial timeline instead of a boxed list', () => {
  const template = source('pages/messages/index.wxml');
  const styles = source('pages/messages/index.wxss');

  assert.match(template, /messages-masthead/);
  assert.match(template, /message-thread/);
  assert.match(template, /message-category-mark/);
  assert.match(styles, /\.message-thread\s*\{[^}]*position:\s*relative/s);
  assert.doesNotMatch(styles, /\.message-list\s*\{[^}]*border:/s);
});

test('account uses the same editorial rhythm without wrapping navigation in a card', () => {
  const template = source('pages/account/index.wxml');
  const styles = source('pages/account/index.wxss');

  assert.match(template, /account-watermark/);
  assert.match(template, /journey-heading/);
  assert.match(template, /menu-marker/);
  assert.match(styles, /\.menu-row\s*\{[^}]*position:\s*relative/s);
  assert.doesNotMatch(styles, /\.menu-card\s*\{[^}]*box-shadow:/s);
});
