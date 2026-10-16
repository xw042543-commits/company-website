import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { programmeCards, describeError } from '../miniprogram/utils/planning-agent-state';
import type { Plan } from '../miniprogram/services/planning-agent';
import { buildSync } from 'esbuild';
import { demoPlan, demoFacts } from './planning-agent-demo';

// Local, synthetic visual fixtures only. Renders the shipped WXML/WXSS; no API/model calls.
Object.defineProperty(globalThis, 'Page', { value: () => {} });
const { createPlanningAgentPage } = await import('../miniprogram/pages/planning-agent/index');
const base = createPlanningAgentPage().data!;
const previewId = '00000000-0000-4000-8000-000000000001';
const plan: Plan = demoPlan({ version: 1, facts: demoFacts });
const ready = { ...base, loading: false, available: true, sessionId: previewId, profileVersion: 1, backgroundSummary: '本科 · 计算机 · 2027 入学',
  messages: [{ id: 1, text: '想了解计算机专业（示例）' }], state: 'ready', plan, cards: programmeCards(plan), steps: ['下一步，补充成绩与语言情况。'] };
const fixtures: Record<string, object> = {
  welcome: { ...base, loading: false, available: true, sessionId: previewId, privacyVersion: 'preview-v1' },
  ready, unavailable: { ...base, loading: false }, onboarding: { ...base, loading: false, available: true, privacyVersion: 'preview-v1', consentOpen: true },
  profile: { ...base, loading: false, available: true, sessionId: previewId, formOpen: true, messages: [{ id: 1, text: '想先看看适合我的专业。' }] }, polling: { ...ready, state: 'polling', plan: null, cards: [], steps: [] },
  failed: { ...ready, state: 'failed', error: describeError('STRUCTURED_INPUT_REQUIRED'), plan: null, cards: [] },
  empty: { ...ready, plan: { ...plan, programmes: [] }, cards: [] },
  handoff: { ...ready, savedPlanId: previewId, shareOpen: true }, share: { ...ready, savedPlanId: previewId, shareOpen: true },
  snapshot: { ...ready, isSnapshot: true, savedPlanId: 'preview-only', warnings: ['来源数据已变化，此处保留保存时的内容。'] },
  long: { ...ready, cards: programmeCards({ ...plan, programmes: [{ ...plan.programmes[0]!, programmeNameZh: '计算机科学与人工智能系统及跨学科数据研究国际联合培养荣誉学士（长名称预览）', universityNameZh: '示例国际科技与创新研究大学联合学院（长名称预览）' }] }) },
};
interface Node { tag: string; attrs: Record<string, string>; children: Array<Node | string> }
const decode = (value: string) => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
function parse(source: string) {
  const root: Node = { tag: 'root', attrs: {}, children: [] }; const stack = [root];
  for (const token of source.match(/<\/?[\w-]+(?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^']*'))?)*\s*\/?>|[^<]+/g) ?? []) {
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (!token.startsWith('<')) { stack.at(-1)!.children.push(token); continue; }
    const tag = token.match(/^<([\w-]+)/)![1]!; const attrs: Record<string, string> = {};
    for (const match of token.matchAll(/\s+([\w:-]+)(?:="([^"]*)")?/g)) attrs[match[1]!] = decode(match[2] ?? '');
    const node = { tag, attrs, children: [] }; stack.at(-1)!.children.push(node); if (!token.endsWith('/>')) stack.push(node);
  } return root.children;
}
const escape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const evaluate = (expression: string, scope: Record<string, unknown>) => Function('scope', `with(scope){return (${expression})}`)(scope);
const expression = (value: string) => value.replace(/^{{|}}$/g, '');
const interpolate = (value: string, scope: Record<string, unknown>) => value.replace(/{{([\s\S]*?)}}/g, (_, expr) => escape(evaluate(expr, scope)));
function render(nodes: Array<Node | string>, scope: Record<string, unknown>): string {
  let matched = false;
  return nodes.map(node => {
    if (typeof node === 'string') return interpolate(node, scope);
    const a = node.attrs;
    if (a['wx:for']) { const attrs = { ...a }; delete attrs['wx:for']; return (evaluate(expression(a['wx:for']), scope) as unknown[]).map((item, index) => render([{ ...node, attrs }], { ...scope, [a['wx:for-item'] ?? 'item']: item, index })).join(''); }
    if ('wx:if' in a) { matched = !!evaluate(expression(a['wx:if']!), scope); if (!matched) return ''; }
    else if ('wx:elif' in a) { if (matched) return ''; matched = !!evaluate(expression(a['wx:elif']!), scope); if (!matched) return ''; }
    else if ('wx:else' in a) { if (matched) return ''; matched = true; }
    if (node.tag === 'block') return render(node.children, scope);
    const tag = ({ view: 'div', text: 'span', image: 'img', 'scroll-view': 'div', picker: 'div', 'checkbox-group': 'div', checkbox: 'input' } as Record<string, string>)[node.tag] ?? node.tag;
    let attrs = Object.entries(a).filter(([key]) => ['class', 'style', 'src', 'placeholder', 'value', 'maxlength', 'aria-label'].includes(key) || key.startsWith('data-') || key.startsWith('bind')).map(([key, value]) => ` ${key.startsWith('bind') ? 'data-' + key : key}="${interpolate(value, scope)}"`).join('');
    if (node.tag === 'checkbox') attrs += ' type="checkbox"';
    if (a.disabled && evaluate(expression(a.disabled), scope)) attrs += ' disabled';
    if (a.checked && evaluate(expression(a.checked), scope)) attrs += ' checked';
    if (node.tag === 'picker') { const labels = evaluate(expression(a.range!), scope) as Array<string | Record<string, unknown>>; const selected = Number(evaluate(expression(a.value || '0'), scope));
      return `<select class="answer-input"${attrs}>${labels.map((label, index) => `<option value="${index}"${index === selected ? ' selected' : ''}>${escape(typeof label === 'object' ? label[a['range-key']!] : label)}</option>`).join('')}</select>`; }
    return `<${tag}${attrs}>${['input', 'img'].includes(tag) ? '' : (tag === 'textarea' ? interpolate(a.value ?? '', scope) : render(node.children, scope)) + `</${tag}>`}`;
  }).join('');
}
const template = parse(readFileSync('miniprogram/pages/planning-agent/index.wxml', 'utf8'));
const css = ['styles/tokens.wxss', 'pages/planning-agent/index.wxss'].map(path => readFileSync(`miniprogram/${path}`, 'utf8')).join('\n')
  .replace(/(^|\n)page(?=\s*\{)/g, '$1.phone').replace(/([\d.]+)rpx/g, (_, value) => `calc(${Number(value)} * var(--rpx))`).replace(/\.source text/g, '.source span').replace(/\.privacy-copy text/g, '.privacy-copy span').replace(/\.consent text/g, '.consent span').replace(/\.consent checkbox/g, '.consent input')
  .replace(/([\s>])text(?=[:\s.{])/g, '$1span').replace(/\.welcome-title text/g, '.welcome-title span')
  + '\nbody > .phone{height:calc(100dvh - 72px)}.programme-image{object-fit:cover}.sheet-scroll{overflow:auto}';
mkdirSync('.preview', { recursive: true });
const renderer = `const escape=${escape.toString()},evaluate=${evaluate.toString()},expression=${expression.toString()},interpolate=${interpolate.toString()};const render=${render.toString()};const template=${JSON.stringify(template)};`;
const browser = buildSync({ stdin: { contents: `
import { createPlanningAgentPage } from './miniprogram/pages/planning-agent/index';
import { createPlanningDemo, demoFacts } from './scripts/planning-agent-demo';
import { attachDemoInputBridge } from './scripts/planning-demo-input-bridge';
${renderer}
const fixtures=${JSON.stringify(fixtures)};
const state=new URLSearchParams(location.search).get('state');
const demo=createPlanningDemo({delayMs:700});let page;let pendingSample=false;let historyOpen=false;let composing=false;
function makePage(){
 const definition=createPlanningAgentPage({api:demo.api,session:demo.session,storage:demo.storage,navigate:async url=>{
  if(url==='/pages/plans/index'){historyOpen=true;await drawHistory();return;}
  page.setData({menuOpen:false,notice:'演示模式：此入口只展示导航位置，不会打开线上目录或提交咨询。请使用本页的背景、方案与模拟交接流程。'});
 }});
 page={...definition,data:structuredClone(definition.data),setData(patch){Object.assign(this.data,patch);draw();}};
 attachDemoInputBridge(page);
 window.previewPage=page;page.onLoad({});
}
async function resetDemo(){if(page)page.onUnload();await demo.reset();pendingSample=false;historyOpen=false;composing=false;document.querySelector('[data-demo-fail]').textContent='模拟下次失败';document.getElementById('demo-history').hidden=true;makePage();await page.load();}
function fillSample(){const targetLevel=document.querySelector('[data-demo-level]').value;const education=targetLevel==='MASTER'?'BACHELOR':targetLevel==='DOCTOR'?'MASTER':'HIGH_SCHOOL';page.showProfile({...demoFacts,targetLevel,education,qualification:education});page.setData({formOpen:true,profileReview:true,profileConsent:false,notice:'预设背景已填入，请核对后确认。费用只是统一模拟数值，不代表各学历的真实学费或学制。'});}
async function drawHistory(){
 const result=await demo.api.listPlans();const host=document.getElementById('demo-history');host.hidden=!historyOpen;
 if(!historyOpen)return;
 host.innerHTML='<div class="demo-history-head"><strong>本页内存中的演示方案</strong><button data-demo-close-history>返回对话</button></div>'+(result.ok&&result.value.length?result.value.map((saved,index)=>'<button class="demo-saved" data-demo-plan="'+escape(saved.planId)+'">演示方案 '+(index+1)+' · 查看快照</button>').join(''):'<p>还没有保存的演示方案。保存后可在这里查看；刷新或重置后清空。</p>');
}
// Preview-only wording makes the real controller's outcomes explicitly simulated.
function demoCopy(html){return html
 .replaceAll('AI 辅助 · 以院校核实信息为准','演示模式 · 预设数据 · 不是真实 AI')
 .replaceAll('我们会保存对话和你确认的背景，并将必要的结构化教育信息提供给经审核的 AI 服务。请勿在对话中填写姓名、电话、证件号或个人经历。','本演示仅在当前页面内存中保存输入，不调用 AI、不联网、不提交咨询。请使用虚构信息；刷新或点击“重置演示”将清空。')
 .replaceAll('保存方案和向顾问分享都会另行征求确认。你可以删除对话和方案；已确认的咨询有独立处理周期。AI 辅助不代表录取承诺。','院校、专业、费用和来源均为虚构。本页只演示背景确认、生成、保存与顾问交接操作。')
 .replaceAll('按你确认的背景，先看这份专业清单。条件和费用会逐项核对。','以下为按预设规则展示的虚构方案，不是真实 AI 生成。条件与费用仅用于演示。')
 .replaceAll('AI 规划','演示规划').replaceAll('生成方案','生成演示方案')
 .replaceAll('已核验范围','模拟范围').replaceAll('招生要求待核实','演示条件 · 未经核实')
 .replaceAll('费用合计','模拟费用合计')
 .replaceAll('暂无可安全打开的来源链接，请向院校核实。','模拟来源，无官方链接；本页数据不可用于申请。')
 .replaceAll('核验 2026-10-15','模拟日期 2026-10-15')
 .replaceAll('方案已保存，可在“我的方案”查看。','演示方案已保存在本页内存，可在“历史方案”查看；刷新或重置即清空。')
 .replaceAll('保存当前背景和方案快照，以后可以在历史方案中查看。','仅在本页内存保存演示快照；刷新或重置即清空。')
 .replaceAll('方案已保存。','演示方案已保存在本页内存。')
 .replaceAll('把你想问的，一起交给顾问。','模拟交接 · 不提交咨询 · 请填写虚构联系方式。')
 .replaceAll('我确认上方摘要，同意提交以上资料并由顾问联系。咨询有独立处理周期，删除对话、方案或账号不会自动删除已提交咨询。','我确认上方演示摘要，继续模拟顾问交接；不会提交任何资料，也不会有顾问联系。')
 .replaceAll('发送上方背景摘要、选定项目和你填写的资料，不发送聊天记录。','仅在本页模拟确认，不发送背景、项目、聊天记录或联系方式。')
 .replaceAll('确认提交咨询','确认模拟交接').replaceAll('咨询已提交，顾问将通过你填写的方式联系。','模拟交接已完成。没有提交咨询，也不会有顾问联系。')
 .replaceAll('咨询已提交','模拟交接完成（未提交）').replaceAll('回执：','演示回执：');}
function draw(){
 if(page.data.state==='sending')document.querySelector('[data-demo-fail]').textContent='模拟下次失败';
 const root=document.getElementById('preview-root');const oldScroll=root.querySelector('.agent-scroll')?.scrollTop||0;
 const active=document.activeElement;const key=active?.dataset?.key;const handler=active?.dataset?.bindinput;const position=active?.selectionStart;
 const next=document.createElement('div');next.innerHTML=demoCopy(render(template,page.data));patchChildren(root,next);
 const scroll=root.querySelector('.agent-scroll');if(scroll)scroll.scrollTop=oldScroll;
 if(handler){const input=Array.from(root.querySelectorAll('[data-bindinput]')).find(el=>el.dataset.bindinput===handler&&el.dataset.key===key);if(input){input.focus();if(typeof position==='number'&&input.setSelectionRange)input.setSelectionRange(position,position);}}
}
// Reconcile the template output without replacing a connected text input on each keystroke.
// This is a native-renderer compatibility bridge, not an alternate business state machine.
function patchChildren(current,next){
 const desired=Array.from(next.childNodes);
 desired.forEach((fresh,index)=>{
  const node=current.childNodes[index];
  if(!node){current.appendChild(fresh.cloneNode(true));return;}
  if(node.nodeType!==fresh.nodeType||node.nodeName!==fresh.nodeName){node.replaceWith(fresh.cloneNode(true));return;}
  if(node.nodeType===3){if(node.nodeValue!==fresh.nodeValue)node.nodeValue=fresh.nodeValue;return;}
  for(const attr of Array.from(node.attributes))if(!fresh.hasAttribute(attr.name))node.removeAttribute(attr.name);
  for(const attr of Array.from(fresh.attributes))if(node.getAttribute(attr.name)!==attr.value)node.setAttribute(attr.name,attr.value);
  if(node.matches('input,textarea,select')){
   if(node.type==='checkbox')node.checked=fresh.hasAttribute('checked');
   else if(node.value!==fresh.value)node.value=fresh.value;
   if(!node.matches('select'))return;
  }
  patchChildren(node,fresh);
 });
 while(current.childNodes.length>desired.length)current.lastChild.remove();
}
makePage();if(state&&fixtures[state]){page.setData(fixtures[state]);page.setData({notice:'当前是静态状态样例；点击“重置演示”开始完整流程。'});}else{void page.load();}draw();
async function dispatch(event,kind){
 const el=event.target.closest('[data-'+kind+']');if(!el||el.disabled)return;
 const method=el.dataset[kind];if(typeof page[method]!=='function')return;
 let value=event.target.value;
 if(kind==='bindchange'&&event.target.type==='checkbox')value=event.target.checked?['yes']:[];
 await page[method]({currentTarget:{dataset:{...el.dataset}},detail:{value}});
 if(method==='start'&&pendingSample&&page.data.sessionId){pendingSample=false;fillSample();}
}
document.addEventListener('click',async event=>{
 if(event.target.closest('[data-demo-reset]')){await resetDemo();return;}
 if(event.target.closest('[data-demo-fail]')){demo.failNextRun();event.target.closest('[data-demo-fail]').textContent='已设置下次失败';page.setData({notice:'下一次发送或生成将模拟网络失败，可使用页面的重试按钮。'});return;}
 if(event.target.closest('[data-demo-sample]')){if(page.data.busy||['sending','polling'].includes(page.data.state))return;if(page.data.isSnapshot)await resetDemo();if(!page.data.sessionId){pendingSample=true;page.beginPlanning();}else fillSample();return;}
 if(event.target.closest('[data-demo-close-history]')){historyOpen=false;await drawHistory();return;}
 const saved=event.target.closest('[data-demo-plan]');if(saved){historyOpen=false;await drawHistory();page.setData({menuOpen:false,formOpen:false,shareOpen:false,saveOpen:false});await page.loadSaved(saved.dataset.demoPlan);return;}
 if(event.target.closest('[data-demo-history]')){historyOpen=true;await drawHistory();return;}
 void dispatch(event,'bindtap');
});
document.addEventListener('input',event=>dispatch(event,'bindinput'));
document.addEventListener('change',event=>dispatch(event,'bindchange'));
document.addEventListener('compositionstart',()=>{composing=true;});
document.addEventListener('compositionend',()=>{composing=false;});
document.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing&&!composing&&event.keyCode!==229&&event.target.matches('.composer-input')){event.preventDefault();void page.send();}});
`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, write: false, platform: 'browser', format: 'iife', target: 'es2022',
  banner: { js: '/* eslint-disable -- Generated local preview bundle, sources are linted separately. */\nglobalThis.Page=()=>{};globalThis.wx={setClipboardData:()=>{},showModal:options=>{const confirm=window.confirm("演示模式 · 仅操作本页内存\\n"+options.title+"\\n"+options.content);options.success?.({confirm,cancel:!confirm});},showToast:()=>{}};' } });
writeFileSync('.preview/planning-agent.js', browser.outputFiles[0]!.text);
writeFileSync('.preview/planning-agent.html', `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>留学规划 · 交互演示</title><style>*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:#f5f6f3}button,input,textarea,select{font-family:inherit}button{border:0;cursor:pointer}input{min-width:0}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #65776a;outline-offset:3px}.preview-label{min-height:32px;font-size:11px;display:flex;align-items:center;justify-content:center;background:#f1f3ef;color:#465442;padding:8px;text-align:center}.demo-toolbar{min-height:72px;display:flex;flex-wrap:wrap;max-width:430px;margin:auto;padding:6px 12px;align-items:center;justify-content:center;gap:12px;font-size:12px;background:#f1f3ef}.demo-toolbar button{background:transparent;color:#445a49;padding:8px 0}.phone{--rpx:calc(min(100vw,430px) / 750);width:min(100%,430px);height:calc(100dvh - 112px);margin:0 auto;background:#fff;position:relative}.native-title{height:52px;text-align:center;padding:13px;font-size:18px;font-weight:550}.preview-root{height:calc(100% - 52px)}.agent-scroll{overflow-y:auto}.consent input{width:20px;height:20px;accent-color:#252724;flex-shrink:0}.answer-input{outline-offset:2px}.demo-history{position:absolute;inset:52px 0 0;z-index:20;background:#fff;padding:24px;overflow:auto;font-size:14px;line-height:1.8}.demo-history[hidden]{display:none}.demo-history-head{display:flex;justify-content:space-between;gap:12px}.demo-history button{background:transparent;color:#445a49;padding:12px 0}.demo-saved{display:block;width:100%;text-align:left;border-bottom:1px solid #eee}${css}\nbody > .phone{height:calc(100dvh - 112px)}.demo-toolbar select{font-size:12px;border:0;background:transparent;color:#445a49}.demo-toolbar button{min-height:28px}</style><div class="preview-label">预设模拟 · 不联网 · 非真实 AI · 不提交咨询</div><div class="demo-toolbar"><select data-demo-level aria-label="示例目标学历"><option value="FOUNDATION">预科</option><option value="BACHELOR" selected>本科</option><option value="MASTER">硕士</option><option value="DOCTOR">博士</option></select><button data-demo-sample>填入示例</button><button data-demo-fail>模拟下次失败</button><button data-demo-history>本页历史方案</button><button data-demo-reset>重置演示</button></div><section class="phone"><div class="native-title">留学规划</div><div id="preview-root" class="preview-root"></div><aside id="demo-history" class="demo-history" hidden></aside></section><script src="planning-agent.js"></script></html>`);
console.log('Generated template-derived interactive preview: miniapp/.preview/planning-agent.html?state=welcome|profile|ready|handoff (plus other fixture states). No API/model calls or real-device verification.');

// Keep the old controller fixture accessible without making its form the default.
writeFileSync('.preview/planning-agent-legacy.html', readFileSync('.preview/planning-agent.html'));
const chatBundle = buildSync({ entryPoints: ['scripts/planning-chat-browser.ts'], bundle: true, write: false, platform: 'browser', format: 'iife', target: 'es2022', banner: { js: '/* eslint-disable -- Generated browser bundle; scripts/planning-chat-*.ts sources are linted separately. */' } });
writeFileSync('.preview/planning-chat.js', chatBundle.outputFiles[0]!.text);
writeFileSync('.preview/planning-agent.html', readFileSync('scripts/planning-chat-preview.html'));
console.log('Default preview: chat-first, local scripted replies. No miniapp runtime changes.');
