import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {mapApplicationDetail,mapSummary} from '../miniprogram/services/applications';
import {applicationTimeline} from '../miniprogram/utils/application-timeline';
// Design-only fixtures. This script never writes application data or calls a business API.
const uuid=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const application={id:uuid(1),reference:'APP202409001',universitySlug:'segi-university',universityName:'世纪大学',programmeName:'工商管理学士学位',level:'本科',subject:'BUSINESS',status:'IN_PROGRESS',stage:2,note:'当前阶段正在进行材料初审，需补充材料时，我们会及时通知您。',createdAt:'2024-09-10T09:00:00Z'};
const detail=mapApplicationDetail({application,documents:['护照','成绩单','毕业证','语言成绩'].map((title,index)=>({id:uuid(index+2),title,stage:2,status:index===3?'MISSING':'APPROVED',reviewNote:'',filename:index===3?null:'document.pdf',updatedAt:'2024-09-10T09:00:00Z'})),fees:[],history:[{id:uuid(8),stage:1,message:'材料准备',createdAt:'2024-09-10T09:00:00Z'}]});
if(!detail.ok)throw new Error('Invalid preview fixture');
const items=[mapSummary(application),mapSummary({...application,id:uuid(9),reference:'APP202409002',universitySlug:'asia-pacific-university',universityName:'亚太科技大学',programmeName:'计算机科学学士学位',subject:'COMPUTER SCIENCE',status:'NEEDS_DOCUMENTS'}),mapSummary({...application,id:uuid(10),reference:'APP202409003',universitySlug:'sunway-university',universityName:'双威大学',programmeName:'商业管理硕士',level:'硕士',status:'SUBMITTED'})];
interface Node {tag:string;attrs:Record<string,string>;children:Array<Node|string>}
function parse(source:string){const root:Node={tag:'root',attrs:{},children:[]};const stack=[root];const tokens=source.match(/<\/?[\w-]+(?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^']*'))?)*\s*\/?>|[^<]+/g)??[];
for(const token of tokens){if(token.startsWith('</')){stack.pop();continue;}if(!token.startsWith('<')){stack.at(-1)!.children.push(token);continue;}const tag=token.match(/^<([\w-]+)/)![1]!;const attrs:Record<string,string>={};for(const m of token.matchAll(/\s+([\w:-]+)(?:="([^"]*)")?/g))attrs[m[1]!]=m[2]??'';const node:Node={tag,attrs,children:[]};stack.at(-1)!.children.push(node);if(!token.endsWith('/>'))stack.push(node);}return root.children;}
const escape=(value:unknown)=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const evaluate=(expression:string,scope:Record<string,unknown>)=>Function('scope',`with(scope){return (${expression})}`)(scope);
const expression=(value:string)=>value.replace(/^{{|}}$/g,'');
const interpolate=(value:string,scope:Record<string,unknown>)=>value.replace(/{{([\s\S]*?)}}/g,(_,expr)=>escape(evaluate(expr,scope)));
function render(nodes:Array<Node|string>,scope:Record<string,unknown>):string{let matched=false;return nodes.map(node=>{if(typeof node==='string')return interpolate(node,scope);const a=node.attrs;
if('wx:if'in a){matched=!!evaluate(expression(a['wx:if']!),scope);if(!matched)return '';}
else if('wx:elif'in a){if(matched)return '';matched=!!evaluate(expression(a['wx:elif']!),scope);if(!matched)return '';}
else if('wx:else'in a){if(matched)return '';matched=true;}
if(a['wx:for']){const list=evaluate(expression(a['wx:for']),scope) as unknown[];const attrs={...a};delete attrs['wx:for'];return list.map((item,index)=>render([{...node,attrs}],{...scope,[a['wx:for-item']??'item']:item,index})).join('');}
if(node.tag==='application-card')return render(parse(readFileSync('miniprogram/components/application-card/index.wxml','utf8')),{application:evaluate(expression(a.application!),scope),compact:a.compact?evaluate(expression(a.compact),scope):false,imageFailed:false});
if(node.tag==='block')return render(node.children,scope);
const tag=({view:'div',text:'span',image:'img','scroll-view':'div'} as Record<string,string>)[node.tag]??node.tag;
const attrs=Object.entries(a).filter(([key])=>['class','src','disabled'].includes(key)).map(([key,value])=>` ${key}="${interpolate(value,scope)}"`).join('');
return `<${tag}${attrs}>${tag==='img'?'':render(node.children,scope)+`</${tag}>`}`;}).join('');}
const common={state:'ready',uploading:''};
const list=render(parse(readFileSync('miniprogram/pages/orders/index.wxml','utf8')),{...common,items,filter:'',filters:[{value:'',label:'全部申请'},{value:'IN_PROGRESS',label:'进行中'},{value:'NEEDS_DOCUMENTS',label:'待补充材料'},{value:'COMPLETED',label:'已完成'},{value:'CANCELLED',label:'已取消'}],hasMore:false});
const body=render(parse(readFileSync('miniprogram/pages/application-detail/index.wxml','utf8')),{...common,detail:detail.value,tab:'progress',expanded:2,steps:applicationTimeline(detail.value),tabs:[{key:'progress',label:'申请进度'},{key:'documents',label:'申请材料'},{key:'fees',label:'申请费用'},{key:'history',label:'进度记录'}]});
const css=['components/application-card','pages/orders','pages/application-detail'].map(path=>readFileSync(`miniprogram/${path}/index.wxss`,'utf8')).join('\n').replace(/\bimage\b/g,'img').replace(/>text/g,'>span').replace(/([\d.]+)rpx/g,(_,n)=>`${Number(n)/2}px`);
mkdirSync('.preview',{recursive:true});writeFileSync('.preview/applications.html',`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>我的订单与申请详情 · 设计预览</title><style>*{box-sizing:border-box}body{margin:0;padding:28px;background:#eaf8f1;font-family:system-ui,'Microsoft YaHei',sans-serif;color:#172b3c}h1{font-size:22px;margin:0 0 8px}.caption{margin:0 0 24px;color:#526b62}main{display:flex;gap:32px;align-items:flex-start;justify-content:center;flex-wrap:wrap}.phone{width:390px;max-width:100%;background:white;border-radius:22px;overflow:hidden;box-shadow:0 12px 45px #173c3012}.phone h2{font-size:20px;text-align:center;padding:18px;margin:0}button{font-family:inherit;border:0;cursor:pointer}img{object-fit:contain}.filter-strip{overflow:auto}.detail-page,.orders-page{min-height:0!important}${css}</style><h1>我的订单 / 申请详情</h1><p class="caption">设计预览 · 以下为示例数据，非真实申请。使用小程序页面模板与样式渲染；不代表微信真机验证。</p><main><section class="phone"><h2>我的订单</h2>${list}</section><section class="phone"><h2>申请详情</h2>${body}</section></main></html>`);
