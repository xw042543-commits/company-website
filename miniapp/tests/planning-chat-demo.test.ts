import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatDemo } from '../scripts/planning-chat-demo';

test('first message gets an answer without profile, age or consent form', async () => {
  const chat = createChatDemo(() => {}, 0);
  await chat.send('我想去马来西亚读硕士，预算十万够吗');
  assert.equal(chat.state.messages.length, 2);
  assert.equal(chat.state.facts.level, '硕士');
  assert.match(chat.state.messages[1]!.text, /币种/);
  assert.doesNotMatch(chat.state.messages[1]!.text, /先填|确认背景|同意并开始/);
});
test('remembers explicit degree and currency without repeating known questions or guessing scores', async () => {
  const chat = createChatDemo(() => {}, 0);
  await chat.send('想读博士');
  await chat.send('预算十万人民币');
  assert.equal(chat.state.facts.level, '博士');
  assert.equal(chat.state.facts.currency, '人民币');
  assert.equal(chat.state.facts.grade, undefined);
  assert.doesNotMatch(chat.state.messages.at(-1)!.text, /什么学历|哪个学历|什么币种/);
  assert.ok((chat.state.messages.at(-1)!.text.match(/？/g) ?? []).length <= 1);
});
test('can see a preliminary direction with no background and skip questions', async () => {
  const chat = createChatDemo(() => {}, 0);
  await chat.send('先给我一个规划方向');
  assert.match(chat.state.messages.at(-1)!.text, /方向|路线/);
  await chat.send('暂时不知道，先跳过');
  assert.doesNotMatch(chat.state.messages.at(-1)!.text, /？|必须|请填写/);
});
test('empty and concurrent sends do not create duplicate turns', async () => {
  const chat = createChatDemo(() => {}, 10);
  await chat.send('  ');
  const first = chat.send('想读本科');
  await chat.send('重复点击');
  await first;
  assert.equal(chat.state.messages.length, 2);
});
test('failure retains one user message and retry answers once', async () => {
  const chat = createChatDemo(() => {}, 0);
  chat.failNext(); await chat.send('本科');
  assert.ok(chat.state.error); assert.equal(chat.state.messages.length, 1);
  await chat.retry(); await chat.retry();
  assert.equal(chat.state.messages.length, 2); assert.equal(chat.state.error, '');
});
test('reset prevents pending reply returning and clears memory', async () => {
  const chat = createChatDemo(() => {}, 10);
  const pending = chat.send('硕士'); chat.reset(); await pending;
  assert.equal(chat.state.messages.length, 0); assert.equal(chat.state.busy, false);
  assert.deepEqual(chat.state.facts, {});
});
test('save is explicit and preserves independent snapshot', async () => {
  const chat = createChatDemo(() => {}, 0);
  await chat.send('本科');
  assert.equal(chat.save(false), false); assert.equal(chat.state.saved.length, 0);
  assert.equal(chat.save(true), true);
  await chat.send('硕士');
  assert.equal(chat.state.saved[0]!.messages.length, 2);
  chat.reset(); assert.equal(chat.state.saved.length, 0);
});
test('current education is not mistaken for target education', async () => {
  const chat = createChatDemo(() => {}, 0);
  await chat.send('我现在读本科');
  assert.equal(chat.state.facts.level, undefined);
  await chat.send('我现在读本科，想申请硕士，预算人民币十万');
  assert.equal(chat.state.facts.level, '硕士');
  assert.doesNotMatch(chat.state.messages.at(-1)!.text, /本科方向/);
});
