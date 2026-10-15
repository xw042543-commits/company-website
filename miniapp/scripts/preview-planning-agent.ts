import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { programmeCards, describeError } from '../miniprogram/utils/planning-agent-state';
import type { Plan } from '../miniprogram/services/planning-agent';
import { buildSync } from 'esbuild';

// Local, synthetic visual fixtures only. Renders the shipped WXML/WXSS; no API/model calls.
Object.defineProperty(globalThis, 'Page', { value: () => {} });
const { createPlanningAgentPage } = await import('../miniprogram/pages/planning-agent/index');
const base = createPlanningAgentPage().data!;
const previewId = '00000000-0000-4000-8000-000000000001';
const plan: Plan = { profileVersion: 1, generalNextSteps: ['PREPARE_LANGUAGE'], programmes: [{
  programmeId: 1, programmeNameZh: '计算机科学（荣誉）学士', programmeNameEn: 'Example programme', universityNameZh: '亚太科技大学（方案为示例）', universityNameEn: 'Asia Pacific University',
  imageUrl: 'https://yangdoujiao.com/universities/campuses/apu-campus.webp',
  classification: 'UNKNOWN', assessment: { eligible: false, alternatives: [[{ field: 'languageTotal', status: 'PROFILE_MISSING', evidenceId: 1 }, { field: 'grade', status: 'EVIDENCE_MISSING', evidenceId: 1 }]] },
  budget: { subtotals: {}, complete: false, missing: ['TUITION', 'LIVING'] }, evidenceIds: [1], ruleSnapshot: null, ruleVersion: null,
  evidenceSnapshot: [{ id: 1, programmeId: 1, factType: 'ADMISSION', sourceUrl: 'https://example.com/preview-only', sourceType: 'OFFICIAL', studentScope: '示例适用范围', intake: '2027', checkedAt: '2026-10-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z' }],
}] };
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
const previewCampus = `data:image/webp;base64,${readFileSync('../frontend/public/universities/campuses/apu-campus.webp').toString('base64')}`;
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
    let attrs = Object.entries(a).filter(([key]) => ['class', 'style', 'src', 'placeholder', 'value', 'maxlength', 'aria-label'].includes(key) || key.startsWith('data-') || key.startsWith('bind')).map(([key, value]) => ` ${key.startsWith('bind') ? 'data-' + key : key}="${interpolate(value, scope).replace('https://yangdoujiao.com/universities/campuses/apu-campus.webp', previewCampus)}"`).join('');
    if (node.tag === 'checkbox') attrs += ' type="checkbox"';
    if (a.disabled && evaluate(expression(a.disabled), scope)) attrs += ' disabled';
    if (a.checked && evaluate(expression(a.checked), scope)) attrs += ' checked';
    if (node.tag === 'picker') { const labels = evaluate(expression(a.range!), scope) as string[]; const selected = Number(evaluate(expression(a.value || '0'), scope));
      return `<select class="answer-input"${attrs}>${labels.map((label, index) => `<option value="${index}"${index === selected ? ' selected' : ''}>${escape(label)}</option>`).join('')}</select>`; }
    return `<${tag}${attrs}>${['input', 'img'].includes(tag) ? '' : (tag === 'textarea' ? interpolate(a.value ?? '', scope) : render(node.children, scope)) + `</${tag}>`}`;
  }).join('');
}
const template = parse(readFileSync('miniprogram/pages/planning-agent/index.wxml', 'utf8'));
const css = ['styles/tokens.wxss', 'pages/planning-agent/index.wxss'].map(path => readFileSync(`miniprogram/${path}`, 'utf8')).join('\n')
  .replace(/(^|\n)page(?=\s*\{)/g, '$1.phone').replace(/([\d.]+)rpx/g, (_, value) => `calc(${Number(value)} * var(--rpx))`).replace(/\.source text/g, '.source span').replace(/\.privacy-copy text/g, '.privacy-copy span').replace(/\.consent text/g, '.consent span').replace(/\.consent checkbox/g, '.consent input')
  .replace(/([\s>])text(?=[:\s.{])/g, '$1span').replace(/\.welcome-title text/g, '.welcome-title span')
  + '\nbody > .phone{height:calc(100dvh - 32px)}.programme-image{object-fit:cover}.sheet-scroll{overflow:auto}';
mkdirSync('.preview', { recursive: true });
const renderer = `const escape=${escape.toString()},evaluate=${evaluate.toString()},expression=${expression.toString()},interpolate=${interpolate.toString()},previewCampus=${JSON.stringify(previewCampus)};const render=${render.toString()};const template=${JSON.stringify(template)};`;
const browser = buildSync({ stdin: { contents: `
import { createPlanningAgentPage } from './miniprogram/pages/planning-agent/index';
${renderer}
const fixtures=${JSON.stringify(fixtures)};
const state=new URLSearchParams(location.search).get('state')||'welcome';
const fixture=fixtures[state]||fixtures.welcome;
const definition=createPlanningAgentPage({
  api:new Proxy({}, {get:()=>async()=>({ok:false,error:{kind:'unavailable',code:'PLANNING_DISABLED'}})}),
  storage:{get:()=>'',set:()=>{},remove:()=>{}},
  navigate:()=>page.setData({notice:'这是本地预览，未打开线上页面。'}),
});
const page={...definition,data:structuredClone({...definition.data,...fixture}),setData(patch){Object.assign(this.data,patch);draw();}};
window.previewPage=page;
function draw(){
 const root=document.getElementById('preview-root');const oldScroll=root.querySelector('.agent-scroll')?.scrollTop||0;
 const active=document.activeElement;const key=active?.dataset?.key;const handler=active?.dataset?.bindinput;const position=active?.selectionStart;
 const next=document.createElement('div');next.innerHTML=render(template,page.data);patchChildren(root,next);
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
page.onLoad({});draw();
function dispatch(event,kind){
 const el=event.target.closest('[data-'+kind+']');if(!el||el.disabled)return;
 const method=el.dataset[kind];if(typeof page[method]!=='function')return;
 let value=event.target.value;
 if(kind==='bindchange'&&event.target.type==='checkbox')value=event.target.checked?['yes']:[];
 page[method]({currentTarget:{dataset:{...el.dataset}},detail:{value}});
}
document.addEventListener('click',event=>dispatch(event,'bindtap'));
document.addEventListener('input',event=>dispatch(event,'bindinput'));
document.addEventListener('change',event=>dispatch(event,'bindchange'));
`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, write: false, platform: 'browser', format: 'iife', target: 'es2022',
  banner: { js: '/* eslint-disable -- Generated local preview bundle, sources are linted separately. */\nglobalThis.Page=()=>{};globalThis.wx={setClipboardData:()=>{},showModal:options=>options.success({confirm:false}),showToast:()=>{}};' } });
writeFileSync('.preview/planning-agent.js', browser.outputFiles[0]!.text);
writeFileSync('.preview/planning-agent.html', `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>留学规划 · 对话预览</title><style>*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:#fff}button,input,textarea,select{font-family:inherit}button{border:0;cursor:pointer}input{min-width:0}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #65776a;outline-offset:3px}.preview-label{height:32px;font-size:11px;display:flex;align-items:center;justify-content:center;background:#f1f3ef;color:#687063}.phone{--rpx:calc(100vw / 750);width:100%;height:calc(100dvh - 32px);background:#fff}.native-title{height:52px;text-align:center;padding:13px;font-size:18px;font-weight:550}.preview-root{height:calc(100% - 52px)}.agent-scroll{overflow-y:auto}.consent input{width:20px;height:20px;accent-color:#252724;flex-shrink:0}.answer-input{outline-offset:2px}${css}</style><div class="preview-label">示例会话 · 可点击背景步骤 · 不提交数据 · 非微信真机</div><section class="phone"><div class="native-title">留学规划</div><div id="preview-root" class="preview-root"></div></section><script src="planning-agent.js"></script></html>`);
console.log('Generated template-derived interactive preview: miniapp/.preview/planning-agent.html?state=welcome|profile|ready|handoff (plus other fixture states). No API/model calls or real-device verification.');
