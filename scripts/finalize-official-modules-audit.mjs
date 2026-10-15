import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateModule} from '../scripts/build-official-modules-import.mjs';
const [auditFile,inputFile,backupDirectory,root]=process.argv.slice(2);
if(!auditFile||!inputFile||!backupDirectory||!root)throw new Error('用法：node scripts/finalize-official-modules-audit.mjs <译名审核JSON> <采集目标JSON> <备份目录> <输出目录>');
const audit=JSON.parse(await readFile(auditFile,'utf8'));
const inputs=JSON.parse(await readFile(inputFile,'utf8'));
const codes=new Set(inputs.records.map(r=>r.programmeCode));
if(audit.records.length!==codes.size)throw new Error('Incomplete coverage');
await mkdir(root,{recursive:true});
const backups=[];const seen=new Set();const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const totals={checkedProgrammes:codes.size,verifiedProgrammes:0,verifiedModuleAssociations:0,officialAddedModules:0,reverifiedExistingTitles:0,hiddenCurriculumSections:0,hiddenLegacyCandidateEntries:0,replacedLegacyCandidateEntries:0,failedProgrammes:0,followupProductionWrites:0,byUniversity:{},failureReasons:{},missingMetadata:{courseCode:0,credits:0,requirement:0,curriculumVersion:0}};
const reasons={PENDING:'官网课程未能逐项核实',ACCESS:'官网访问失败或 robots 规则不允许',PDF:'已获取官方 PDF，尚不能唯一核实专业课程表',OWNERSHIP:'未能确认课程表与当前专业的唯一归属',MODULES:'官网页面未提供已解析核实的课程表',VALIDATION:'导入前逐项校验未通过'};
const records=[];
function legacyNames(section){const text=section?.bodyEn||section?.bodyZh||'';return text.split(/\r?\n/).map(line=>line.match(/^\d{2}\|[^|]+\|(.+)$/)?.[1]||line.trim()).filter(line=>line&&!/^(?:参考|说明[：:]|Illustrative|Note:|Year\s*\d|Semester\s*\d)/i.test(line));}
for(const input of audit.records){
 const row=structuredClone(input);if(!codes.has(row.programmeCode)||seen.has(row.programmeCode))throw new Error('Coverage mismatch');seen.add(row.programmeCode);
 const original=JSON.parse(await readFile(`${backupDirectory}/${row.programmeCode}.json`,'utf8'));
 const sections=original.sections.filter(s=>s.type==='CURRICULUM');const old=sections[0];
 backups.push({programmeCode:row.programmeCode,programmeId:original.id,universitySlug:row.universitySlug,nameZh:original.nameZh,nameEn:original.nameEn,fetchedAt:original.fetchedAt,requestUrl:original.requestUrl,curriculumSections:sections});
 const errors=row.modules.flatMap(m=>validateModule(m,row.universitySlug));const moduleKeys=new Set();const courseCodes=new Map();
 for(const module of row.modules){const key=(module.courseCode||'')+'|'+module.nameEn.toLowerCase();if(moduleKeys.has(key))errors.push('重复课程');moduleKeys.add(key);
 if(module.courseCode){const previous=courseCodes.get(module.courseCode);if(previous&&previous!==module.nameEn)errors.push('同一课程代码对应不同名称');courseCodes.set(module.courseCode,module.nameEn);}}
 if(errors.length){row.rejectedCourseCandidates=row.modules;row.modules=[];row.status='PENDING';row.reason=[...new Set(errors)].join('；');row.failureClass='VALIDATION';}
 if(row.status!=='VERIFIED'&&!row.failureClass){row.failureClass=row.attempts.some(a=>a.pdfPageEvidence?.length)?'PDF':row.attempts.some(a=>a.error)?'ACCESS':row.attempts.some(a=>a.programmeMatched)?'MODULES':'OWNERSHIP';}
 const college=totals.byUniversity[row.universitySlug]??={checked:0,verified:0,modules:0,pending:0};college.checked++;
 const names=legacyNames(old);const keys=new Set(names.map(x=>x.toLowerCase()));
 if(row.status==='VERIFIED'){
  totals.verifiedProgrammes++;college.verified++;college.modules+=row.modules.length;totals.verifiedModuleAssociations+=row.modules.length;
  const newKeys=new Set(row.modules.map(m=>m.nameEn.toLowerCase()));totals.replacedLegacyCandidateEntries+=names.filter(n=>!newKeys.has(n.toLowerCase())).length;
  for(const module of row.modules){if(keys.has(module.nameEn.toLowerCase()))totals.reverifiedExistingTitles++;else totals.officialAddedModules++;
   for(const key of Object.keys(totals.missingMetadata))if(module[key]==null)totals.missingMetadata[key]++;}
 }else{totals.failedProgrammes++;college.pending++;totals.hiddenCurriculumSections+=sections.length;totals.hiddenLegacyCandidateEntries+=names.length;totals.failureReasons[row.failureClass]=(totals.failureReasons[row.failureClass]||0)+1;}
 // Keep references and hashes in the public report; full official PDF/HTML snapshots remain in the ignored evidence store.
 row.attempts=row.attempts.map(({pdfPageEvidence,...a})=>({...a,pdfPages:pdfPageEvidence?.map(p=>p.page)??[]}));records.push(row);
}
const output={generatedAt:new Date().toISOString(),snapshotAt:inputs.generatedAt,scope:'全部线上已发布专业；线上已发布院校全部为马来西亚',summary:totals,records};
await writeFile(root+'/reviewed-audit.json',JSON.stringify(output,null,2)+'\n');
await writeFile(root+'/source-targets.json',JSON.stringify(inputs,null,2)+'\n');
const originalJson=JSON.stringify({snapshotAt:inputs.generatedAt,records:backups},null,2)+'\n';await writeFile(root+'/original-curricula.json',originalJson);await writeFile(root+'/original-curricula.sha256',createHash('sha256').update(originalJson).digest('hex')+'  original-curricula.json\n');
const courses=[['专业编号','中文译名','官网原始课程名称','课程代码','学分','必修选修原文','官网URL','抓取时间','适用版本'],...records.flatMap(r=>r.modules.map(m=>[r.programmeCode,m.nameZh,m.nameEn,m.courseCode,m.credits,m.requirement,m.sourceUrl,m.sourceCheckedAt,m.curriculumVersion]))];
await writeFile(root+'/official-modules.csv','\uFEFF'+courses.map(r=>r.map(csv).join(',')).join('\n')+'\n');
const failures=[['院校','专业编号','专业英文名','待核实原因','尝试过的官网来源'],...records.filter(r=>r.status!=='VERIFIED').map(r=>[r.universitySlug,r.programmeCode,r.programmeNameEn,r.reason||reasons[r.failureClass],r.attempts.map(a=>a.url+(a.error?' ['+a.error+']':'')).join('\n')])];
await writeFile(root+'/pending-programmes.csv','\uFEFF'+failures.map(r=>r.map(csv).join(',')).join('\n')+'\n');
await mkdir('backend/src/test/resources/fixtures',{recursive:true});await writeFile('backend/src/test/resources/fixtures/official-course-modules-v54.json',JSON.stringify({summary:totals,records:records.map(({programmeCode,universitySlug,programmeNameEn,status,modules,ownership})=>({programmeCode,universitySlug,programmeNameEn,status,modules,ownership}))},null,2));
console.log(JSON.stringify(totals,null,2));
