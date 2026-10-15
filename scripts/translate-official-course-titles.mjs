import{readFile,writeFile,mkdir}from'node:fs/promises';
import path from 'node:path';
const [input,cacheFile]=process.argv.slice(2);if(!input||!cacheFile)throw new Error('用法：node scripts/translate-official-course-titles.mjs <清洗审核JSON> <译名缓存JSON>');
await mkdir(path.dirname(cacheFile),{recursive:true});
const audit=JSON.parse(await readFile(input,'utf8'));
const names=[...new Set(audit.records.flatMap(r=>r.modules.flatMap(m=>[m.nameEn,m.nameEn.match(/^(.+?)\s+(I{1,3}|IV|VI|VII|VIII|IX|X|V|[1-9])$/)?.[1]].filter(Boolean))))].sort();
const file=cacheFile;let cache={};try{cache=JSON.parse(await readFile(file,'utf8'));}catch{}
const pending=names.filter(n=>!cache[n]);const chunks=[];let chunk=[];let chars=0;
for(const name of pending){if(chunk.length>=35||chars+name.length>3500){chunks.push(chunk);chunk=[];chars=0;}chunk.push(name);chars+=name.length+1;}if(chunk.length)chunks.push(chunk);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let done=0;
async function translate(batch){const url=new URL('https://translate.googleapis.com/translate_a/single');for(const[k,v]of Object.entries({client:'gtx',sl:'auto',tl:'zh-CN',dt:'t',q:batch.join('\n')}))url.searchParams.set(k,v);
 for(let attempt=0;attempt<3;attempt++){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok){if(response.status===429||response.status>=500){await sleep((attempt+1)*2500);continue;}throw new Error(`HTTP ${response.status}`);}const json=await response.json();const translated=json[0].map(r=>r[0]??'').join('').trim().split(/\n+/).map(s=>s.trim());
 if(translated.length!==batch.length){if(batch.length===1)throw new Error('Translation alignment mismatch');for(const name of batch)await translate([name]);return;}
 batch.forEach((name,i)=>cache[name]={nameZh:translated[i],provider:'google_translate',translatedAt:new Date().toISOString(),source:name});return;}throw new Error('translation service exhausted retries');}
async function worker(){for(;;){const batch=chunks.shift();if(!batch)return;try{await translate(batch);}catch(e){console.log(JSON.stringify({error:e.message,names:batch}));}done+=batch.length;if(done%140===0)console.log(JSON.stringify({processed:done,total:pending.length}));await writeFile(file,JSON.stringify(cache,null,2));await sleep(300);}}
await Promise.all([worker(),worker()]);await writeFile(file,JSON.stringify(cache,null,2));console.log(JSON.stringify({uniqueNames:names.length,translations:Object.keys(cache).length,missing:names.filter(n=>!cache[n]).length}));
