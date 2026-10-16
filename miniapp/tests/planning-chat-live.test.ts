import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatDemo } from '../scripts/planning-chat-demo';

test('live reply replaces scripted reply and retries without duplicate user turn', async () => {
  let attempts = 0;
  const chat = createChatDemo(() => {}, 0, async (text: string) => {
    assert.equal(text, '计算机硕士');
    if (++attempts === 1) throw new Error('请登录管理员账号');
    return '真实目录结果 · 待核实';
  });
  await chat.send('计算机硕士');
  assert.match(chat.state.error, /登录/);
  assert.equal(chat.state.messages.length, 1);
  await chat.retry();
  assert.equal(chat.state.messages.length, 2);
  assert.match(chat.state.messages[1]!.text, /真实目录/);
});

test('reset ignores an in-flight live result and does not disturb new reply', async () => {
  const resolvers: Array<(value:string)=>void> = [];
  const chat = createChatDemo(() => {}, 0, () => new Promise<string>(r => { resolvers.push(r); }));
  const pending = chat.send('硕士');
  await new Promise(r => setTimeout(r, 10));
  chat.reset();
  const next = chat.send('博士');
  await new Promise(r => setTimeout(r, 10));
  resolvers[0]!('旧结果'); await pending;
  assert.equal(chat.state.busy,true);
  assert.deepEqual(chat.state.messages,[{role:'user',text:'博士'}]);
  resolvers[1]!('新结果'); await next;
  assert.equal(chat.state.messages[1]!.text,'新结果');
  assert.equal(chat.state.busy, false);
});
