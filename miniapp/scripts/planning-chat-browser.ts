import { createChatDemo } from './planning-chat-demo';
const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const input = get<HTMLTextAreaElement>('composer');
const panel = get<HTMLDialogElement>('panel');
let composing = false;
const chat = createChatDemo(draw);
function text(tag: string, value: string, cls = '') { const el = document.createElement(tag); el.textContent = value; el.className = cls; return el; }
function button(label: string, handler: () => void) { const el = document.createElement('button'); el.textContent = label; el.onclick = handler; return el; }
function controls() {
  get<HTMLButtonElement>('send').disabled = chat.state.busy || !!chat.state.error || !input.value.trim();
  input.disabled = chat.state.busy;
  get('save').hidden = !chat.state.messages.some(m => m.role === 'assistant'); get('handoff').hidden = get('save').hidden;
}
function draw() {
  get('welcome').hidden = chat.state.messages.length > 0;
  get('messages').replaceChildren(...chat.state.messages.map(m => text('p', m.text, `message ${m.role}`)));
  if (chat.state.busy) get('messages').append(text('p', '正在准备模拟回复…', 'muted'));
  get('error').hidden = !chat.state.error; get('error-copy').textContent = chat.state.error;
  controls(); get('conversation').scrollTop = get('conversation').scrollHeight;
}
function close() { panel.close(); input.focus(); }
function open(title: string) {
  get('panel-title').textContent = title; get('panel-body').replaceChildren();
  get<HTMLDetailsElement>('menu').open = false; panel.showModal(); get('close').focus(); return get('panel-body');
}
function submit(value = input.value) {
  if (!value.trim() || chat.state.busy || chat.state.error) return;
  input.value = ''; void chat.send(value).then(() => { if (!panel.open) input.focus(); });
}
get('chat-form').addEventListener('submit', event => { event.preventDefault(); if (!composing) submit(); });
input.addEventListener('input', controls);
input.addEventListener('compositionstart', () => { composing = true; });
input.addEventListener('compositionend', () => { composing = false; });
input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !composing && event.keyCode !== 229) { event.preventDefault(); submit(); } });
document.querySelectorAll<HTMLButtonElement>('[data-prompt]').forEach(el => el.onclick = () => submit(el.dataset.prompt));
get('retry').onclick = () => { void chat.retry(); };
get('save').onclick = () => {
  const body = open('保存这次对话');
  body.append(text('p', '仅保存在当前页面，刷新或重置后清空。不是正式留学方案。'));
  body.append(text('p', Object.values(chat.state.facts).join(' · ') || '背景未补充，也可以保存对话。', 'muted'));
  body.append(button('确认保存到本页', () => { if (chat.save(true)) body.replaceChildren(text('p', '已保存在本页历史中。'), button('继续聊天', close)); }));
};
get('history').onclick = () => {
  const body = open('本页历史');
  if (!chat.state.saved.length) body.append(text('p', '还没有保存的对话。聊天后可以选择保存。'));
  chat.state.saved.forEach((item, index) => body.append(button(`对话 ${index + 1} · ${item.messages[0]?.text.slice(0, 28) ?? ''}`, () => body.replaceChildren(text('p', '已保存的模拟对话 · 只读', 'muted'), ...item.messages.map(m => text('p', m.text, `message ${m.role}`))))));
};
get('handoff').onclick = () => {
  const body = open('模拟转顾问');
  body.append(text('p', '仅预览你说过的内容。不填写联系方式、不提交资料，也不会有顾问联系。'), text('p', chat.state.messages.filter(m => m.role === 'user').map(m => m.text).join('\n')));
  body.append(button('确认模拟交接', () => body.replaceChildren(text('p', '模拟交接完成，没有发送任何信息。'), button('继续聊天', close))));
};
get('close').onclick = close;
panel.addEventListener('cancel', event => { event.preventDefault(); close(); });
get('reset').onclick = () => { chat.reset(); input.value = ''; get<HTMLDetailsElement>('menu').open = false; get('failure').textContent = '模拟下次回复失败'; controls(); input.focus(); };
get('failure').onclick = () => { chat.failNext(); get('failure').textContent = '已设置：下次回复失败'; };
draw();
