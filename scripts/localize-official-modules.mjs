import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
// Translation is a separate, traceable platform step; never creates a course or alters official evidence.
export function translateModule(module,cache,glossary,checkedAt){
 const source=module.nameEn; const machine=cache[source];
 const reviewed=Object.keys(glossary).find(key=>key.toLowerCase()===source.toLowerCase());
 let nameZh=glossary[reviewed]||machine?.nameZh;
 let method=glossary[reviewed]?'terminology_reviewed':'machine_translation_glossary_checked';
 if(!reviewed){
  const suffix=source.match(/^(.*?)\s+(I{1,3}|IV|VI|VII|VIII|IX|X|V|[1-9])$/);
  if(suffix){
   const baseKey=Object.keys(glossary).find(key=>key.toLowerCase()===suffix[1].toLowerCase());
   const base=glossary[baseKey]||cache[suffix[1]]?.nameZh;
   const numbers={I:'一',II:'二',III:'三',IV:'四',V:'五',VI:'六',VII:'七',VIII:'八',IX:'九',X:'十','1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九'};
   if(base&&/[\u3400-\u9fff]/u.test(base)){nameZh=base+'（'+numbers[suffix[2]]+'）';method=baseKey?'terminology_reviewed':'machine_translation_glossary_checked';}
  }
 }
 if(!nameZh)return null;
 nameZh=nameZh.replace(/最后一年(?:学术)?项目|最后一年的项目/g,'毕业设计').replace(/顶点项目/g,'综合项目')
 .replace(/先进的(?=会计|税务|数学|统计|研究|计算|编程|数据库|烹饪|面包)/g,'高级').trim();
 if(!/[\u3400-\u9fff]/u.test(nameZh)||/参考学习领域|待核实|暂无/.test(nameZh))return null;
 // This collector has not verified unit-level descriptions. Do not invent them.
 if(module.descriptionEn&&!module.descriptionZh) return null;
 return {...module,nameZh,descriptionEn:module.descriptionEn??null,descriptionZh:module.descriptionZh??null,
  translationMethod:method,translationCheckedAt:glossary[reviewed]?checkedAt:(machine?.translatedAt||checkedAt)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [input,cacheFile,output]=process.argv.slice(2);
 if(!input||!cacheFile||!output)throw new Error('用法：node scripts/localize-official-modules.mjs <审核JSON> <译名缓存JSON> <输出JSON>');
 const audit=JSON.parse(await readFile(input,'utf8'));
 const cache=JSON.parse(await readFile(cacheFile,'utf8'));
 const glossary=JSON.parse(await readFile(new URL('./course-module-terminology.json',import.meta.url),'utf8'));
 const checkedAt=new Date().toISOString();let untranslated=0;
 for(const row of audit.records){
  row.translationRejected=[];
  row.modules=row.modules.flatMap(m=>{const result=translateModule(m,cache,glossary,checkedAt);
   if(result)return[result]; row.translationRejected.push(m);untranslated++;return[];});
  if(row.status==='VERIFIED'&&!row.modules.length){row.status='PENDING';row.failureClass='TRANSLATION';row.reason='未取得可确认的中文课程译名，先隐藏';}
 }
 await writeFile(output,JSON.stringify(audit,null,2)+'\n');
 console.log(JSON.stringify({programmes:audit.records.length,translatedModules:audit.records.reduce((n,r)=>n+r.modules.length,0),untranslated}));
}
