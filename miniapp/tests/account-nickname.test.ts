/* eslint-disable @typescript-eslint/no-explicit-any -- Native Page harness. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createAccountPage } from '../miniprogram/pages/account/index';

function fixture(save: any) {
  let account = { id: 1, displayName: '旧昵称', avatarUrl: null, bindingStatus: 'LINKED' };
  const session: any = { getSnapshot: () => ({ status: 'authenticated', account }),
    updateAccount: (next: typeof account) => { account = next; } };
  const definition: any = createAccountPage({ session, saveNickname: save, toast: () => {} });
  const page: any = { ...definition, data: structuredClone(definition.data), setData(value: any) { Object.assign(this.data, value); } };
  return { page, account: () => account };
}
const submit = (nickname: string) => ({ detail: { value: { nickname } } });

test('nickname sheet counts characters and clears keyboard offset when closed', async () => {
  const f = fixture(async () => ({ ok: false }));
  await f.page.editNickname();
  assert.equal(f.page.data.nicknameCount, 3);
  f.page.nicknameInput({ detail: { value: '小王🌱' } });
  assert.equal(f.page.data.nicknameCount, 3);
  f.page.nicknameKeyboard({ detail: { height: 280 } });
  assert.equal(f.page.data.nicknameKeyboardHeight, 280);
  f.page.closeNickname();
  assert.equal(f.page.data.nicknameKeyboardHeight, 0);
});

test('nickname form uses submitted native value and publishes account only after success', async () => {
  const names: string[] = [];
  const f = fixture(async (displayName: string) => { names.push(displayName); return { ok: true, value: { id: 1, displayName, avatarUrl: null, bindingStatus: 'LINKED' } }; });
  await f.page.editNickname();
  assert.equal(f.page.data.nicknameOpen, true);
  await f.page.saveNickname(submit('微信选择的昵称'));
  assert.deepEqual(names, ['微信选择的昵称']);
  assert.equal(f.account().displayName, '微信选择的昵称');
  assert.equal(f.page.data.nicknameOpen, false);
});

test('failed nickname save retains draft and old account, allowing retry', async () => {
  const f = fixture(async () => ({ ok: false, error: { kind: 'unavailable', code: 'OFFLINE' } }));
  await f.page.editNickname(); await f.page.saveNickname(submit('新昵称'));
  assert.equal(f.account().displayName, '旧昵称');
  assert.equal(f.page.data.nicknameDraft, '新昵称');
  assert.equal(f.page.data.nicknameOpen, true);
  assert.equal(f.page.data.nicknameSaving, false);
  assert.ok(f.page.data.nicknameError);
});

test('duplicate saves are ignored while request is pending', async () => {
  let finish!: (value: any) => void; let count = 0;
  const f = fixture(() => { count++; return new Promise(resolve => { finish = resolve; }); });
  await f.page.editNickname();
  const pending = f.page.saveNickname(submit('新昵称'));
  await f.page.saveNickname(submit('另一个昵称')); f.page.closeNickname();
  assert.equal(count, 1); assert.equal(f.page.data.nicknameOpen, true);
  finish({ ok: false, error: { kind: 'unavailable', code: 'OFFLINE' } }); await pending;
});
