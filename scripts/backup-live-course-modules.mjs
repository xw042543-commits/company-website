import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const [output,base='https://yangdoujiao.com',seedFile='outputs/official-course-modules-20261015/source-targets.json']=process.argv.slice(2);
if(!output)throw new Error('用法：node scripts/backup-live-course-modules.mjs <新备份目录> [API地址] [已有官网目标JSON]');
const origin=new URL(base);if(origin.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('非本机 API 必须使用 HTTPS');
const seed=JSON.parse(await readFile(seedFile,'utf8'));const hints=new Map(seed.records.map(r=>[r.programmeCode,r]));
async function get(route){const url=new URL(route,origin);const r=await fetch(url,{headers:{accept:'application/json','user-agent':'YangdoujiaoCourseAudit/1.0'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`HTTP ${r.status}: ${url}`);return r.json();}
const directory=await get('/api/v1/universities/search?country=MY&page=1&size=48');let schools=[...(directory.items??[])];
for(let p=2;p<=directory.totalPages;p++)schools.push(...(await get(`/api/v1/universities/search?country=MY&page=${p}&size=48`)).items);
await mkdir(path.join(output,'course-backup'),{recursive:true});const rows=[];
for(const u of schools){const first=await get(`/api/v1/universities/${u.slug}/programmes?page=1&size=48`);let programmes=[...first.items];for(let p=2;p<=first.totalPages;p++)programmes.push(...(await get(`/api/v1/universities/${u.slug}/programmes?page=${p}&size=48`)).items);for(const r of programmes)rows.push({...r,universitySlug:u.slug,universityNameEn:u.nameEn});}
const records=[],failures=[],seen=new Set();for(const r of rows){if(!/^[A-Za-z0-9_-]{1,100}$/.test(r.programmeCode))throw new Error('专业编号不能用作安全的备份文件名');if(seen.has(r.programmeCode))throw new Error('重复专业编号，停止备份');seen.add(r.programmeCode);}
async function worker(){for(;;){const r=rows.pop();if(!r)return;try{
 const requestUrl=new URL(`/api/v1/universities/${r.universitySlug}/programmes/${r.id}`,origin).href;const detail=await get(requestUrl);
 if(detail.programmeCode!==r.programmeCode||String(detail.id)!==String(r.id))throw new Error('专业编号与详情响应不一致');
 const previous=hints.get(r.programmeCode);const fetchedAt=new Date().toISOString();
 await writeFile(path.join(output,'course-backup',r.programmeCode+'.json'),JSON.stringify({...detail,universitySlug:r.universitySlug,universityNameEn:r.universityNameEn,fetchedAt,requestUrl},null,2));
 records.push({programmeCode:r.programmeCode,universitySlug:r.universitySlug,nameEn:detail.nameEn,officialNameEn:detail.nameEn||previous?.officialNameEn||null,
 candidateUrls:[...new Set([...(detail.sections??[]).filter(s=>s.type==='CURRICULUM'&&s.sourceType==='official').map(s=>s.sourceUrl),detail.officialUrl,...(previous?.candidateUrls??[])].filter(Boolean))]});
 }catch(error){failures.push({programmeCode:r.programmeCode,universitySlug:r.universitySlug,error:error.message});}}}
await Promise.all(Array.from({length:4},worker));records.sort((a,b)=>a.programmeCode.localeCompare(b.programmeCode));
await writeFile(path.join(output,'source-targets.json'),JSON.stringify({generatedAt:new Date().toISOString(),records},null,2));
await writeFile(path.join(output,'backup-failures.json'),JSON.stringify(failures,null,2));
console.log(JSON.stringify({universities:schools.length,backedUp:records.length,failures:failures.length,productionWrites:0}));
if(failures.length)throw new Error('备份不完整，禁止生成覆盖全量的导入迁移');
