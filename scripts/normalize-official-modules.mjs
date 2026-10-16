import {readFile,writeFile} from 'node:fs/promises';
import {courseModuleFingerprint} from './course-module-fingerprint.mjs';
const [input,backupDirectory,output,baselineFixture]=process.argv.slice(2);
const baseline=baselineFixture?new Map(JSON.parse(await readFile(baselineFixture,'utf8')).records.map(r=>[r.programmeCode,r.modules])):null;
if(!input||!backupDirectory||!output)throw new Error('用法：node scripts/normalize-official-modules.mjs <审核JSON> <专业备份目录> <输出JSON>');
const audit=JSON.parse(await readFile(input,'utf8'));
function normalize(m){
 const module=structuredClone(m);let title=module.nameEn.replace(/^\s*\d{1,3}[.)]\s+/,'').replace(/^\*+\s*/,'').replace(/\*+\s*$/,'').trim();
 if(/^Elective (?:University )?Courses?\s*[:(]/i.test(title)){
  const code=title.match(/\b([A-Z]{2,6}\d{3,5}[A-Z]?)\s+(?:\(KIAR\)\s*)?(.+)$/);
  const faculty=title.match(/^Elective Courses?\s*:\s*Faculty Course\s*[-–]\s*(.+)$/i);
  if(code){module.courseCode=code[1];title=code[2].trim();module.requirement='Elective';}
  else if(faculty){title=faculty[1].trim();module.requirement='Elective';}
  else return null;
 }
 if(/^(?:Faculty Open Elective|Faculty Elective|Free Elective|Elective(?: Course| Module)?(?:\s*\d+)?|Foreign Language Course|Core Modules?|Compulsory University Courses?)$/i.test(title)
  || /^(?:Kursus Elektif|Pilih\b|Sila\b)|\b(?:rujuk senarai|pilih \d|SHE[ _-]*Cluster|Technology\s*\/\s*Artificial Intelligence and Data Analytics)/i.test(title))return null;
 if(/^(?:(?:external )?faculty|department|discipline|university|univerity|programme|program|free|open)\s+electives?\b|^Elective\s+(?:Courses?|Modules?|Subjects?)(?:\b|_)|^Stream\s+\d+\b/i.test(title)||['Measurement of Advanced','Sinography and Chinese Ancient'].includes(title))return null;
 if(!title||!module.evidence.includes(title))return null;
 module.nameEn=title;module.descriptionEn=null;module.descriptionZh=null;
 return module;
}
let excluded=0;let conflicts=0;
for(const r of audit.records){
 const original=JSON.parse(await readFile(`${backupDirectory}/${r.programmeCode}.json`,'utf8'));
 r.expectedCourseFingerprint=courseModuleFingerprint(baseline?.get(r.programmeCode)??original.sections.find(s=>s.type==='CURRICULUM')?.courseModules??[]);
 if(r.status!=='VERIFIED')continue;
 let expectedLevel=null;const n=r.programmeNameEn||'';
 if(/^(?:Bachelor|BSc|BEng|BA\b|BBA\b)/i.test(n))expectedLevel='BACHELOR';
 else if(/^(?:Master|MSc\b|MBA\b|MPhil\b|MA\b)/i.test(n))expectedLevel='MASTER';
 else if(/^(?:PhD\b|Doctor of Philosophy|Doctor of Business|Doctor of Education|Doctor of Engineering)/i.test(n))expectedLevel='DOCTOR';
 else if(/^Diploma/i.test(n))expectedLevel='DIPLOMA';else if(/^Foundation/i.test(n))expectedLevel='FOUNDATION';
 r.ownership={universitySlug:r.universitySlug,programmeNameEn:original.nameEn,programmeNameZh:original.nameZh,studyLevelCode:original.studyLevelCode,
  expectedOfficialLevel:expectedLevel,campus:null,campusVerification:'官网页面未提供可独立核实的校区字段；未跨来源合并课程'};
 if(expectedLevel&&original.studyLevelCode!==expectedLevel){r.rejectedCourseCandidates=r.modules;r.modules=[];r.status='PENDING';r.failureClass='OWNERSHIP';r.reason='现有学历层次与官网专业名称冲突，课程先隐藏，未修改专业字段';conflicts++;continue;}
 const unique=new Map();r.excludedSourceCandidates=[];
 for(const source of r.modules){const cleaned=normalize(source);if(!cleaned){r.excludedSourceCandidates.push(source);excluded++;continue;}
  const choices=cleaned.nameEn.split(/\s+OR\s+/i);
  for(const choice of choices){const name=choice.replace(/^[*\s/]+|[*\s/]+$/g,'').replace(/\s*\((?:Malaysian|International)\)\s*$/i,'').trim();
   if(!name||/^Foreign Language Course$/i.test(name))continue;
   const alternative={...cleaned,nameEn:name,requirement:choices.length>1?'OR':cleaned.requirement};
   const key=(alternative.courseCode||'')+'|'+alternative.nameEn.toLowerCase();if(!unique.has(key))unique.set(key,alternative);}}
 r.modules=[...unique.values()];if(!r.modules.length){r.status='PENDING';r.reason='未找到可确认的具体课程名称';}
}
await writeFile(output,JSON.stringify(audit,null,2));
console.log(JSON.stringify({excludedNonCourseItems:excluded,levelConflicts:conflicts,officialModules:audit.records.reduce((n,r)=>n+r.modules.length,0)}));
